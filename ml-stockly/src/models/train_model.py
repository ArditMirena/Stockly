import xgboost as xgb
import os
import pickle
from config.settings import settings


class ModelTrainer:
    def __init__(self):
        self.model = None
        self.model_file = settings.MODEL_FILE
        os.makedirs(os.path.dirname(self.model_file), exist_ok=True)

    def train_model(self, X, y) -> bool:
        """Train a simple model suitable for tiny datasets"""
        try:
            # Use basic linear regression if data is very small
            if len(X) < 10:
                from sklearn.linear_model import LinearRegression
                self.model = LinearRegression()
            else:
                self.model = xgb.XGBRegressor(
                    objective='reg:squarederror',
                    n_estimators=20,
                    max_depth=2,
                    learning_rate=0.1,
                    random_state=settings.RANDOM_STATE
                )

            self.model.fit(X, y)
            return True
        except Exception as e:
            print(f"Training failed: {str(e)}")
            return False

    def save_model(self) -> bool:
        """Proper model serialization"""
        if self.model is None:
            return False
        try:
            with open(self.model_file, 'wb') as f:
                pickle.dump({
                    'model_type': type(self.model).__name__,
                    'model_data': pickle.dumps(self.model)
                }, f)
            return True
        except Exception as e:
            print(f"Save error: {str(e)}")
            return False

    def load_model(self) -> bool:
        """Proper model deserialization"""
        if not os.path.exists(self.model_file):
            return False
        try:
            with open(self.model_file, 'rb') as f:
                saved = pickle.load(f)
                self.model = pickle.loads(saved['model_data'])
            return True
        except Exception as e:
            print(f"Load error: {str(e)}")
            return False