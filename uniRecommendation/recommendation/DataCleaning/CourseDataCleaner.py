
from sklearn.preprocessing import LabelEncoder, OrdinalEncoder
from .DataCleanerTemplate import DataCleanerTemplate
import pandas as pd  
from sklearn.preprocessing import LabelEncoder, OrdinalEncoder

class CourseDataCleaner(DataCleanerTemplate):
    """Specific implementation of data cleaning for course data."""

    def fit_area_encoder_on_user_data(self, df_users, areas_col):
        """Fits the area encoder based on user data."""
        self.fit_area_encoder(df_users, areas_col)

    def clean_data(self, df_courses, df_users):
          
        
        """Applies data-cleaning operations on the course DataFrame."""
        # Create a DataFrame from university-specialization pairs
        uni_specializations = []
        for _, row in df_courses.iterrows():
            universities = row.get("universities", [])
            if isinstance(universities, list):
                for uni in universities:

                    # Extract duration with validation
                    uni_duration = self.extract_years(uni.get("duration")) if isinstance(uni, dict) else ""
                                  

                    specilizations = uni.get('specializations', [])

                    if len(specilizations) > 0:
                      
                        for spec in uni["specializations"]:
                            spec_name = spec.get("name", "Unknown") if isinstance(spec, dict) else spec
                            spec_duration = self.extract_years(spec.get("duration", "")) if isinstance(spec, dict) else None

                            uni_specializations.append({
                                "course_name": str(row.get("course_name", "") or ""),
                                "course_code": str(row.get("course_code", "") or ""),
                                "english_requirement": str(row.get("english_requirement", "") or ""),
                                "minimum_eligibility_requirements":row.get("minimum_eligibility_requirements", "") ,
                                "stream": str(row.get("stream", "") or ""),
                                "area": str(row.get("area", "") or ""),
                                "uni_name": str(uni.get("uni_name", "") or ""),
                                "province": str(self.get_province(uni) or ""),
                                "duration": str(spec_duration or uni_duration or ""),
                                "specialization_name": str(spec_name or ""),
                            })
                    else:
                       
                        uni_specializations.append({
                            "course_name": str(row.get("course_name", "") or ""),
                            "course_code": str(row.get("course_code", "") or ""),
                            "english_requirement": str(row.get("english_requirement", "") or ""),
                            "minimum_eligibility_requirements": row.get("minimum_eligibility_requirements", "") ,
                            "stream": str(row.get("stream", "") or ""),
                            "area": str(row.get("area", "") or ""),
                            "uni_name": str(uni.get("uni_name", "") or ""),
                            "province": str(self.get_province(uni) or ""),
                            "duration": str(uni_duration or ""),
                            "specialization_name": str(""),
                        })
                        
        df_courses_cleaned = pd.DataFrame(uni_specializations)

        initial_id = 0

        # Adding a column with unique 10-digit IDs
        df_courses_cleaned['course_id'] = range(initial_id, initial_id + len(df_courses_cleaned))
        
       
        # Fit the encoder using user data
       
        

        # Encode course areas
        self.encode_areas(df_users,df_courses_cleaned, df_courses_cleaned, 'area')
  
        df_courses_cleaned['stream_encoded'] = self.process_stream(df_courses_cleaned, df_courses_cleaned, "stream")

        # Apply encoding to key columns
        self.apply_label_encoding(df_courses_cleaned,df_courses_cleaned, "course_name")


        # Apply label encoding to text fields
        self.apply_label_encoding(df_courses_cleaned,df_courses_cleaned, "uni_name")
        self.apply_label_encoding(df_courses_cleaned,df_courses_cleaned, "specialization_name")

        self.encode_provinces(df_courses_cleaned, 'province')

        # Apply the encoding function to 'minimum_eligibility_requirements'
        df_courses_cleaned["minimum_eligibility_requirements"] = df_courses_cleaned["minimum_eligibility_requirements"].apply(
            lambda reqs: [{"subjects": r.get("subjects", []), "grade": self.grade_values.get(r.get("grade", ""))} for r in reqs]
        )

        # Ensure the proper structure of 'eligibility_requirements_encoded'
        def is_proper_structure(req):
            return isinstance(req, list) and all(isinstance(r, dict) for r in req)

        df_courses_cleaned["eligibility_requirements_encoded"] = df_courses_cleaned["minimum_eligibility_requirements"].apply(
            lambda req: req if is_proper_structure(req) else []
        )

        # Check for the maximum subject count, with additional validation
        max_subject_count = 0

        for req in df_courses_cleaned["eligibility_requirements_encoded"]:
            if isinstance(req, list) and req and isinstance(req[0], dict):
                max_subject_count = max(max_subject_count, len(req[0].get("subjects", [])))

        global column_names

        # Create column names for subjects
        column_names = [f"subject_{i + 1}" for i in range(max_subject_count)]

        # Prepare subject data with proper checks
        subject_data = []

        for req in df_courses_cleaned["eligibility_requirements_encoded"]:
            subject_row = {col: None for col in column_names}  # Initialize with None

            if isinstance(req, list) and req and isinstance(req[0], dict):
                subjects = req[0].get("subjects", [])
                if isinstance(subjects, list):
                    for i, subject in enumerate(subjects):
                        subject_row[column_names[i]] = subject  # Add valid subjects
            subject_data.append(subject_row)

        # Create a DataFrame for subjects and grade
        df_subjects = pd.DataFrame(subject_data)

        # Encode subjects using LabelEncoder
        label_encoder = LabelEncoder()

        # Flatten all subjects to get a list of unique subjects for fitting the encoder
        all_subjects = [subject for sublist in df_subjects.values for subject in sublist if subject is not None]

        # Fit the label encoder
        label_encoder.fit(all_subjects)

        # Apply label encoding to the subject DataFrame
        for col in df_subjects.columns:
            df_subjects[col] = df_subjects[col].map(lambda x: label_encoder.transform([x])[0] if x is not None else None)


        # Add a grade column with proper checks
        df_subjects["grade_encoded"] = [
            req[0].get("grade", None) if isinstance(req, list) and req and isinstance(req[0], dict) else None
            for req in df_courses_cleaned["eligibility_requirements_encoded"]
        ]

        # Concatenate with 'df_courses_cleaned'
        df_courses_cleaned = pd.concat([df_courses_cleaned, df_subjects], axis=1)

        # Handle English grade requirement
        df_courses_cleaned["english_requirement"] = df_courses_cleaned.get("english_requirement", [None]).apply(
            lambda r: self.grade_values.get(r, 0) if r is not None else 0
        )

        columns_to_drop = ["eligibility_requirements_encoded"]

        df_courses_cleaned.drop(columns_to_drop, axis=1, inplace=True)
        df_courses_cleaned.fillna(0, inplace=True)


        # Handle NaN values and other operations
        self.handle_missing_values(df_courses_cleaned)

        return df_courses_cleaned ,column_names

