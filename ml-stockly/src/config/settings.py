# src/config/settings.py

import os
from dotenv import load_dotenv

# Load environment variables from .env in the project root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', '.env'))

class Settings:
    # API Configuration
    API_BASE_URL = os.getenv("API_BASE_URL")
    ORDERS_ENDPOINT = os.getenv("ORDERS_ENDPOINT")
    AUTH_ENDPOINT = os.getenv("AUTH_ENDPOINT")

    # Auth Credentials
    AUTH_EMAIL = os.getenv("AUTH_EMAIL")
    AUTH_PASSWORD = os.getenv("AUTH_PASSWORD")

    # Model Configuration
    MODEL_FILE = os.getenv("MODEL_FILE")
    TEST_SIZE = float(os.getenv("TEST_SIZE", 0.2))
    RANDOM_STATE = int(os.getenv("RANDOM_STATE", 42))

    # Prediction Configuration
    SAFETY_STOCK_BUFFER = float(os.getenv("SAFETY_STOCK_BUFFER", 0.2))
    PREDICTION_WINDOW = int(os.getenv("PREDICTION_WINDOW", 7))

    #MongoDB
    MONGO_URI = os.getenv("MONGO_URI")
    MONGO_DB = os.getenv("MONGO_DB")
    PREDICTION_COLLECTION_PREFIX = "predictions_"

settings = Settings()
