# FitSense Backend - ML Integration Guide

## 📁 **Where to Place Your .pkl Files**

Place your machine learning model files (`.pkl`) in the `backend/models/` directory:

```
backend/
├── models/
│   ├── body_fat_model.pkl      # Your body fat prediction model
│   ├── calorie_burn_model.pkl # Your calorie burn model
│   ├── hydration_model.pkl    # Your hydration model
│   └── model_loader.py        # Model loading utility
├── app.py
├── requirements.txt
└── README.md
```

## 🤖 **ML Integration Features**

### **Automatic Model Loading**
- All `.pkl` files in the `models/` directory are automatically loaded on startup
- Models are cached in memory for fast predictions
- Error handling for corrupted or incompatible models

### **Feature Preparation**
The system automatically converts assessment data to ML features:
- `age`, `height`, `weight`, `frequency`, `duration`
- `gender_male`, `gender_female` (one-hot encoded)
- `sets_total`, `reps_total` (aggregated exercise data)

### **API Endpoints**

#### **Assessment with Predictions**
- `POST /api/assessments` - Creates assessment + runs all available models
- Returns: assessment data + predictions from all models

#### **Model Management**
- `GET /api/models` - List all available models
- `POST /api/models/<model_name>/predict` - Predict with specific model

## 🔧 **Setup Instructions**

1. **Install ML dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Add your .pkl files:**
   - Copy your model files to `backend/models/`
   - Restart the Flask server

3. **Test the integration:**
   ```bash
   # List available models
   curl http://localhost:5000/api/models
   
   # Make assessment with predictions
   curl -X POST http://localhost:5000/api/assessments \
     -H "Content-Type: application/json" \
     -d '{"user_id": 1, "name": "Test", "age": 25, ...}'
   ```

## 📊 **Model Requirements**

Your `.pkl` files should contain models with:
- `predict()` method for predictions
- `predict_proba()` method for probability predictions (optional)
- Compatible with scikit-learn format

## 🚀 **Example Usage**

When you create an assessment, the system will:
1. Save the assessment data to database
2. Convert data to ML features
3. Run predictions on all available models
4. Return assessment + predictions in the response

```json
{
  "message": "Assessment created successfully",
  "assessment": { ... },
  "predictions": {
    "body_fat_model": {
      "model_name": "body_fat_model",
      "prediction": [15.2],
      "features_used": ["age", "height", "weight", ...]
    },
    "calorie_burn_model": {
      "model_name": "calorie_burn_model", 
      "prediction": [350.5],
      "features_used": ["age", "height", "weight", ...]
    }
  },
  "available_models": ["body_fat_model", "calorie_burn_model"]
}
```

## 🔍 **Troubleshooting**

- **Model not loading**: Check file format and scikit-learn compatibility
- **Prediction errors**: Verify feature names match your training data
- **Memory issues**: Large models may require more server memory

Your ML models are now fully integrated! 🎉