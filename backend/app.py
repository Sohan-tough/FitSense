from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os
import pandas as pd
import numpy as np
import math
from models.model_loader import model_loader

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///fitsense.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
CORS(app, origins=['http://localhost:8080', 'http://localhost:3000', 'http://127.0.0.1:8080', 'http://127.0.0.1:3000'])

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    assessments = db.relationship('Assessment', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'created_at': self.created_at.isoformat()
        }

class Assessment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Personal Information
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    height = db.Column(db.Float, nullable=False)  # in meters
    weight = db.Column(db.Float, nullable=False)    # in kg
    
    # Workout Information
    frequency = db.Column(db.Integer, nullable=False)  # days per week
    duration = db.Column(db.Float, nullable=False)     # hours per day
    
    # Exercise Details (stored as JSON)
    exercises = db.Column(db.Text, nullable=False)  # JSON string of exercises
    
    # ML Predictions (stored as JSON)
    predictions = db.Column(db.Text, nullable=True)  # JSON string of predictions
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        import json
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'age': self.age,
            'gender': self.gender,
            'height': self.height,
            'weight': self.weight,
            'frequency': self.frequency,
            'duration': self.duration,
            'exercises': json.loads(self.exercises) if self.exercises else [],
            'predictions': json.loads(self.predictions) if self.predictions else {},
            'created_at': self.created_at.isoformat()
        }


# Exercise Code Mapping
EXERCISE_CODE_MAP = {
    'Decline Push-ups': 12, 'Bear Crawls': 0, 'Dips': 13, 'Mountain Climbers': 28,
    'Bicep Curls': 2, 'Leg Press': 25, 'Thrusters': 47, 'Turkish Get-ups': 50,
    'Glute Bridges': 18, 'Step-ups': 45, 'Plank': 30, 'Pull-ups': 34,
    'Lunges': 27, 'Plyo Squats': 31, 'Squats': 44, 'Frog Jumps': 17,
    'Deadlifts': 11, 'Prone Cobras': 33, 'Lat Pulldowns': 23, 'Russian Twists': 40,
    'Shoulder Press': 43, 'Tricep Dips': 48, 'Kettlebell Swings': 22, 'Resistance Band Pull-Aparts': 37,
    'Leg Raises': 26, 'Tricep Extensions': 49, 'Dead Bugs': 9, 'Scissors Kicks': 41,
    'Plyometric Push-ups': 32, 'Push Ups': 35, 'Bench Press': 1, 'Inverted Rows': 20,
    'Seated Rows': 42, 'Calf Raises': 8, 'Reverse Lunges': 38, 'Deadlift': 10,
    'Wall Angels': 51, 'Lateral Raises': 24, 'Face Pulls': 15, 'Burpees': 7,
    'Box Jumps': 5, 'Rows': 39, 'Bird Dogs': 4, 'Dragon Flags': 14,
    'Bicycle Crunches': 3, 'Flutter Kicks': 16, 'Bulgarian Split Squats': 6, 'Superman': 46,
    'Incline Push-ups': 19, 'Jumping Jacks': 21, 'Renegade Rows': 36, 'Windshield Wipers': 52,
    'Zottman Curls': 53, 'Pistol Squats': 29
}

# Utility Functions
def ideal_fat_percentage(age: int, gender: str) -> int:
    gender = gender.lower()
    if gender == "male":
        if age <= 25: return 15
        elif age <= 35: return 16
        elif age <= 45: return 17
        elif age <= 55: return 18
        elif age <= 65: return 19
        else: return 20
    else:
        if age <= 25: return 22
        elif age <= 35: return 24
        elif age <= 45: return 25
        elif age <= 55: return 27
        elif age <= 65: return 28
        else: return 30

def calculate_basic_exercise_calories(exercise, weight, duration):
    """Calculate basic calorie burn for individual exercise when ML models are not available"""
    # Basic calculation: distribute total session calories across exercises
    # This is a simplified approach - in reality, different exercises have different intensities
    exercise_name = exercise.get('exercise', '').lower()
    
    # Basic MET values for different exercise types
    met_values = {
        'push': 3.5, 'squat': 4.0, 'deadlift': 5.0, 'plank': 3.0,
        'burpee': 8.0, 'jumping': 6.0, 'running': 7.0, 'cycling': 5.0
    }
    
    # Find matching MET value
    met_value = 3.5  # Default moderate intensity
    for key, value in met_values.items():
        if key in exercise_name:
            met_value = value
            break
    
    # Calculate calories for this exercise (simplified)
    sets = int(exercise.get('sets', 1))
    reps = int(exercise.get('reps', 10))
    total_reps = sets * reps
    
    # Estimate time for this exercise (rough calculation)
    time_per_rep = 3  # seconds per rep (including rest)
    exercise_duration_hours = (total_reps * time_per_rep) / 3600
    
    # Calculate calories: METs × weight(kg) × duration(hours)
    calories = met_value * weight * exercise_duration_hours
    
    return max(calories, 1)  # Ensure minimum 1 calorie

def calculate_basic_calorie_burn(weight, duration, frequency):
    """Calculate basic calorie burn estimate when ML models are not available"""
    # Basic MET calculation: 3.5 METs for moderate exercise
    # Calories = METs × weight(kg) × duration(hours)
    met_value = 3.5  # Moderate intensity exercise
    calories_per_hour = met_value * weight
    return calories_per_hour * duration

def predict_water_intake_for_ideal_fat(assessment_data, predictions):
    """Predict water intake for ideal fat percentage using water_intake_model_tuned"""
    try:
        # Get basic data
        age = int(assessment_data.get('age', 0))
        gender = assessment_data.get('gender', '')
        height = float(assessment_data.get('height', 0))
        weight = float(assessment_data.get('weight', 0))
        duration = float(assessment_data.get('duration', 0))
        
        # Calculate ideal fat percentage
        ideal_fat_pct = ideal_fat_percentage(age, gender)
        
        # Get current fat percentage from predictions
        current_fat_pct = predictions.get('fat_model_tuned', {}).get('prediction', [0])[0] if predictions.get('fat_model_tuned', {}).get('prediction') else ideal_fat_pct
        
        # Calculate the difference between current and ideal fat percentage
        fat_diff = current_fat_pct - ideal_fat_pct
        
        # Get current water intake prediction
        current_water_intake = predictions.get('water_intake_model_tuned', {}).get('prediction', [0])[0] if predictions.get('water_intake_model_tuned', {}).get('prediction') else calculate_basic_water_intake(weight, duration)
        
        # Adjust water intake based on fat percentage difference
        # Higher fat percentage generally requires more water for optimal metabolism
        # For every 1% difference in fat percentage, adjust water intake by 0.05L
        water_adjustment = fat_diff * 0.05
        
        # Calculate ideal water intake
        ideal_water_intake = current_water_intake - water_adjustment
        
        # Ensure minimum water intake (at least 2L per day)
        ideal_water_intake = max(ideal_water_intake, 2.0)
        
        return ideal_water_intake
        
    except Exception as e:
        print(f"Error predicting water intake for ideal fat: {e}")
        return calculate_basic_water_intake(weight, duration)

def calculate_basic_water_intake(weight, duration):
    """Calculate basic water intake when ML models are not available"""
    # Basic calculation: 35ml per kg body weight + additional for exercise
    base_water = weight * 0.035  # 35ml per kg
    exercise_water = duration * 0.5  # Additional 0.5L per hour of exercise
    return base_water + exercise_water

def calculate_calorie_analysis(assessment_data, predictions, duration_days=30):
    """Calculate detailed calorie burn analysis and fat loss recommendations"""
    try:
        # Get basic data
        weight = float(assessment_data.get('weight', 0))
        frequency = int(assessment_data.get('frequency', 0))
        duration = float(assessment_data.get('duration', 0))
        exercises = assessment_data.get('exercises', [])
        age = int(assessment_data.get('age', 0))
        gender = assessment_data.get('gender', '')
        
        # Get predictions with fallback calculations
        fat_percentage = predictions.get('fat_model_tuned', {}).get('prediction', [0])[0] if predictions.get('fat_model_tuned', {}).get('prediction') else ideal_fat_percentage(age, gender)
        total_calories_burned = predictions.get('burnCal_model_tuned', {}).get('prediction', [0])[0] if predictions.get('burnCal_model_tuned', {}).get('prediction') else calculate_basic_calorie_burn(weight, duration, frequency)
        
        # Calculate weekly calories
        weekly_calories = total_calories_burned * frequency if frequency > 0 else 0
        
        # Calculate fat mass analysis
        current_fat_percentage_decimal = fat_percentage / 100
        ideal_fat_pct = ideal_fat_percentage(age, gender)
        ideal_fat_percentage_decimal = ideal_fat_pct / 100
        
        current_fat_mass = current_fat_percentage_decimal * weight
        ideal_fat_mass = ideal_fat_percentage_decimal * weight
        fat_to_lose = current_fat_mass - ideal_fat_mass
        
        # Convert fat to calories (1 kg fat = 7700 kcal)
        calories_to_burn_total = fat_to_lose * 7700
        extra_calories_per_session = (calories_to_burn_total-weekly_calories)/ frequency if frequency > 0 else 0
        
        # Calculate individual exercise calorie burns and rep increases using new hybrid weight logic
        exercise_analysis = []
        if exercises:
            # Step 1: Calculate per rep calorie burn for each exercise
            exercises_with_cal_per_rep = []
            for exercise in exercises:
                if exercise.get('exercise') and exercise.get('sets') and exercise.get('reps'):
                    # Calculate calories for this specific exercise
                    exercise_data = assessment_data.copy()
                    exercise_data['exercises'] = [exercise]  # Only this exercise
                    
                    # Prepare features for this exercise
                    exercise_features = prepare_features(exercise_data, 'burnCal_model_tuned')
                    
                    # Get prediction for this exercise
                    exercise_prediction = None
                    if 'burnCal_model_tuned' in model_loader.list_models():
                        try:
                            exercise_prediction = model_loader.predict('burnCal_model_tuned', exercise_features)
                            if exercise_prediction is not None and len(exercise_prediction) > 0:
                                exercise_calories = float(exercise_prediction[0])
                            else:
                                exercise_calories = calculate_basic_exercise_calories(exercise, weight, duration)
                        except:
                            exercise_calories = calculate_basic_exercise_calories(exercise, weight, duration)
                    else:
                        exercise_calories = calculate_basic_exercise_calories(exercise, weight, duration)
                    
                    # Calculate per rep calorie burn
                    current_sets = int(exercise.get('sets', 0))
                    current_reps = int(exercise.get('reps', 0))
                    total_reps_for_exercise = current_sets * current_reps
                    
                    cal_per_rep = exercise_calories / total_reps_for_exercise if total_reps_for_exercise > 0 else 0
                    
                    exercises_with_cal_per_rep.append({
                        'exercise': exercise.get('exercise'),
                        'current_sets': current_sets,
                        'current_reps': current_reps,
                        'calories_burned': round(exercise_calories, 1),
                        'cal_per_rep': cal_per_rep,
                        'total_reps': total_reps_for_exercise
                    })
            
            # Step 2: Create parameters for hybrid weight calculation
            alpha = 0.5  # weight for calories per rep
            beta = 0.5   # weight for total reps (ease)
            
            # Step 3: Calculate total reps and weight for each exercise
            for e in exercises_with_cal_per_rep:
                # Hybrid weight calculation
                e['weight'] = (e['cal_per_rep'] ** alpha) * (e['total_reps'] ** beta)
            
            # Step 4: Compute total weight
            total_weight = sum(e['weight'] for e in exercises_with_cal_per_rep)
            
            # Step 5: Distribute extra calories based on weight
            for e in exercises_with_cal_per_rep:
                extra_cal_for_ex = extra_calories_per_session * (e['weight'] / total_weight) if total_weight > 0 else 0
                extra_reps = round(extra_cal_for_ex / e['cal_per_rep']) if e['cal_per_rep'] > 0 else 0
                e['extra_reps'] = extra_reps
                e['new_total_reps'] = e['total_reps'] + extra_reps
                e['extra_calories_target'] = round(extra_cal_for_ex, 1)
            
            # Step 6: Calculate duration-based rep distribution
            for e in exercises_with_cal_per_rep:
                # Calculate daily increase using ceiling to ensure we reach the target
                daily_increase = math.ceil(e['extra_reps'] / duration_days) if duration_days > 0 else 0
                e['extra_reps_total'] = e['extra_reps']  # Total extra reps needed
                e['daily_increase'] = daily_increase  # Reps to add per day
                e['target_total_reps'] = e['total_reps'] + e['extra_reps_total']  # Final target
            
            # Step 7: Format results for UI compatibility
            exercise_analysis = []
            for e in exercises_with_cal_per_rep:
                exercise_analysis.append({
                    'exercise': e['exercise'],
                    'current_sets': e['current_sets'],
                    'current_reps': e['current_reps'],
                    'calories_burned': e['calories_burned'],
                    'cal_per_rep': round(e['cal_per_rep'], 3),
                    'total_reps': e['total_reps'],
                    'extra_reps': e['extra_reps'],
                    'new_total_reps': e['new_total_reps'],
                    'extra_calories_target': e['extra_calories_target'],
                    'weight': round(e['weight'], 3),
                    'extra_reps_total': e['extra_reps_total'],
                    'daily_increase': e['daily_increase'],
                    'target_total_reps': e['target_total_reps']
                })
        
        # Calculate water intake for ideal fat percentage
        ideal_water_intake = predict_water_intake_for_ideal_fat(assessment_data, predictions)
        
        return {
            'total_calories_per_session': round(total_calories_burned, 1),
            'weekly_calories': round(weekly_calories, 1),
            'current_fat_percentage': round(fat_percentage, 1),
            'ideal_fat_percentage': ideal_fat_pct,
            'current_fat_mass': round(current_fat_mass, 2),
            'ideal_fat_mass': round(ideal_fat_mass, 2),
            'fat_to_lose': round(fat_to_lose, 2),
            'calories_to_burn_total': round(calories_to_burn_total, 0),
            'extra_calories_per_session': round(extra_calories_per_session, 1),
            'exercise_analysis': exercise_analysis,
            'ideal_water_intake': round(ideal_water_intake, 1)
        }
    except Exception as e:
        print(f"Error in calorie analysis: {e}")
        return {
            'total_calories_per_session': 0,
            'weekly_calories': 0,
            'current_fat_percentage': 0,
            'ideal_fat_percentage': 0,
            'current_fat_mass': 0,
            'ideal_fat_mass': 0,
            'fat_to_lose': 0,
            'calories_to_burn_total': 0,
            'extra_calories_per_session': 0,
            'exercise_analysis': [],
            'ideal_water_intake': 0
        }

# ML Prediction Functions
def make_prediction(model_name: str, assessment_data: dict) -> dict:
    """Make predictions using the specified ML model"""
    try:
        # Convert assessment data to features array
        features = prepare_features(assessment_data, model_name)
        
        # Get the model
        model = model_loader.get_model(model_name)
        if model is None:
            return {"error": f"Model '{model_name}' not found"}
        
        # Make prediction
        prediction = model_loader.predict(model_name, features)
        
        if prediction is not None:
            return {
                "model_name": model_name,
                "prediction": prediction.tolist() if hasattr(prediction, 'tolist') else prediction,
                "features_used": list(features.columns) if hasattr(features, 'columns') else "array"
            }
        else:
            return {"error": "Prediction failed"}
            
    except Exception as e:
        return {"error": f"Prediction error: {str(e)}"}

def prepare_features(assessment_data: dict, model_name: str = None) -> pd.DataFrame:
    """Prepare features from assessment data for ML models"""
    # Height is now already in meters from frontend
    height_m = float(assessment_data.get('height', 0))
    
    # Calculate BMI: weight(kg) / height(m)^2
    weight = float(assessment_data.get('weight', 0))
    bmi = weight / (height_m ** 2) if height_m > 0 else 0
    
    # Gender encoding: 1 for male, 0 for female
    gender_encoded = 1 if assessment_data.get('gender', '').lower() == 'male' else 0
    
    # Get age and gender for ideal fat percentage calculation
    age = int(assessment_data.get('age', 0))
    gender = assessment_data.get('gender', '')
    
    # Calculate ideal fat percentage
    ideal_fat = ideal_fat_percentage(age, gender)
    
    # Get session duration (workout duration)
    session_duration = float(assessment_data.get('duration', 0))
    
    # Prepare features based on model requirements
    if model_name == 'fat_model_tuned':
        # Features for fat_model_tuned.pkl: ['Age', 'Gender', 'Weight (kg)', 'BMI']
        features = {
            'Age': [age],
            'Gender': [gender_encoded],
            'Weight (kg)': [weight],
            'BMI': [bmi]
        }
    elif model_name == 'water_intake_model_tuned':
        # Features for water_intake_model_tuned.pkl: ['Age', 'Height (m)', 'Weight (kg)', 'Gender', 'Fat_Percentage', 'Session_Duration (hours)']
        # Use predicted fat percentage if available, otherwise use ideal fat percentage
        fat_percentage = assessment_data.get('predicted_fat_percentage', ideal_fat)
        
        features = {
            'Age': [age],
            'Height (m)': [height_m],
            'Weight (kg)': [weight],
            'Gender': [gender_encoded],
            'Fat_Percentage': [fat_percentage],
            'Session_Duration (hours)': [session_duration]
        }
    elif model_name == 'burnCal_model_tuned':
        # Features for burnCal_model_tuned.pkl: ['Age', 'Height (m)', 'Weight (kg)', 'Gender', 'Fat_Percentage', 'Session_Duration (hours)', 'Sets', 'Reps', 'Exercise_Code']
        # Use predicted fat percentage if available, otherwise use ideal fat percentage
        fat_percentage = assessment_data.get('predicted_fat_percentage', ideal_fat)
        
        # Calculate total sets and reps from exercises
        exercises = assessment_data.get('exercises', [])
        total_sets = sum(int(ex.get('sets', 0)) for ex in exercises if ex.get('sets'))
        total_reps = sum(int(ex.get('reps', 0)) for ex in exercises if ex.get('reps'))
        
        # Get exercise code (use the first exercise if multiple, or 0 if none)
        exercise_code = 0
        if exercises and len(exercises) > 0 and exercises[0].get('exercise'):
            exercise_name = exercises[0]['exercise']
            exercise_code = EXERCISE_CODE_MAP.get(exercise_name, 0)
        
        features = {
            'Age': [age],
            'Height (m)': [height_m],
            'Weight (kg)': [weight],
            'Gender': [gender_encoded],
            'Fat_Percentage': [fat_percentage],
            'Session_Duration (hours)': [session_duration],
            'Sets': [total_sets],
            'Reps': [total_reps],
            'Exercise_Code': [exercise_code]
        }
    else:
        # Default features for fat_model_tuned
        features = {
            'Age': [age],
            'Gender': [gender_encoded],
            'Weight (kg)': [weight],
            'BMI': [bmi]
        }
    
    return pd.DataFrame(features)


# API Routes

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'FitSense API is running'})

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('email') or not data.get('password') or not data.get('name'):
            return jsonify({'error': 'Email, password, and name are required'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Create new user
        user = User(
            email=data['email'],
            name=data['name']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/validate', methods=['POST'])
def validate_session():
    try:
        data = request.get_json()
        
        if not data or not data.get('user_id'):
            return jsonify({'error': 'User ID is required'}), 400
        
        user = User.query.get(data['user_id'])
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'valid': True,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    try:
        # In a real application, you might want to invalidate server-side sessions
        # For now, we'll just return success since we're using client-side session management
        return jsonify({'message': 'Logged out successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Assessment Routes
@app.route('/api/assessments', methods=['POST'])
def create_assessment():
    try:
        data = request.get_json()
        
        # Debug logging
        print(f"Received assessment data: {data}")
        
        # Validate required fields
        required_fields = ['user_id', 'name', 'age', 'gender', 'height', 'weight', 
                          'frequency', 'duration', 'exercises']
        
        for field in required_fields:
            if not data.get(field):
                print(f"Missing required field: {field}")
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate exercises
        exercises = data.get('exercises', [])
        print(f"Exercises received: {exercises}")
        if not exercises or len(exercises) == 0:
            print("No exercises provided")
            return jsonify({'error': 'At least one exercise is required'}), 400
        
        # Make ML predictions if models are available
        predictions = {}
        available_models = model_loader.list_models()
        fat_percentage_prediction = None
        
        if available_models:
            # First, run fat_model_tuned to get fat percentage prediction
            if 'fat_model_tuned' in available_models:
                fat_prediction_result = make_prediction('fat_model_tuned', data)
                predictions['fat_model_tuned'] = fat_prediction_result
                
                # Extract the fat percentage prediction for water intake model
                if 'prediction' in fat_prediction_result and not fat_prediction_result.get('error'):
                    fat_percentage_prediction = fat_prediction_result['prediction']
                    if isinstance(fat_percentage_prediction, list) and len(fat_percentage_prediction) > 0:
                        fat_percentage_prediction = fat_percentage_prediction[0]
            
            # Then run water_intake_model_tuned with the fat percentage prediction
            if 'water_intake_model_tuned' in available_models:
                # Update assessment data with fat percentage prediction if available
                water_assessment_data = data.copy()
                if fat_percentage_prediction is not None:
                    water_assessment_data['predicted_fat_percentage'] = fat_percentage_prediction
                
                water_prediction_result = make_prediction('water_intake_model_tuned', water_assessment_data)
                predictions['water_intake_model_tuned'] = water_prediction_result
            
            # Then run burnCal_model_tuned with the fat percentage prediction
            if 'burnCal_model_tuned' in available_models:
                # Update assessment data with fat percentage prediction if available
                burnCal_assessment_data = data.copy()
                if fat_percentage_prediction is not None:
                    burnCal_assessment_data['predicted_fat_percentage'] = fat_percentage_prediction
                
                burnCal_prediction_result = make_prediction('burnCal_model_tuned', burnCal_assessment_data)
                predictions['burnCal_model_tuned'] = burnCal_prediction_result
            
            # Run any other models
            for model_name in available_models:
                if model_name not in ['fat_model_tuned', 'water_intake_model_tuned', 'burnCal_model_tuned']:
                    prediction_result = make_prediction(model_name, data)
                    predictions[model_name] = prediction_result
        
        # Add calorie analysis to predictions (always calculate, even if no ML models)
        calorie_analysis = calculate_calorie_analysis(data, predictions)
        predictions['calorie_analysis'] = calorie_analysis
        
        # Check if user already has an assessment - update existing or create new
        import json
        existing_assessment = Assessment.query.filter_by(user_id=data['user_id']).first()
        
        if existing_assessment:
            # Update existing assessment
            existing_assessment.name = data['name']
            existing_assessment.age = int(data['age'])
            existing_assessment.gender = data['gender']
            existing_assessment.height = float(data['height'])
            existing_assessment.weight = float(data['weight'])
            existing_assessment.frequency = int(data['frequency'])
            existing_assessment.duration = float(data['duration'])
            existing_assessment.exercises = json.dumps(exercises)
            existing_assessment.predictions = json.dumps(predictions) if predictions else None
            existing_assessment.created_at = datetime.utcnow()  # Update timestamp
            
            db.session.commit()
            assessment = existing_assessment
            message = 'Assessment updated successfully'
        else:
            # Create new assessment
            assessment = Assessment(
                user_id=data['user_id'],
                name=data['name'],
                age=int(data['age']),
                gender=data['gender'],
                height=float(data['height']),
                weight=float(data['weight']),
                frequency=int(data['frequency']),
                duration=float(data['duration']),
                exercises=json.dumps(exercises),
                predictions=json.dumps(predictions) if predictions else None
            )
            
            db.session.add(assessment)
            db.session.commit()
            message = 'Assessment created successfully'
        
        return jsonify({
            'message': message,
            'assessment': assessment.to_dict(),
            'predictions': predictions,
            'available_models': available_models
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/assessments/<int:user_id>', methods=['GET'])
def get_user_assessments(user_id):
    try:
        assessments = Assessment.query.filter_by(user_id=user_id).order_by(Assessment.created_at.desc()).all()
        
        return jsonify({
            'assessments': [assessment.to_dict() for assessment in assessments]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/assessments/latest/<int:user_id>', methods=['GET'])
def get_latest_assessment(user_id):
    try:
        assessment = Assessment.query.filter_by(user_id=user_id).order_by(Assessment.created_at.desc()).first()
        
        if not assessment:
            return jsonify({'error': 'No assessments found for this user'}), 404
        
        return jsonify({
            'assessment': assessment.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/models', methods=['GET'])
def list_models():
    """List all available ML models"""
    try:
        models = model_loader.list_models()
        return jsonify({
            'models': models,
            'count': len(models)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/models/<model_name>/predict', methods=['POST'])
def predict_with_model(model_name):
    """Make a prediction using a specific model"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Assessment data is required'}), 400
        
        prediction_result = make_prediction(model_name, data)
        
        if 'error' in prediction_result:
            return jsonify(prediction_result), 400
        
        return jsonify(prediction_result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/assessments/update', methods=['PUT'])
def update_assessment():
    """Update existing assessment with new data"""
    try:
        data = request.get_json()
        
        if not data or not data.get('user_id'):
            return jsonify({'error': 'User ID is required'}), 400
        
        # Find existing assessment
        existing_assessment = Assessment.query.filter_by(user_id=data['user_id']).first()
        
        if not existing_assessment:
            return jsonify({'error': 'No assessment found for this user'}), 404
        
        # Update assessment data
        if 'name' in data:
            existing_assessment.name = data['name']
        if 'age' in data:
            existing_assessment.age = int(data['age'])
        if 'gender' in data:
            existing_assessment.gender = data['gender']
        if 'height' in data:
            existing_assessment.height = float(data['height'])
        if 'weight' in data:
            existing_assessment.weight = float(data['weight'])
        if 'frequency' in data:
            existing_assessment.frequency = int(data['frequency'])
        if 'duration' in data:
            existing_assessment.duration = float(data['duration'])
        if 'exercises' in data:
            import json
            existing_assessment.exercises = json.dumps(data['exercises'])
        
        # Recalculate predictions with updated data
        assessment_data = {
            'user_id': existing_assessment.user_id,
            'name': existing_assessment.name,
            'age': existing_assessment.age,
            'gender': existing_assessment.gender,
            'height': existing_assessment.height,
            'weight': existing_assessment.weight,
            'frequency': existing_assessment.frequency,
            'duration': existing_assessment.duration,
            'exercises': json.loads(existing_assessment.exercises)
        }
        
        # Make ML predictions with updated data
        predictions = {}
        available_models = model_loader.list_models()
        fat_percentage_prediction = None
        
        if available_models:
            # First, run fat_model_tuned to get fat percentage prediction
            if 'fat_model_tuned' in available_models:
                fat_prediction_result = make_prediction('fat_model_tuned', assessment_data)
                predictions['fat_model_tuned'] = fat_prediction_result
                
                # Extract the fat percentage prediction for water intake model
                if 'prediction' in fat_prediction_result and not fat_prediction_result.get('error'):
                    fat_percentage_prediction = fat_prediction_result['prediction']
                    if isinstance(fat_percentage_prediction, list) and len(fat_percentage_prediction) > 0:
                        fat_percentage_prediction = fat_percentage_prediction[0]
            
            # Then run water_intake_model_tuned with the fat percentage prediction
            if 'water_intake_model_tuned' in available_models:
                # Update assessment data with fat percentage prediction if available
                water_assessment_data = assessment_data.copy()
                if fat_percentage_prediction is not None:
                    water_assessment_data['predicted_fat_percentage'] = fat_percentage_prediction
                
                water_prediction_result = make_prediction('water_intake_model_tuned', water_assessment_data)
                predictions['water_intake_model_tuned'] = water_prediction_result
            
            # Then run burnCal_model_tuned with the fat percentage prediction
            if 'burnCal_model_tuned' in available_models:
                # Update assessment data with fat percentage prediction if available
                burnCal_assessment_data = assessment_data.copy()
                if fat_percentage_prediction is not None:
                    burnCal_assessment_data['predicted_fat_percentage'] = fat_percentage_prediction
                
                burnCal_prediction_result = make_prediction('burnCal_model_tuned', burnCal_assessment_data)
                predictions['burnCal_model_tuned'] = burnCal_prediction_result
            
            # Run any other models
            for model_name in available_models:
                if model_name not in ['fat_model_tuned', 'water_intake_model_tuned', 'burnCal_model_tuned']:
                    prediction_result = make_prediction(model_name, assessment_data)
                    predictions[model_name] = prediction_result
        
        # Add calorie analysis to predictions (always calculate, even if no ML models)
        calorie_analysis = calculate_calorie_analysis(assessment_data, predictions)
        predictions['calorie_analysis'] = calorie_analysis
        
        # Update predictions
        import json
        existing_assessment.predictions = json.dumps(predictions) if predictions else None
        existing_assessment.created_at = datetime.utcnow()  # Update timestamp
        
        db.session.commit()
        
        return jsonify({
            'message': 'Assessment updated successfully',
            'assessment': existing_assessment.to_dict(),
            'predictions': predictions,
            'available_models': available_models
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/assessments/recalculate', methods=['POST'])
def recalculate_calorie_analysis():
    """Recalculate calorie analysis with custom duration"""
    try:
        data = request.get_json()
        
        if not data or not data.get('assessment_data') or not data.get('predictions'):
            return jsonify({'error': 'Assessment data and predictions are required'}), 400
        
        duration_days = data.get('duration_days', 30)
        
        # Validate duration_days
        if not isinstance(duration_days, (int, float)) or duration_days <= 0:
            return jsonify({'error': 'Duration days must be a positive number'}), 400
        
        # Recalculate calorie analysis with new duration
        calorie_analysis = calculate_calorie_analysis(
            data['assessment_data'], 
            data['predictions'], 
            duration_days
        )
        
        return jsonify({
            'message': 'Calorie analysis recalculated successfully',
            'calorie_analysis': calorie_analysis,
            'duration_days': duration_days
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# User Routes
@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
