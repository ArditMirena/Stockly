import matplotlib.pyplot as plt
import numpy as np
from typing import List
import pandas as pd


def plot_feature_importance(model, feature_names: List[str]):
    """Improved feature importance visualization"""
    try:
        # Get importance scores with fallback
        try:
            scores = model.get_booster().get_score(importance_type='gain')
            if not scores:
                scores = model.feature_importances_
                importance_type = 'weight'
            else:
                importance_type = 'gain'
        except:
            scores = model.feature_importances_
            importance_type = 'weight'

        # Normalize scores if needed
        if isinstance(scores, dict):
            scores = [scores.get(f'f{i}', 0) for i in range(len(feature_names))]
        total = sum(scores)
        if total > 0:
            scores = [s / total for s in scores]

        # Sort features
        sorted_idx = np.argsort(scores)
        sorted_scores = np.array(scores)[sorted_idx]
        sorted_features = np.array(feature_names)[sorted_idx]

        # Create plot
        plt.figure(figsize=(10, 6))
        bars = plt.barh(range(len(sorted_features)), sorted_scores, align='center')
        plt.yticks(range(len(sorted_features)), sorted_features)
        plt.xlabel(f'Feature Importance ({importance_type})')
        plt.title('Feature Importance Ranking')

        # Add values to bars
        for bar in bars:
            width = bar.get_width()
            if width > 0.01:  # Only label significant values
                plt.text(width, bar.get_y() + bar.get_height() / 2,
                         f'{width:.2f}',
                         va='center', ha='left')

        plt.tight_layout()
        plt.show()

    except Exception as e:
        print(f"Error plotting feature importance: {str(e)}")


def get_current_stocks(df: pd.DataFrame) -> dict:
    """Get the latest stock levels for each product-warehouse combination"""
    latest_entries = df.sort_values('orderDate').groupby(['productId', 'warehouseId']).tail(1)
    return {(row['productId'], row['warehouseId']): row['currentStock']
            for _, row in latest_entries.iterrows()}