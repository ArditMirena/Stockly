import pandas as pd
from datetime import datetime
from typing import Dict, Optional
from config.settings import settings


class RestockingPredictor:
    def __init__(self, model, historical_data: pd.DataFrame):
        self.model = model
        self.historical_data = historical_data

    def predict_for_product(self, product_id: int, warehouse_id: int,
                            current_stock: int) -> Optional[Dict]:
        """Complete prediction method with all variables defined"""
        try:
            product_data = self.historical_data[
                (self.historical_data['productId'] == product_id) &
                (self.historical_data['warehouseId'] == warehouse_id)
                ]

            if len(product_data) == 0:
                return None

            avg_daily = product_data['quantity'].mean()
            predicted_daily = avg_daily * 1.1

            if self.model is not None and hasattr(self.model, 'predict'):
                try:
                    now = datetime.now().replace(tzinfo=None)
                    first_order_date = product_data['orderDate'].min()
                    if hasattr(first_order_date, 'tz'):
                        first_order_date = first_order_date.tz_localize(None)

                    input_data = pd.DataFrame({
                        'day_of_week': [now.weekday()],
                        'hour_of_day': [now.hour],
                        'demand_avg': [avg_daily],
                        'stock_ratio': [current_stock / (avg_daily + 1)],
                        'days_since_first_order': [(now - first_order_date).days]
                    })

                    if hasattr(self.model, 'feature_names_in_'):
                        input_data = input_data[[col for col in input_data.columns
                                                 if col in self.model.feature_names_in_]]

                    model_pred = float(self.model.predict(input_data)[0])
                    predicted_daily = max(avg_daily, model_pred)
                except Exception as e:
                    print(f"Model refinement failed, using base prediction: {str(e)}")

            predicted_weekly = predicted_daily * settings.PREDICTION_WINDOW
            safety_stock = predicted_weekly * 1.3
            restock = max(0, safety_stock - current_stock)

            # Define the prediction dictionary
            prediction = {
                'product_id': product_id,
                'warehouse_id': warehouse_id,
                'current_stock': current_stock,
                'avg_daily_demand': round(avg_daily, 2),
                'predicted_daily_demand': round(predicted_daily, 2),
                'predicted_demand_next_period': round(predicted_weekly, 2),
                'safety_stock_level': round(safety_stock),
                'suggested_restock': round(restock),
                'days_of_inventory_remaining': round(current_stock / (predicted_daily + 0.001), 1)
            }

            return prediction

        except Exception as e:
            print(f"Prediction error: {str(e)}")
            return None

    def predict_for_all_products(self, current_stocks: Dict[tuple, int]) -> list:
        """Safe prediction for all products"""
        predictions = []
        for (product_id, warehouse_id), stock in current_stocks.items():
            prediction = self.predict_for_product(product_id, warehouse_id, stock)
            if prediction is not None:
                predictions.append(prediction)
        return predictions