import pickle
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor

# Create example models for fat_model_tuned and water_intake_model_tuned
def create_example_models():
    """Create example ML models for testing"""
    
    # Generate sample training data for fat_model_tuned
    np.random.seed(42)
    n_samples = 1000
    
    # Features for fat_model_tuned: ['Age', 'Gender', 'Weight (kg)', 'BMI']
    X_fat = np.random.rand(n_samples, 4)
    X_fat[:, 0] = X_fat[:, 0] * 50 + 18  # age: 18-68
    X_fat[:, 1] = np.random.randint(0, 2, n_samples)  # gender: 0=female, 1=male
    X_fat[:, 2] = X_fat[:, 2] * 60 + 50   # weight: 50-110 kg
    X_fat[:, 3] = X_fat[:, 2] / (1.5 + X_fat[:, 0] * 0.01) ** 2  # BMI: weight/height^2
    
    # Create realistic body fat targets
    y_fat = (
        0.3 * X_fat[:, 0] +           # age factor
        0.4 * X_fat[:, 3] +           # BMI factor
        -0.2 * X_fat[:, 1] +          # male factor (males typically have less body fat)
        10 + np.random.normal(0, 3, n_samples)  # noise
    )
    
    # Features for water_intake_model_tuned: ['Age', 'Height (m)', 'Weight (kg)', 'Gender', 'Fat_Percentage', 'Session_Duration (hours)']
    X_water = np.random.rand(n_samples, 6)
    X_water[:, 0] = X_water[:, 0] * 50 + 18  # age: 18-68
    X_water[:, 1] = X_water[:, 1] * 0.5 + 1.5  # height: 1.5-2.0 m
    X_water[:, 2] = X_water[:, 2] * 60 + 50   # weight: 50-110 kg
    X_water[:, 3] = np.random.randint(0, 2, n_samples)  # gender: 0=female, 1=male
    X_water[:, 4] = X_water[:, 4] * 20 + 10   # fat_percentage: 10-30%
    X_water[:, 5] = X_water[:, 5] * 2 + 0.5   # session_duration: 0.5-2.5 hours
    
    # Create realistic water intake targets (in liters)
    y_water = (
        0.035 * X_water[:, 2] +        # base water intake: 35ml per kg
        0.5 * X_water[:, 5] +           # additional water for exercise
        0.1 * X_water[:, 0] * 0.1 +     # age factor
        0.2 * (1 - X_water[:, 3]) +    # female factor (females need slightly more)
        np.random.normal(0, 0.2, n_samples)  # noise
    )
    
    # Features for burnCal_model_tuned: ['Age', 'Height (m)', 'Weight (kg)', 'Gender', 'Fat_Percentage', 'Session_Duration (hours)', 'Sets', 'Reps', 'Exercise_Code']
    X_burnCal = np.random.rand(n_samples, 9)
    X_burnCal[:, 0] = X_burnCal[:, 0] * 50 + 18  # age: 18-68
    X_burnCal[:, 1] = X_burnCal[:, 1] * 0.5 + 1.5  # height: 1.5-2.0 m
    X_burnCal[:, 2] = X_burnCal[:, 2] * 60 + 50   # weight: 50-110 kg
    X_burnCal[:, 3] = np.random.randint(0, 2, n_samples)  # gender: 0=female, 1=male
    X_burnCal[:, 4] = X_burnCal[:, 4] * 20 + 10   # fat_percentage: 10-30%
    X_burnCal[:, 5] = X_burnCal[:, 5] * 2 + 0.5   # session_duration: 0.5-2.5 hours
    X_burnCal[:, 6] = X_burnCal[:, 6] * 20 + 5    # sets: 5-25
    X_burnCal[:, 7] = X_burnCal[:, 7] * 200 + 50  # reps: 50-250
    X_burnCal[:, 8] = np.random.randint(0, 54, n_samples)  # exercise_code: 0-53
    
    # Create realistic calorie burn targets
    y_burnCal = (
        0.8 * X_burnCal[:, 2] +           # weight factor
        0.5 * X_burnCal[:, 5] +            # duration factor
        0.3 * X_burnCal[:, 6] +            # sets factor
        0.2 * X_burnCal[:, 7] +            # reps factor
        0.1 * X_burnCal[:, 8] +            # exercise intensity factor
        50 + np.random.normal(0, 20, n_samples)  # noise
    )
    
    # Train models
    fat_model = RandomForestRegressor(n_estimators=50, random_state=42)
    fat_model.fit(X_fat, y_fat)
    
    water_model = RandomForestRegressor(n_estimators=50, random_state=42)
    water_model.fit(X_water, y_water)
    
    burnCal_model = RandomForestRegressor(n_estimators=50, random_state=42)
    burnCal_model.fit(X_burnCal, y_burnCal)
    
    # Save models
    with open('models/fat_model_tuned.pkl', 'wb') as f:
        pickle.dump(fat_model, f)
    
    with open('models/water_intake_model_tuned.pkl', 'wb') as f:
        pickle.dump(water_model, f)
    
    with open('models/burnCal_model_tuned.pkl', 'wb') as f:
        pickle.dump(burnCal_model, f)
    
    print("✅ Example models created and saved!")
    print("   - fat_model_tuned.pkl")
    print("   - water_intake_model_tuned.pkl")
    print("   - burnCal_model_tuned.pkl")
    print("\nModel requirements:")
    print("fat_model_tuned: ['Age', 'Gender', 'Weight (kg)', 'BMI']")
    print("water_intake_model_tuned: ['Age', 'Height (m)', 'Weight (kg)', 'Gender', 'Fat_Percentage', 'Session_Duration (hours)']")
    print("burnCal_model_tuned: ['Age', 'Height (m)', 'Weight (kg)', 'Gender', 'Fat_Percentage', 'Session_Duration (hours)', 'Sets', 'Reps', 'Exercise_Code']")

if __name__ == "__main__":
    create_example_models()

