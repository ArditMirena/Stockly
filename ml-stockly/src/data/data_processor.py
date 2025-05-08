import pandas as pd
from typing import Tuple
from config.settings import settings


class DataProcessor:
    def __init__(self):
        pass

    def process_raw_data(self, raw_data: list) -> pd.DataFrame:
        """Convert raw API data with proper timezone handling"""
        df = pd.DataFrame(raw_data)

        # Convert to datetime and ensure timezone-naive
        df['orderDate'] = pd.to_datetime(df['orderDate']).dt.tz_localize(None)

        # Basic features
        df['day_of_week'] = df['orderDate'].dt.dayofweek
        df['hour_of_day'] = df['orderDate'].dt.hour

        # Demand features
        df['demand_avg'] = df.groupby('productId')['quantity'].transform('mean')

        # Inventory features
        df['stock_ratio'] = df['currentStock'] / (df['demand_avg'] + 1)

        # Time-based features with proper timezone handling
        min_date = df['orderDate'].min()
        df['days_since_first_order'] = (df['orderDate'] - min_date).dt.days

        return df

    def prepare_features_target(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """Use only available features"""
        available_features = [
            'day_of_week',
            'hour_of_day',
            'demand_avg',
            'stock_ratio',
            'days_since_first_order'
        ]

        # Only use features that exist in the DataFrame
        features_to_use = [f for f in available_features if f in df.columns]

        if len(features_to_use) < 2:
            raise ValueError("Insufficient features available for modeling")

        return df[features_to_use], df['quantity']