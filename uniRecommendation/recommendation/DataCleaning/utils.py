import torch
import torch.nn as nn
import torch.nn.functional as F
import networkx as nx
from .DataCleanerTemplate import DataCleanerTemplate
from  recommendation.DataProcessing.logics import meets_prerequisites, calculate_matching_score, calculate_career_score

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

    def encode_user(self, unique_subjects, user_raw,area_encoder):
        user_df = pd.DataFrame([user_raw])
        max_areas = len(user_df['areas'].iloc[0])

        # Encode locations, university, areas, and stream
        self.encode_and_expand_locations(user_df, user_df, "Locations")
        self.apply_label_encoding(user_df, user_df, "Preferred_University")
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

        user_df["Results"] = user_df["Results"].apply(
            lambda res: [
                {"subject": self.correct_subject_name(r["subject"]), "grade": self.get_grade_value(r["grade"])}
                for r in res
            ]
        )

        max_careers =user_df['Career_Areas'].apply(len).max()

        # Step 2: Create new columns for each career area
        for i in range(max_careers):
           user_df[f'Career_{i+1}'] =user_df['Career_Areas'].apply(lambda x: x[i] if i < len(x) else None)

        # Extract user features
        user_features = [
            user_df["Stream_encoded"].iloc[0],
            user_df["duration"].iloc[0],
            user_df["English"].iloc[0],
            *user_df[[f"Area_{i}" for i in range(1, 10)]].iloc[0].tolist(),
            *user_df[[f"Location_{i}" for i in range(1, 10)]].iloc[0].tolist(),
            *user_df[[f"{subject}_grade" for subject in unique_subjects]].iloc[0].tolist(),
        ]

        return user_features, user_df, max_careers,max_areas

    def get_unique_subjects(self, data):
        unique_subjects = []
        for results in data:
            if isinstance(results, list):
                for res in results:
                    if res["subject"] not in unique_subjects:
                        unique_subjects.append(res["subject"])
        print(len(unique_subjects))  # Print the length before returning
        return sorted(unique_subjects)




def encode_new_user(unique_subjects,new_user_raw, cleaner,area_encoder):
    # Clean and encode user data

    user_features, user_df, max_careers , max_areas= cleaner.encode_user(unique_subjects,new_user_raw, area_encoder)

    user_features_tensor = torch.tensor(user_features,dtype=torch.float)
    return user_features_tensor,user_df,max_careers,max_areas



def recommend_for_new_user(new_user_features, user_df,max_careers, data, model, graph, coursedata, max_areas):
    # Convert user_df to dictionary for easier access
    new_user = user_df.to_dict(orient='records')[0]  # Assuming a single user

    # Extract course nodes and their IDs
    course_nodes = [node for node, data in graph.nodes(data=True) if data.get('bipartite') == 1]
    node_to_oId = {node: data.get('oId') for node, data in graph.nodes(data=True) if data.get('bipartite') == 1}

    if not course_nodes:
        raise ValueError("No course nodes found in the graph.")

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
        new_user_embedding = embeddings[new_user_index]

        # Compute similarity scores between the new user and all courses
        course_node_indices = [data.x.size(0) - len(course_nodes) + i for i in range(len(course_nodes))]
        course_indices = torch.tensor(course_node_indices)
        similarity_scores = torch.matmul(embeddings[course_indices], new_user_embedding.unsqueeze(1)).squeeze()

        # Print out similarity scores for debugging
        #print("Similarity Scores:", similarity_scores)

        # Set a threshold to filter out low-confidence scores
        threshold = 0.1  # Lower threshold to ensure scores are not zeroed out
        weighted_scores = torch.where(similarity_scores > threshold, similarity_scores, torch.tensor(0.0))

        # Get top-k recommended courses, sorted by their scores
        top_k = len(course_nodes)
        sorted_scores, sorted_indices = weighted_scores.sort(descending=True)

        # Generate recommendations based on sorted indices
        recommendations = []
        for idx in sorted_indices:
            course_index = idx.item()
            course_id_node = course_nodes[course_index]  # Get the node ID for the course
            course_oId = node_to_oId.get(course_id_node, None)  # Get the OID for the course

            # Find the course in the data
            course = next((course for course in coursedata if course.get("course_id") == course_oId), None)
            if course:
                if meets_prerequisites(new_user, course):
                    
                    matching_score, stream_score, location_score, area_score, duration_score = calculate_matching_score(new_user, course, max_areas)
                    career_score = calculate_career_score(new_user, course, max_careers)
                    course_info = {
                        "Course Code": course.get("course_code", "N/A"),
                        "Course Name": course.get("course_name", "N/A"),
                        "University": course.get("uni_name", "N/A"),
                        "Specialization": course.get("specialization_name", "None"),
                        "Duration": f"{course.get('duration', '4')} years",
                        "Score": matching_score + career_score,  # Add score to recommendation
                        "Area Score": area_score,
                        "Location Score": location_score,
                        "Duration Score": duration_score,
                        "Career Score": career_score,
                        "Stream Score": stream_score
                    }
                    recommendations.append(course_info)
                #else:
                    #print(f"Course {course.get('course_name')} does not meet prerequisites for user")

        # Sort recommendations first by area_score, then by location_score, then by duration_score
        recommendations.sort(key=lambda x: (x["Score"],x["Career Score"],x["Area Score"], x["Location Score"], x["Duration Score"]), reverse=True)

        return recommendations
