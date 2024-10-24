import pandas as pd
from django.core.management.base import BaseCommand
from recommendation.DataCleaning.dataFetcher import fetchData
from recommendation.DataCleaning.CourseDataCleaner import CourseDataCleaner
from recommendation.DataCleaning.UserDataCleaner import UserDataCleaner
from recommendation.DataProcessing.graphProcessing import prepare_graph
import torch
print("CUDA available:", torch.cuda.is_available())
print("Number of GPUs:", torch.cuda.device_count())
print("Current GPU device:", torch.cuda.current_device())
print("GPU name:", torch.cuda.get_device_name(torch.cuda.current_device()))


class Command(BaseCommand):
    help = 'Fetch courses and users data from API, clean the data, and prepare the graph.'

    def handle(self, *args, **kwargs):
        # Define the URLs for the API endpoints
        courses_url = 'http://localhost:8000/api/courses'
        users_url = 'http://localhost:8000/api/users'

        # Set display options for DataFrames
        pd.set_option('display.max_columns', None)
        pd.set_option('display.expand_frame_repr', False)
        pd.set_option('display.max_rows', None)

        try:
            # Fetch and process data
            df_courses, df_users = fetchData(courses_url, users_url)
            
            if df_users is not None:
                user_cleaner = UserDataCleaner()
                df_users_cleaned, unique_subjects , area_encoder  = user_cleaner.clean_data(df_users)
                userdata = df_users_cleaned.to_dict(orient='records')
    
                #print(df_users_cleaned)
            else:
                self.stdout.write("User DataFrame not found.")
                df_users_cleaned = None

            if df_courses is not None:
                course_cleaner = CourseDataCleaner()
                if df_users_cleaned is not None:
                    df_courses_cleaned, column_names = course_cleaner.clean_data(df_courses, area_encoder)
                    coursesdata = df_courses_cleaned.to_dict(orient='records')
                    #print(df_courses_cleaned)
                else:
                    self.stdout.write("User data not available for course cleaning.")
                    df_courses_cleaned = None
            else:
                self.stdout.write("Courses DataFrame not found.")
                df_courses_cleaned = None

           # graph = prepare_graph(userdata,coursesdata)
        #   self.stdout.write("Graph prepared successfully")
            
        except Exception as e:
            self.stderr.write(f"An error occurred: {str(e)}")
