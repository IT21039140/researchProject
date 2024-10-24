import requests
from django.conf import settings
import logging

log = logging.getLogger('questionGenerator')

class ServiceClient:
    def __init__(self):
        self.base_url = settings.API_GATEWAY_URL  # Ensure this is defined in your settings.py

    def get_user_details(self, email, token):
        """Fetch user details from the API gateway."""
        try:
            log.info(f"Fetching details for user email: {email}")

            url = f"{self.base_url}/users/{email}/"
            headers = {
                'Authorization': token,  # Add the provided access token in the Authorization header
            }

            response = requests.get(url, headers=headers)
            response.raise_for_status()  # Raise HTTPError for bad responses (4xx and 5xx)

            log.info(f'Successfully retrieved details for email: {email}')
            return response.json()

        except requests.exceptions.HTTPError as http_err:
            log.error(f'HTTP error occurred while retrieving details for {email}: {http_err}')  # Log the error
            return None
        except Exception as err:
            log.error(f'An error occurred while retrieving details for {email}: {err}')  # Log the error
            return None
