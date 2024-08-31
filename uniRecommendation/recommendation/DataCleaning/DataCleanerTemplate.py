import pandas as pd
import hashlib
import re
from sklearn.preprocessing import LabelEncoder, OrdinalEncoder
from bson import ObjectId 

global unique_subjects
unique_subjects = []

class DataCleanerTemplate:
    """Base class for common data-cleaning operations."""
    def __init__(self):
        self.label_encoder = LabelEncoder()
        self.ordinal_encoder = OrdinalEncoder()
        self.grade_values = {
            "A": 5,
            "B": 4,
            "C": 3,
            "S": 2,
            "W": 1,
        }
        self.initial_id = 0
        self.subject_correction_mapping = {
          "Combined Mathes": "Combined Mathematics",
          "Combine Maths": "Combined Mathematics",
          "Combine Mathes": "Combined Mathematics",
          "Engineering technology" : "Engineering Technology",
          "Biosystems technology" : "Biosystems Technology",
          "Bio Systems Technology" : "Biosystems Technology",
          "Biosystems Technology " : "Biosystems Technology",
          "Bio System Technology" : "Biosystems Technology",
          "Bio Technology" : "Biosystems Technology",
          "Information and communication technology" : "Information & Communication Technology",
          "Information and Communication Technology" : "Information & Communication Technology",
          "Agri Science" : "Agricultural Science"
         }
        self.area_correction_mapping = {
          "Science and Technology": "Science & Technology",
          "Agriculture Science" : "Agricultural Sciences",
          "Medicine and Health Care" : "Medicine & Health Care",
          "Bussiness and Management" : "Business & Management",
          "Bussiness & Managment" : "Business & Management",
          "Bussiness & Management" : "Business & Management"
        }
        self.stream_correction_mapping = {
          "Engineering Technology": "Engineering Technology Stream",
          "Bio Technology": "Bio Technology Stream"
        }

        self.stream_categories = [
            "Biological Science Stream",
            "Physical Science Stream",
            "Commerce Stream",
            "Arts Stream",
            "Bio Technology Stream",
            "Engineering Technology Stream",
            "Technology",
        ]
        self.unique_career_areas = set()

        self.locations_unique_order = [
          "Central Province", "Western Province", "Sabaragamuwa Province", "North Western Province", "North Central Province",
          "Southern Province", "Uva Province", "Eastern Province", "Northern Province",
        ]

        self.encoder = OrdinalEncoder(categories=[self.locations_unique_order])

        self.area_encoder = None

    def apply_label_encoding(self, df,df_clean, column_name):
      """Applies label encoding to a specified column."""
      if column_name in df.columns:
              df_clean[f"{column_name}_encoded"] = self.label_encoder.fit_transform(df[column_name])
      else:
          print(f"Column '{column_name}' not found in the ")

    def correct_subject_name(self, subject):

       return self.subject_correction_mapping.get(subject, subject)

    def correct_area_name(self, area):
       return self.area_correction_mapping.get(area, area)


    def hash_to_numeric(self, user_id):
        """Converts ObjectId to a unique 10-digit numeric value."""
        user_id_str = str(user_id) if isinstance(user_id, ObjectId) else str(user_id)
        hashed_value = int(hashlib.sha256(user_id_str.encode()).hexdigest(), 16)
        return str(hashed_value)[:10]

    def extract_years(self, duration_str):
        """Extracts numeric value from a duration string."""
        match = re.search(r"\d+", duration_str)
        return int(match.group(0)) if match else None

    def get_grade_value(self, grade):
        """Returns the numeric value for a given grade."""
        return self.grade_values.get(grade.upper(), 0)




    def process_stream(self, df, df1, column_name):
        # Correct stream names
        df[column_name] = df[column_name].apply(lambda x: self.stream_correction_mapping.get(x, x))

        self.label_encoder.fit(self.stream_categories)
        # Encode corrected stream names
        df1[f'{column_name}_encoded'] = self.label_encoder.transform(df[column_name])

        return df1[f'{column_name}_encoded']


    def correct_province_typos(self, province):
        typo_corrections = {"Nothern Province": "Northern Province"}

        return typo_corrections.get(province, province)

    def get_province(self, university):
        """Returns the corrected province for a university."""
        province = university.get("province") or university.get("Province")

        return self.correct_province_typos(province) if province else "Unknown"




    def encode_and_expand_locations(self, df, df_cleaned, locations_col):
        """Encodes locations and expands them into separate columns."""
        # Flatten the locations list into a single column DataFrame
        flattened_locations = [location for sublist in df[locations_col] for location in sublist]

        # Fit the encoder using raw array
        locations_array = [[loc] for loc in flattened_locations]
        self.encoder.fit(locations_array)

        # Transform locations in the original dataframe
        def encode_list(loc_list):
            encoded = [self.encoder.transform([[loc]])[0][0] if loc in self.locations_unique_order else -1 for loc in loc_list]
            return encoded

        encoded_lists = df[locations_col].apply(encode_list)

        # Prepare the expanded DataFrame with NaN
        max_locations = len(self.locations_unique_order)
        expanded_df = pd.DataFrame(index=df.index, columns=[f"Location_{i + 1}" for i in range(max_locations)])
        expanded_df[:] = float('nan')

        # Populate the expanded DataFrame
        for idx, encoded_list in enumerate(encoded_lists):
            for col_idx, loc in enumerate(encoded_list):
                if loc >= 0:
                    expanded_df.iloc[idx, col_idx] = loc

        # Add the expanded locations to the cleaned DataFrame
        df_cleaned[[f"Location_{i + 1}" for i in range(max_locations)]] = expanded_df

    def encode_provinces(self, df_courses_cleaned, province_col):
        """Encodes the 'province' column using the same OrdinalEncoder."""
        # Convert province column to a list
        provinces = df_courses_cleaned[province_col].dropna().tolist()  # Drop NaN values before encoding

        # Fit the encoder with valid province data
        self.encoder.fit([[province] for province in self.locations_unique_order])

        # Transform the provinces using the fitted encoder
        provinces_encoded = [self.encoder.transform([[province]])[0][0] if province in self.locations_unique_order else -1 for province in provinces]

        # Add the encoded provinces to the DataFrame
        df_courses_cleaned["province_encoded"] = provinces_encoded

        # Convert the encoded values to float and handle unknown values
        df_courses_cleaned["province_encoded"] = df_courses_cleaned["province_encoded"].astype(float)
        df_courses_cleaned["province_encoded"] = df_courses_cleaned["province_encoded"].replace(-1, pd.NA)

    def fit_area_encoder(self, df, areas_col):
        """Fits the area encoder based on unique areas in the provided data."""
        # Correct area names
        
        corrected_areas = [self.correct_area_name(area) for sublist in df[areas_col] for area in sublist]
       
        unique_areas = list(set(corrected_areas))
    
        area_encoder = OrdinalEncoder(categories=[unique_areas])
   
        
        area_encoder.fit([[area] for area in unique_areas])
        
        print("Area encoder fitted with categories:", unique_areas)
        return area_encoder

    def encode_and_expand_areas(self, area_encoder,df, df_cleaned, areas_col):
        """Encodes areas and expands them into separate columns."""
        if area_encoder is None:
            raise ValueError("Area encoder has not been fitted. Please call fit_area_encoder() first.")

        # Apply area correction mapping before encoding
        corrected_areas = df[areas_col].apply(lambda areas: [self.correct_area_name(area.strip()) for area in areas])

        flattened_areas = [area for sublist in corrected_areas for area in sublist]
        areas_array = [[area] for area in flattened_areas]

        def encode_list(area_list):
            encoded = [area_encoder.transform([[area]])[0][0] if area in area_encoder.categories_[0] else -1 for area in area_list]
            return encoded

        encoded_lists = corrected_areas.apply(encode_list)

        max_areas = 10  # Using max_areas to determine max areas
        expanded_df = pd.DataFrame(index=df.index, columns=[f"Area_{i + 1}" for i in range(max_areas)])
        expanded_df[:] = float('nan')

        for idx, encoded_list in enumerate(encoded_lists):
            for col_idx, area in enumerate(encoded_list):
                if area >= 0:
                    expanded_df.iloc[idx, col_idx] = area

        df_cleaned[[f"Area_{i + 1}" for i in range(max_areas)]] = expanded_df

    def encode_areas(self,area_encoder, df, df_cleaned, areas_col):
        """Encodes the 'area' column using the area encoder and handles new areas."""
        if area_encoder is None:
            raise ValueError("Area encoder has not been fitted. Please call fit_area_encoder() first.")

        # Apply area correction mapping before encoding
        corrected_areas = df[areas_col].dropna().apply(lambda area: self.correct_area_name(area.strip()))

        # Check for new areas that are not in the training data
        unknown_areas = corrected_areas[~corrected_areas.isin(area_encoder.categories_[0])]
        if not unknown_areas.empty:
            print(f"Error: Found new areas in df that are not in the training data: {unknown_areas.unique()}")

        # Transform the corrected areas using the fitted encoder
        areas_encoded = [area_encoder.transform([[area]])[0][0] if area in area_encoder.categories_[0] else -1 for area in corrected_areas]

        # Add the encoded areas to the cleaned DataFrame
        df["area_encoded"] = areas_encoded
        df_cleaned["area_encoded"] = df["area_encoded"].astype(float)

        # Replace unknown values (-1) with NaN
        df_cleaned["area_encoded"] = df_cleaned["area_encoded"].replace(-1, pd.NA)




    def encode_and_expand_career_areas(self,df, cleaned_df, career):

        # Create a sorted list of unique career areas
        unique_career_areas = set()
        for career_areas in df[career]:
            unique_career_areas.update(career_areas)

        career_areas_order = sorted(list(unique_career_areas))

        # Initialize the OrdinalEncoder with the unique order
        career_areas_encoder = OrdinalEncoder(categories=[career_areas_order])

        # Encode the career areas
        cleaned_df[f"{career}_encoded"] = df[career].apply(
            lambda career_areas: career_areas_encoder.fit_transform(
                pd.DataFrame(career_areas, columns=[career])
            ).flatten()
        )

        # Determine the maximum number of career areas
        max_career_count = max(len(career_areas) for career_areas in df[career])

        # Expand the encoded career areas into separate columns
        for idx, career_encoded in enumerate(cleaned_df[f"{career}_encoded"]):
            for i in range(max_career_count):
                if i < len(career_encoded):
                    val = career_encoded[i]
                else:
                    val = 0.0  # Default value for columns without data

                cleaned_df.loc[idx, f"{career}_{i + 1}"] = val  # Create columns like career_1, career_2, etc.

    def map_subject_grades(self, df):
        global unique_subjects  # Declare 'unique_subjects' as global

        # Initialize `unique_subjects` if it's not already initialized
        if 'unique_subjects' not in globals():
            unique_subjects = set()  # Initialize as a set to ensure uniqueness

        # Update unique subjects from the current data
        if "Results" in df.columns:
            for idx, user_results in enumerate(df["Results"]):
                if isinstance(user_results, list):
                    for result in user_results:
                        subject = result.get("subject", "").strip()
                        grade = result.get("grade", 0.0)  # Default to 0.0 if no grade
                        column_name = f"{subject}_grade"

                        # Ensure the column exists with default 0.0
                        if column_name not in df.columns:
                            df[column_name] = 0.0  # Initialize with 0.0 for safety

                        df.loc[idx, column_name] = grade  # Update the column with the actual grade

                        if subject not in unique_subjects:
                            unique_subjects.append(subject)


        return df

    def handle_missing_values(self, df):
        """Fills NaN values in numeric columns with zeros."""
        numeric_columns = df.select_dtypes(include=["number"]).columns
        df[numeric_columns] = df[numeric_columns].fillna(0.0)

    def clean_data(self, df):
        """Template method to be implemented by subclasses."""
        raise NotImplementedError("Subclasses must implement this method.")
    
    def get_unique_subjects(self):
        """Returns the list of unique subjects."""
        global unique_subjects
        return unique_subjects



