# data/api_client.py
import requests
from config.settings import settings
from typing import List, Dict, Optional
import json
import time


class APIClient:
    def __init__(self):
        self.base_url = settings.API_BASE_URL
        self.retry_count = 3
        self.retry_delay = 1
        self.token = None

    def _get_auth_token(self) -> Optional[str]:
        """Authenticate and get JWT token"""
        auth_url = f"{self.base_url}{settings.AUTH_ENDPOINT}"
        payload = {
            "email": settings.AUTH_EMAIL,
            "password": settings.AUTH_PASSWORD
        }

        try:
            response = requests.post(
                auth_url,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=5
            )
            response.raise_for_status()
            self.token = response.json().get('accessToken')

            return self.token
        except requests.exceptions.RequestException as e:
            print(f"Authentication failed: {e}")
            return None

    def _make_authenticated_request(self, method: str, endpoint: str, **kwargs):
        """Make request with auth token"""
        if not self.token:
            self._get_auth_token()

        headers = kwargs.pop('headers', {})
        headers.update({
            'Authorization': f'Bearer {self.token}',
            'Accept': 'application/json'
        })

        url = f"{self.base_url}{endpoint}"

        for attempt in range(self.retry_count):
            try:
                response = requests.request(
                    method,
                    url,
                    headers=headers,
                    timeout=10,
                    **kwargs
                )

                if response.status_code == 401:  # Token expired
                    self._get_auth_token()  # Refresh token
                    headers['Authorization'] = f'Bearer {self.token}'
                    continue

                response.raise_for_status()
                return response

            except requests.exceptions.RequestException as e:
                print(f"Attempt {attempt + 1} failed: {e}")
                if attempt < self.retry_count - 1:
                    time.sleep(self.retry_delay)
                continue

        return None

    def get_orders_data(self) -> Optional[List[Dict]]:
        """Fetch orders data with authentication"""
        response = self._make_authenticated_request(
            'GET',
            settings.ORDERS_ENDPOINT
        )
        return response.json() if response else None

    @staticmethod
    def save_sample_data(data: List[Dict], filename: str = "data/sample_data.json"):
        """Save sample data for development/testing"""
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)

    @staticmethod
    def load_sample_data(filename: str = "data/sample_data.json") -> Optional[List[Dict]]:
        """Load sample data for development"""
        try:
            with open(filename, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"Error loading sample data: {e}")
            return None