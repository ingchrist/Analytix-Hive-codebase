import requests
from django.conf import settings


class PaystackAPI:
    """Paystack API wrapper"""
    BASE_URL = 'https://api.paystack.co'
    
    def __init__(self):
        self.headers = {
            'Authorization': f'Bearer {settings.PAYSTACK_SECRET_KEY}',
            'Content-Type': 'application/json',
        }
    
    def initialize_transaction(self, data):
        """Initialize a new transaction"""
        url = f'{self.BASE_URL}/transaction/initialize'
        response = requests.post(url, json=data, headers=self.headers)
        return response.json()
    
    def verify_transaction(self, reference):
        """Verify a transaction"""
        url = f'{self.BASE_URL}/transaction/verify/{reference}'
        response = requests.get(url, headers=self.headers)
        return response.json()
    
    def charge_authorization(self, data):
        """Charge a saved authorization"""
        url = f'{self.BASE_URL}/transaction/charge_authorization'
        response = requests.post(url, json=data, headers=self.headers)
        return response.json()
    
    def create_subscription(self, data):
        """Create a subscription"""
        url = f'{self.BASE_URL}/subscription'
        response = requests.post(url, json=data, headers=self.headers)
        return response.json()
    
    def fetch_subscription(self, code):
        """Get subscription details"""
        url = f'{self.BASE_URL}/subscription/{code}'
        response = requests.get(url, headers=self.headers)
        return response.json()
    
    def disable_subscription(self, code):
        """Cancel a subscription"""
        url = f'{self.BASE_URL}/subscription/disable'
        data = {'code': code, 'token': code}
        response = requests.post(url, json=data, headers=self.headers)
        return response.json()
    
    def create_refund(self, data):
        """Create a refund"""
        url = f'{self.BASE_URL}/refund'
        response = requests.post(url, json=data, headers=self.headers)
        return response.json()

