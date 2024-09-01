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

# Define URLs for fetching data
courses_url = 'http://localhost:8000/api/courses'
users_url = 'http://localhost:8000/api/users'

# Define base directory relative to current working directory
base_dir = os.getcwd()

# Initialize global variables for graph, model, and data
df_courses = df_users = None
graph = None
data = None
model = None
coursesdata = []
unique_subjects = []

def initialize_resources():
    global df_courses, df_users, graph, data, model, coursesdata, unique_subjects

    try:
        # Fetch and clean data
        df_courses, df_users = fetchData(courses_url, users_url)
        print(f"Data fetched: df_courses = {df_courses is not None}, df_users = {df_users is not None}")

        if df_users is not None:
            user_cleaner = UserDataCleaner()
            df_users_cleaned, unique_subjects, area_encoder = user_cleaner.clean_data(df_users)
            userdata = df_users_cleaned.to_dict(orient='records')
            
        else:
            print("User DataFrame not found.")

        if df_courses is not None:
            course_cleaner = CourseDataCleaner()
            df_courses_cleaned, column_names = course_cleaner.clean_data(df_courses, area_encoder)
            coursesdata = df_courses_cleaned.to_dict(orient='records')
            
        else:
            print("Courses DataFrame not found.")

        # Define paths for the graph, model, and data
        graph_filename = os.path.join(base_dir, 'recommendation', 'DataProcessing', 'graph.graphml')
        model_filename = os.path.join(base_dir, 'recommendation', 'DataProcessing', 'model_weights.pth')
        data_filename = os.path.join(base_dir, 'recommendation', 'DataProcessing', 'data.pt')

        print(f"Graph file path: {graph_filename}")
        print(f"Model file path: {model_filename}")
        print(f"Data file path: {data_filename}")

        # Load the graph
        graph = nx.read_graphml(graph_filename)
        print(f"Graph loaded: {graph is not None}")

        # Load the model and data
        data = torch.load(data_filename)  # Removed weights_only=True
        print(f"Data loaded: {data is not None}")

        input_dim = 63  # Adjust based on your setup
        hidden_dim = 64
        output_dim = 32
        model = CourseRecommendationGNN(input_dim, hidden_dim, output_dim)
        model.load_state_dict(torch.load(model_filename))  # Removed weights_only=True
        model.eval()
        print("Model loaded and set to eval mode")

    except Exception as e:
        print(f"An error occurred during initialization: {e}")
        raise


class GNNViewSet(viewsets.ViewSet):
    def create(self, request):
        """
        Handle POST requests to get course recommendations based on user data.
        """
        global df_courses, df_users, graph, data, model, coursesdata, unique_subjects

        try:
            # Initialize resources
            initialize_resources()

            user_data = request.data
            

            if not user_data:
                return Response({"error": "No user data provided"}, status=status.HTTP_400_BAD_REQUEST)

            cleaner = NewUserDataCleaner()
            user_features_tensor, _ = encode_new_user(unique_subjects, user_data, cleaner)
            

            if data is None:
                return Response({"error": "Data not properly loaded"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            if model is None:
                return Response({"error": "Model not properly loaded"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            if graph is None:
                return Response({"error": "Graph not properly loaded"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            recommendations = recommend_for_new_user(user_features_tensor, data, model, graph, coursesdata)
            print(f"Recommendations: {recommendations}")

            return Response(recommendations, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Exception in GNNViewSet.create: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
