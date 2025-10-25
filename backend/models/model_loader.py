import pickle
import os
from typing import Dict, Any, Optional

class ModelLoader:
    """Load and manage ML models from .pkl files"""
    
    def __init__(self, models_dir: str = "models"):
        self.models_dir = models_dir
        self.models: Dict[str, Any] = {}
        self.load_all_models()
    
    def load_all_models(self):
        """Load all .pkl files from the models directory"""
        if not os.path.exists(self.models_dir):
            print(f"Models directory '{self.models_dir}' not found. Creating it...")
            os.makedirs(self.models_dir, exist_ok=True)
            return
        
        for filename in os.listdir(self.models_dir):
            if filename.endswith('.pkl'):
                model_name = filename[:-4]  # Remove .pkl extension
                try:
                    model_path = os.path.join(self.models_dir, filename)
                    with open(model_path, 'rb') as f:
                        self.models[model_name] = pickle.load(f)
                    print(f"✅ Loaded model: {model_name}")
                except Exception as e:
                    print(f"❌ Error loading model {model_name}: {str(e)}")
    
    def get_model(self, model_name: str) -> Optional[Any]:
        """Get a specific model by name"""
        return self.models.get(model_name)
    
    def list_models(self) -> list:
        """List all loaded model names"""
        return list(self.models.keys())
    
    def predict(self, model_name: str, data) -> Optional[Any]:
        """Make a prediction using a specific model"""
        model = self.get_model(model_name)
        if model is None:
            print(f"Model '{model_name}' not found")
            return None
        
        try:
            # Handle different model types
            if hasattr(model, 'predict'):
                return model.predict(data)
            elif hasattr(model, 'predict_proba'):
                return model.predict_proba(data)
            else:
                print(f"Model '{model_name}' doesn't have predict method")
                return None
        except Exception as e:
            print(f"Error making prediction with {model_name}: {str(e)}")
            return None

# Global model loader instance
model_loader = ModelLoader()

