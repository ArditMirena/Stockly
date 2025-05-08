from pymongo import MongoClient, ASCENDING, DESCENDING
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional
import pandas as pd
from config.settings import settings
import hashlib


class MongoDBClient:
    def __init__(self):
        self.client = MongoClient(settings.MONGO_URI)
        self.db = self.client[settings.MONGO_DB]
        self._ensure_indexes()

    def _ensure_indexes(self):
        """Create necessary indexes for performance"""
        self.db[settings.PREDICTION_COLLECTION_PREFIX].create_index([
            ("product_id", ASCENDING),
            ("warehouse_id", ASCENDING),
            ("metadata.created_at", DESCENDING)
        ])
        self.db[settings.PREDICTION_COLLECTION_PREFIX].create_index(
            "metadata.created_at"
        )
        self.db[settings.PREDICTION_COLLECTION_PREFIX].create_index(
            "data_hash"
        )

    def _get_current_collection(self):
        """Get the current monthly collection name"""
        return f"{settings.PREDICTION_COLLECTION_PREFIX}{datetime.now().strftime('%Y%m')}"

    def _create_data_hash(self, prediction: Dict) -> str:
        """Create hash of prediction data for change detection"""
        hash_data = {
            'product_id': prediction['product_id'],
            'warehouse_id': prediction['warehouse_id'],
            'current_stock': prediction['current_stock'],
            'suggested_restock': prediction['suggested_restock']
        }
        return hashlib.md5(str(hash_data).encode()).hexdigest()

    def save_predictions(self, predictions: List[Dict]) -> Tuple[int, int]:
        """
        Save predictions with duplicate detection
        Returns: (saved_count, skipped_count)
        """
        if not predictions:
            return (0, 0)

        collection = self._get_current_collection()
        saved = 0
        skipped = 0
        timestamp = datetime.utcnow()

        for pred in predictions:
            try:
                data_hash = self._create_data_hash(pred)

                # Check if identical prediction already exists
                existing = self.db[collection].find_one({
                    "product_id": pred["product_id"],
                    "warehouse_id": pred["warehouse_id"],
                    "data_hash": data_hash
                })

                if existing:
                    skipped += 1
                    continue

                # Prepare new document
                doc = {
                    "metadata": {
                        "created_at": timestamp,
                        "version": "1.1",
                        "source": "ml-stockly",
                        "prediction_run_id": timestamp.strftime("%Y%m%d%H%M")
                    },
                    "product_id": pred["product_id"],
                    "warehouse_id": pred["warehouse_id"],
                    "data_hash": data_hash,
                    "stock_data": {
                        "current": pred["current_stock"],
                        "days_remaining": pred["days_of_inventory_remaining"]
                    },
                    "demand_forecast": {
                        "daily_avg": pred["avg_daily_demand"],
                        "daily_predicted": pred["predicted_daily_demand"],
                        f"weekly_predicted_{settings.PREDICTION_WINDOW}d": pred["predicted_demand_next_period"]
                    },
                    "recommendation": {
                        "safety_stock": pred["safety_stock_level"],
                        "suggested_restock": pred["suggested_restock"]
                    }
                }

                self.db[collection].insert_one(doc)
                saved += 1

            except Exception as e:
                print(f"Error saving prediction: {str(e)}")

        print(f"✅ Saved {saved} new predictions, skipped {skipped} duplicates")
        return (saved, skipped)

    def clean_old_predictions(self, months_to_keep: int = 3):
        """Remove predictions older than specified months"""
        cutoff_date = datetime.utcnow() - timedelta(days=30 * months_to_keep)

        # Get all prediction collections
        collections = [
            col for col in self.db.list_collection_names()
            if col.startswith(settings.PREDICTION_COLLECTION_PREFIX)
        ]

        deleted_count = 0
        for col in collections:
            # Extract date from collection name
            col_date_str = col.replace(settings.PREDICTION_COLLECTION_PREFIX, "")
            try:
                col_date = datetime.strptime(col_date_str, "%Y%m")
                if col_date < cutoff_date:
                    result = self.db.drop_collection(col)
                    print(f"🗑️ Deleted collection {col}")
                    deleted_count += 1
            except ValueError:
                continue

        print(f"🧹 Cleaned up {deleted_count} old collections")

    def test_connection(self) -> bool:
        try:
            self.client.admin.command('ping')
            return True
        except Exception:
            return False