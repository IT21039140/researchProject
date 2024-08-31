import requests
import pandas as pd

def fetchData(courses_url, users_url):

    # Fetch courses data
    courses_response = requests.get(courses_url)
    if courses_response.status_code == 200:
        courses_data = courses_response.json()
        courses_df = pd.DataFrame(courses_data)
    else:
        raise Exception(f"Failed to retrieve courses data: {courses_response.status_code}")

    # Fetch users data
    users_response = requests.get(users_url)
    if users_response.status_code == 200:
        users_data = users_response.json()
        users_df = pd.DataFrame(users_data)
    else:
        raise Exception(f"Failed to retrieve users data: {users_response.status_code}")

    return courses_df, users_df