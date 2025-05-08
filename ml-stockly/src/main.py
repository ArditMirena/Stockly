# from data.api_client import APIClient
# from data.data_processor import DataProcessor
# from models.train_model import ModelTrainer
# from models.predictor import RestockingPredictor
# from utils.helpers import plot_feature_importance, get_current_stocks
# from config.settings import settings
# import pandas as pd
# from db.mongo_client import MongoDBClient
# import os
# from sklearn.metrics import mean_absolute_error, r2_score
# from datetime import datetime
#
#
# def main():
#     mongo_client = MongoDBClient()
#     if not mongo_client.test_connection():
#         print("Proceeding without MongoDB connection")
#
#     print("Restocking Prediction System")
#
#     # Step 1: Initialize client and fetch data
#     print("Authenticating and fetching data...")
#     client = APIClient()
#     raw_data = client.get_orders_data()
#
#     if not raw_data:
#         print("Trying to load sample data...")
#         raw_data = client.load_sample_data()
#
#     if not raw_data:
#         print("\nFailed to get data. Possible solutions:")
#         print("1. Is your SpringBoot API running?")
#         print("2. Check auth credentials in config/settings.py")
#         print("3. Verify the user has proper permissions")
#         print("4. Create sample data file at data/sample_data.json")
#         return
#
#     # Step 2: Process data
#     print("Processing data...")
#     processor = DataProcessor()
#     try:
#         processed_data = processor.process_raw_data(raw_data)
#         X, y = processor.prepare_features_target(processed_data)
#     except ValueError as e:
#         print(f"\nERROR in data processing: {str(e)}")
#         return
#
#     # Data summary
#     print("\nData Summary:")
#     print(f"Total records: {len(processed_data)}")
#     print(f"Unique products: {processed_data['productId'].nunique()}")
#     print(f"Date range: {processed_data['orderDate'].min().date()} to {processed_data['orderDate'].max().date()}")
#
#     if len(processed_data) < 10:
#         print("\nNOTICE: Using ultra-conservative predictions")
#         print("Recommendations based on historical averages with safety buffers")
#
#     # Step 3: Setup model
#     print("Setting up model...")
#     trainer = ModelTrainer()
#
#     # Try to load existing model
#     model_loaded = trainer.load_model()
#
#     if not model_loaded:
#         print("Training new model...")
#         if not trainer.train_model(X, y):
#             print("Error: Model training failed")
#             return
#         if not trainer.save_model():
#             print("Warning: Model trained but failed to save")
#
#     # Verify we have a working model
#     if not hasattr(trainer, 'model') or trainer.model is None:
#         print("Error: No valid model available")
#         return
#
#     # After data loading, add this check:
#     if hasattr(processed_data['orderDate'].dt, 'tz'):
#         print("\nTimezone info detected in order dates - converting to timezone-naive")
#         processed_data['orderDate'] = processed_data['orderDate'].dt.tz_localize(None)
#
#     # Feature validation
#     print("\nFeature Validation:")
#     if hasattr(trainer.model, 'feature_names_in_'):
#         print(f"Model expects: {trainer.model.feature_names_in_}")
#     else:
#         print("Model feature names not available")
#     print(f"Features prepared: {X.columns.tolist()}")
#
#     # Skip evaluation for very small datasets
#     if len(processed_data) >= 10:
#         # Step 4: Model Evaluation
#         print("\nModel Evaluation:")
#         print(f"Features used: {X.columns.tolist()}")
#
#         if hasattr(trainer.model, 'feature_importances_'):
#             print("\nFeature Importances:")
#             importances = dict(zip(X.columns, trainer.model.feature_importances_))
#             for feature, importance in sorted(importances.items(), key=lambda x: x[1], reverse=True):
#                 print(f"  {feature}: {importance:.4f}")
#         else:
#             print("Feature importance not available")
#
#         # Calculate metrics
#         predictions = trainer.model.predict(X)
#         print(f"\nModel Performance:")
#         print(f"  MAE: {mean_absolute_error(y, predictions):.2f}")
#         print(f"  R² Score: {r2_score(y, predictions):.2f} (1.0 is perfect)")
#     else:
#         print("\nSkipping model evaluation (insufficient data)")
#
#     def generate_fallback_predictions(processed_data: pd.DataFrame, current_stocks: dict) -> list:
#         """Generate predictions using simple averages when model fails"""
#         predictions = []
#         for (product_id, warehouse_id), stock in current_stocks.items():
#             product_data = processed_data[
#                 (processed_data['productId'] == product_id) &
#                 (processed_data['warehouseId'] == warehouse_id)
#                 ]
#
#             if len(product_data) == 0:
#                 continue
#
#             avg_daily = product_data['quantity'].mean()
#             predicted_daily = avg_daily * 1.2  # 20% buffer
#             predicted_weekly = predicted_daily * settings.PREDICTION_WINDOW
#             safety_stock = predicted_weekly * 1.5  # 50% buffer
#             restock = max(0, safety_stock - stock)
#
#             predictions.append({
#                 'product_id': product_id,
#                 'warehouse_id': warehouse_id,
#                 'current_stock': stock,
#                 'avg_daily_demand': round(avg_daily, 2),
#                 'predicted_daily_demand': round(predicted_daily, 2),
#                 'predicted_demand_next_period': round(predicted_weekly, 2),
#                 'safety_stock_level': round(safety_stock),
#                 'suggested_restock': round(restock),
#                 'days_of_inventory_remaining': round(stock / (predicted_daily + 0.001), 1)
#             })
#
#         return predictions
#
#     # Step 5: Make predictions
#     print("\nGenerating restocking predictions...")
#     current_stocks = get_current_stocks(processed_data)
#     predictor = RestockingPredictor(trainer.model if hasattr(trainer, 'model') else None, processed_data)
#
#     try:
#         predictions = predictor.predict_for_all_products(current_stocks)
#         if not predictions:
#             print("Warning: No predictions generated - using fallback calculations")
#             predictions = generate_fallback_predictions(processed_data, current_stocks)
#     except Exception as e:
#         print(f"Prediction failed: {str(e)}")
#         print("Using fallback calculations")
#         predictions = generate_fallback_predictions(processed_data, current_stocks)
#
#         # Step 6: Save predictions to MongoDB
#     if predictions:
#         print("\nSaving predictions to MongoDB...")
#         mongo_client = MongoDBClient()
#
#         # Save with a collection name based on date for better organization
#         collection_name = f"predictions_{datetime.now().strftime('%Y%m%d')}"
#
#         if not mongo_client.save_predictions(collection_name, predictions):
#             # Fallback: Save to a default collection if date-based fails
#             print("Attempting to save to default collection...")
#             mongo_client.save_predictions("predictions", predictions)
#     else:
#         print("⚠️ No predictions generated to save")
#
#     # Display results
#     print("\nRestocking Recommendations:")
#     for pred in predictions:
#         print(f"\nProduct {pred['product_id']} (Warehouse {pred['warehouse_id']}):")
#         print(f"  Current stock: {pred['current_stock']}")
#         print(f"  Avg daily demand: {pred['avg_daily_demand']}")
#         print(f"  Predicted daily demand: {pred['predicted_daily_demand']}")
#         print(f"  Predicted demand (next {settings.PREDICTION_WINDOW} days): {pred['predicted_demand_next_period']}")
#         print(f"  Safety stock level: {pred['safety_stock_level']}")
#         print(f"  Suggested restock: {pred['suggested_restock']}")
#         print(f"  Days of inventory remaining: {pred['days_of_inventory_remaining']}")
#
#     # Show feature importance plot if we have enough data
#     if len(processed_data) >= 10 and hasattr(trainer.model, 'get_booster'):
#         plot_feature_importance(trainer.model, X.columns.tolist())
#     elif len(processed_data) < 10:
#         print("\nSkipping feature importance plot (insufficient data)")
#
#
# if __name__ == "__main__":
#     main()


import time
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from data.api_client import APIClient
from data.data_processor import DataProcessor
from models.train_model import ModelTrainer
from models.predictor import RestockingPredictor
from utils.helpers import get_current_stocks
from db.mongo_client import MongoDBClient
from config.settings import settings


def run_prediction_job():
    print(f"\n{'=' * 50}")
    print(f"Starting prediction job at {datetime.now()}")
    print(f"{'=' * 50}")

    # Initialize clients
    api_client = APIClient()
    mongo_client = MongoDBClient()

    # Fetch and process data
    raw_data = api_client.get_orders_data() or api_client.load_sample_data()
    if not raw_data:
        print("⚠️ No data available for predictions")
        return

    processor = DataProcessor()
    processed_data = processor.process_raw_data(raw_data)

    # Train/load model
    trainer = ModelTrainer()
    if not trainer.load_model():
        X, y = processor.prepare_features_target(processed_data)
        trainer.train_model(X, y)
        trainer.save_model()

    # Generate predictions
    current_stocks = get_current_stocks(processed_data)
    predictor = RestockingPredictor(trainer.model, processed_data)
    predictions = predictor.predict_for_all_products(current_stocks)

    # Save to MongoDB
    if predictions:
        saved, skipped = mongo_client.save_predictions(predictions)
        if saved == 0:
            print("No new predictions to save - data unchanged")
    else:
        print("⚠️ No predictions generated")

    # Clean up old data (runs once per day)
    if datetime.now().hour == 3:  # Run at 3 AM
        mongo_client.clean_old_predictions()


def main():
    # Initialize scheduler
    scheduler = BackgroundScheduler()
    scheduler.add_job(run_prediction_job, 'interval', hours=4)  # Run every 4 hours

    # Initial test run
    print("Running initial prediction...")
    run_prediction_job()

    # Start scheduler
    scheduler.start()
    print("Prediction scheduler started. Press Ctrl+C to exit.")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        scheduler.shutdown()
        print("Scheduler stopped")


if __name__ == "__main__":
    main()