from .DataCleanerTemplate import DataCleanerTemplate
import pandas as pd




class UserDataCleaner(DataCleanerTemplate):
    """Specific implementation of data cleaning for user data."""

    def clean_data(self, df_users):
        """Applies data-cleaning operations on the user DataFrame."""
        df_users_cleaned = pd.DataFrame()

        # Adding a column with unique 10-digit IDs
        initial_id = len(df_users_cleaned)
        df_users_cleaned['user_id'] = range(initial_id, initial_id + len(df_users_cleaned))

        df_users_cleaned["duration"] = df_users["duration"].apply(self.extract_years)

        # Apply grade mapping to 'English'
        df_users_cleaned["English"] = df_users["English"].apply(
            lambda r: self.get_grade_value(r) if isinstance(r, str) else 0
        )

        # Apply label encoding for 'Preferred University'
        self.apply_label_encoding(df_users,df_users_cleaned, "Preferred_University")

                # Fit the encoder on user data
        area_encoder = self.fit_area_encoder(df_users, 'areas')

        # Encode and expand areas in user data
        self.encode_and_expand_areas(area_encoder ,df_users, df_users_cleaned, 'areas')
        self.process_stream(df_users, df_users_cleaned, "Stream")

        # Encode and expand locations
        self.encode_and_expand_locations(df_users,df_users_cleaned, "Locations")



        # Handle subject-grade mapping
        df_users_cleaned["Results"] = df_users["Results"].apply(
            lambda res: [
                {"subject": self.correct_subject_name(r["subject"]), "grade": self.get_grade_value(r["grade"])}
                for r in res
            ]
        )
        

        # Map subject grades and create columns for all unique subjects
        self.map_subject_grades(df_users_cleaned)

        # Handle NaN values in numeric columns
        self.handle_missing_values(df_users_cleaned)

        df_users_cleaned.fillna(0, inplace=True)


        # Step 1: Find the maximum number of career areas in any row
        max_careers = df_users['Career_Areas'].apply(len).max()

        # Step 2: Create new columns for each career area
        for i in range(max_careers):
            df_users_cleaned[f'Career_{i+1}'] = df_users['Career_Areas'].apply(lambda x: x[i] if i < len(x) else None)

        unique_subjects = self.get_unique_subjects()


        return df_users_cleaned , unique_subjects , area_encoder 


