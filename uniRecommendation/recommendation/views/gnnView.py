import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import SAGEConv
import torch_geometric
import networkx as nx
import os
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status

from recommendation.DataCleaning.utils import encode_new_user, recommend_for_new_user
from recommendation.DataCleaning.utils import NewUserDataCleaner
from recommendation.models.GNN_model import CourseRecommendationGNN
from recommendation.DataCleaning.dataFetcher import fetchData
from recommendation.DataCleaning.CourseDataCleaner import CourseDataCleaner
from recommendation.DataCleaning.UserDataCleaner import UserDataCleaner
import json
import requests

# Define URLs for fetching data
courses_url = 'http://localhost:8010/uni/courses'
users_url = 'http://localhost:8010/uni/users'

# Define raw URLs for fetching files
graph_url = 'https://github.com/IT21039140/researchProject/raw/Chathurangi/uniRecommendation/recommendation/DataProcessing/graph.graphml'
model_url = 'https://github.com/IT21039140/researchProject/raw/Chathurangi/uniRecommendation/recommendation/DataProcessing/model_weights.pth'
data_url = 'https://github.com/IT21039140/researchProject/raw/Chathurangi/uniRecommendation/recommendation/DataProcessing/data.pt'

# Initialize global variables for graph, model, and data
df_courses, df_users, graph, data, model = None, None, None, None, None
coursesdata, unique_subjects, area_encoder = [], [], []

def download_file(url, destination):
    response = requests.get(url)
    response.raise_for_status()  # Check for request errors
    with open(destination, 'wb') as f:
        f.write(response.content)

def initialize_resources():
    global df_courses, df_users, graph, data, model, coursesdata, unique_subjects, area_encoder 

    if df_courses is not None and df_users is not None and graph is not None and data is not None and model is not None:
        print("Resources already initialized.")
        return

    try:
        # Fetch and clean data
        df_courses, df_users = fetchData(courses_url, users_url)



        print(f"Data fetched: df_courses = {df_courses is not None}, df_users = {df_users is not None}")

        if df_users is not None:
            user_cleaner = UserDataCleaner()
            df_users_cleaned, unique_subjects, area_encoder = user_cleaner.clean_data(df_users)
            if df_users_cleaned is None:
                raise ValueError("Cleaned user DataFrame is None")
            userdata = df_users_cleaned.to_dict(orient='records')
        else:
            raise ValueError("User DataFrame not found.")

        if df_courses is not None:
            course_cleaner = CourseDataCleaner()
            df_courses_cleaned, column_names = course_cleaner.clean_data(df_courses, area_encoder)
            if df_courses_cleaned is None:
                raise ValueError("Cleaned courses DataFrame is None")
            coursesdata = df_courses_cleaned.to_dict(orient='records')
        else:
            print("Courses DataFrame not found.")

        # Download and load the graph, model, and data
        download_file(graph_url, 'graph.graphml')
        download_file(model_url, 'model_weights.pth')
        download_file(data_url, 'data.pt')

        # Load the graph
    
        graph = nx.read_graphml('graph.graphml')
        print(f"Graph loaded: {graph is not None}")

        # Load the model and data
        
        data = torch.load('data.pt')  # Removed weights_only=True
        print(f"Data loaded: {data is not None}")

        input_dim = 66  # Adjust based on your setup
        hidden_dim = 64
        output_dim = 32
        model = CourseRecommendationGNN(input_dim, hidden_dim, output_dim)
        model.load_state_dict(torch.load('model_weights.pth'),)  # Removed weights_only=True
        model.eval()
        print("Model loaded and set to eval mode")

    except Exception as e:
        print(f"An error occurred during initialization: {e}, df_courses: {df_courses}, df_users: {df_users}")
        raise

class GNNViewSet(viewsets.ViewSet):
    def create(self, request):
        try:
            # Initialize resources
            initialize_resources()

            nuser_data = request.data
            print("User data received:", nuser_data)

            if not nuser_data:
                return Response({"error": "No user data provided"}, status=status.HTTP_400_BAD_REQUEST)

            cleaner = NewUserDataCleaner()
            user_features_tensor, user_df, max_careers, max_areas = encode_new_user(unique_subjects, nuser_data, cleaner, area_encoder)

            if data is None:
                return Response({"error": "Data not properly loaded"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            if model is None:
                return Response({"error": "Model not properly loaded"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            if graph is None:
                return Response({"error": "Graph not properly loaded"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            recommendations = recommend_for_new_user(user_features_tensor, user_df, max_careers, data, model, graph, coursesdata, max_areas)

            return Response(recommendations, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Exception in GNNViewSet.create: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
