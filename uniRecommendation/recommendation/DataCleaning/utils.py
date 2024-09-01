import torch
import torch.nn as nn
import torch.nn.functional as F
import networkx as nx
from .DataCleanerTemplate import DataCleanerTemplate

# 7. Recommendation for New Users
def recommend_for_new_user(new_user_features, data, model, graph, coursedata):
    # Extract course nodes and their IDs
    course_nodes = [node for node, data in graph.nodes(data=True) if data['bipartite'] == 1]
    node_to_oId = {node: data['oId'] for node, data in graph.nodes(data=True) if data['bipartite'] == 1}

    model.eval()
    with torch.no_grad():
        # Adjust new user feature size if necessary
        existing_feature_dim = data.x.size(1)
        new_user_feature_dim = new_user_features.size(0)

        if new_user_feature_dim != existing_feature_dim:
            print(f"Adjusting new user feature size from {new_user_feature_dim} to {existing_feature_dim}")
            if new_user_feature_dim < existing_feature_dim:
                padding = torch.zeros(existing_feature_dim - new_user_feature_dim)
                new_user_features = torch.cat([new_user_features, padding])
            else:
                new_user_features = new_user_features[:existing_feature_dim]

        # Add new user node to the graph
        new_user_index = data.num_nodes
        data.x = torch.cat([data.x, new_user_features.unsqueeze(0)], dim=0)

        # Compute embeddings for all nodes
        embeddings = model(data)

        # Compute similarity scores between the new user and all courses
        course_indices = torch.arange(len(data.x) - len(course_nodes), len(data.x))
        new_user_embedding = embeddings[new_user_index]
        similarity_scores = torch.matmul(embeddings[course_indices], new_user_embedding)

        # Generate course weights correctly
        course_weights = torch.zeros(len(course_nodes), dtype=torch.float)
        for i, course_node in enumerate(course_nodes):
            if graph.has_edge(new_user_index, course_node):
                course_weights[i] = graph.get_edge_data(new_user_index, course_node).get('weight', 0)

        # Rank courses by similarity scores and weights
        weighted_scores = similarity_scores * course_weights

        # Set a threshold to filter out low-confidence scores
        threshold = 0.5
        weighted_scores = torch.where(weighted_scores > threshold, weighted_scores, torch.tensor(0.0))

        # Get top-k recommended courses
        top_k = len(course_nodes)
        recommended_course_indices = weighted_scores.topk(k=top_k).indices

        # Generate recommendations based on top-k courses
        recommendations = []
        for course_index in recommended_course_indices:
            course_id_node = course_nodes[course_index.item()]  # Get the node ID for the course
            course_oId = node_to_oId.get(course_id_node, None)  # Get the OID for the course

            # Find the course in the data
            course = next((c for c in coursedata if c.get("course_id") == course_oId), None)
            if course:
                course_info = {
                    "Course Code": course.get("course_code", "N/A"),
                    "Course Name": course.get("course_name", "N/A"),
                    "University": course.get("uni_name", "N/A"),
                    "Specialization": course.get("specialization_name", "None"),
                    "Duration": f"{course.get('duration', 'N/A')} years",
                }
                recommendations.append(course_info)

        return recommendations




import pandas as pd

import pandas as pd

class NewUserDataCleaner(DataCleanerTemplate):
    def create_subject_columns(self, df_users, subjects):
        if "Results" in df_users.columns:
            for subject in subjects:
                column_name = f"{self.correct_subject_name(subject)}_grade"
                df_users[column_name] = 0.0
            for idx, user_results in enumerate(df_users["Results"]):
                if isinstance(user_results, list):
                    for result in user_results:
                        subject = self.correct_subject_name(result["subject"])
                        grade = self.get_grade_value(result.get("grade", 0.0))
                        column_name = f"{subject}_grade"
                        df_users.at[idx, column_name] = grade

    def encode_user(self, unique_subjects, user_raw):
        user_df = pd.DataFrame([user_raw])

        # Encode locations, university, areas, and stream
        self.encode_and_expand_locations(user_df, user_df, "Locations")
        self.apply_label_encoding(user_df, user_df, "Preferred University")
        area_encoder = self.fit_area_encoder(user_df, 'areas')
        self.encode_and_expand_areas(area_encoder, user_df, user_df, 'areas')
        self.process_stream(user_df, user_df, "Stream")

        # Process duration and English grades
        user_df["duration"] = user_df["duration"].apply(self.extract_years)
        user_df["English"] = user_df["English"].apply(lambda r: self.get_grade_value(r) if isinstance(r, str) else 0)

        # Correct and process Results
        if "Results" in user_raw and isinstance(user_raw["Results"], list):
            corrected_results = []
            for result in user_raw["Results"]:
                if isinstance(result, dict):
                    subject = self.correct_subject_name(result.get("subject", ""))
                    grade = self.get_grade_value(result.get("grade", None))
                    corrected_results.append({"subject": subject, "grade": grade})
            user_raw["Results"] = corrected_results
        else:
            user_raw["Results"] = []

        # Get unique subjects from existing data
        unique_subjects = self.get_unique_subjects(user_raw["Results"])

        # Create subject columns for the new user
        self.create_subject_columns(user_df, unique_subjects)

        # Extract user features
        user_features = [
            user_df["Stream_encoded"].iloc[0],
            user_df["duration"].iloc[0],
            user_df["English"].iloc[0],
            *user_df[[f"Area_{i}" for i in range(1, 10)]].iloc[0].tolist(),
            *user_df[[f"Location_{i}" for i in range(1, 10)]].iloc[0].tolist(),
            *user_df[[f"{subject}_grade" for subject in unique_subjects]].iloc[0].tolist(),
        ]

        return user_features, user_df

    def get_unique_subjects(self, data):
        unique_subjects = []
        for results in data:
            if isinstance(results, list):
                for res in results:
                    if res["subject"] not in unique_subjects:
                        unique_subjects.append(res["subject"])
        print(len(unique_subjects))  # Print the length before returning
        return sorted(unique_subjects)




def encode_new_user(unique_subjects,new_user_raw, cleaner):
    # Clean and encode user data

    user_features, user_df= cleaner.encode_user(unique_subjects,new_user_raw)

    user_features_tensor = torch.tensor(user_features,dtype=torch.float)
    return user_features_tensor,user_df
