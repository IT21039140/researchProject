from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import warnings

def meets_prerequisites(user_info, course):
    user_results = {result['subject']: result['grade'] for result in user_info['Results']}
    user_results['English'] = user_info['English']

    prerequisites = course['minimum_eligibility_requirements']
    prerequisites_met = False

    if len(prerequisites) == 1:
        prerequisite = prerequisites[0]
        matching_subjects = [
            subject for subject in prerequisite['subjects']
            if user_results.get(subject, 0) >= prerequisite['grade']
        ]
        if len(matching_subjects) >= 3:
            prerequisites_met = True

    elif len(prerequisites) == 2:
        prerequisite1, prerequisite2 = prerequisites
        subjects_met_prerequisite1 = [subject for subject in prerequisite1['subjects'] if user_results.get(subject, 0) >= prerequisite1['grade']]
        subjects_met_prerequisite2 = [subject for subject in prerequisite2['subjects'] if user_results.get(subject, 0) >= prerequisite2['grade'] ]
        if len(subjects_met_prerequisite1) >= 1 and len(subjects_met_prerequisite2) >= 1 and len(subjects_met_prerequisite1) + len(subjects_met_prerequisite2) >= 3:
            prerequisites_met = True

    elif len(prerequisites) == 3:
        prerequisite1, prerequisite2, prerequisite3 = prerequisites
        subjects_met_prerequisite1 = [subject for subject in prerequisite1['subjects'] if user_results.get(subject, 0) >= prerequisite1['grade']]
        subjects_met_prerequisite2 = [subject for subject in prerequisite2['subjects'] if user_results.get(subject, 0) >= prerequisite2['grade'] ]
        subjects_met_prerequisite3 = [subject for subject in prerequisite3['subjects'] if user_results.get(subject, 0) >= prerequisite3['grade'] ]
        if len(subjects_met_prerequisite1) >= 1 and len(subjects_met_prerequisite2) >= 1 and len(subjects_met_prerequisite3) >= 1 and len(subjects_met_prerequisite2)+ len(subjects_met_prerequisite1) + len(subjects_met_prerequisite2) >= 3:
            prerequisites_met = True

    english_requirement_met = True
    if 'english_requirement' in course:
        english_req = course['english_requirement']
        if english_req and user_results.get("English", 0) < english_req:
            english_requirement_met = False

    return prerequisites_met and english_requirement_met


# Function to safely convert a value to an integer
def safe_int_conversion(value, default=0):
    try:
        return int(value)
    except (ValueError, TypeError):
        return default

import warnings
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Suppress the specific FutureWarning
warnings.filterwarnings("ignore", category=FutureWarning, message=".*clean_up_tokenization_spaces.*")

# Initialize Sentence-BERT model
model = SentenceTransformer('all-MiniLM-L6-v2')

def compute_similarity(career, specialization):
    # Encode career and specialization
    career_vec = model.encode([career])
    specialization_vec = model.encode([specialization])

    # Compute cosine similarity
    similarity_score = cosine_similarity(career_vec, specialization_vec)[0][0]

    return similarity_score * 10

def calculate_career_score(user, course, max_careers):
    # Initialize career score
    career_score = 0

    for i in range(1, max_careers + 1):  # Ensure the loop includes max_careers
        career = user.get(f'Career_{i}', None)
        specialization = course.get('specialization_name', None)
        course_name = course.get('course_name', None)

        if career:
            if specialization:
                # Add the similarity score and adjust it using (max_careers - i) as a weight
                career_score += compute_similarity(career, specialization) * (5- i)
                break
            elif course_name:
                # Add the similarity score and adjust it using (max_careers - i) as a weight
                career_score += compute_similarity(career, course_name) * (5 - i)
                break

    # Normalize career score to fit within a 0 to 10 scale
    max_score = max_careers * 10  # The maximum possible score
    career_score = min((career_score / max_score) * 10, 10)  # Scale it to a range of 0 to 10

    return career_score




def calculate_matching_score(user, course, max_areas):
    # Stream score: normalize to 0-1 range
    stream_score = 0
    if safe_int_conversion(user['Stream_encoded']) == safe_int_conversion(course['stream_encoded']):
        stream_score += 1  # Original was 10, now scaled to 1

    # Location score: normalize it to 0-1 range based on matching location
    location_score = 0
    for i in range(1, 10):
        user_location = safe_int_conversion(user.get(f'Location_{i}', 0))
        if user_location == safe_int_conversion(course['province_encoded']):
            location_score += (1 - i * 0.1)  # Original was 10, now scaled to 1
            break
    location_score = min(location_score, 1)

    # Area score: normalize it to 0-1 range based on matching area
    area_score = 0
    for i in range(1, max_areas):
        user_area = safe_int_conversion(user.get(f'Area_{i}', 0))
        if user_area == safe_int_conversion(course['area_encoded']):
            area_score += (1 - i * (1 / max_areas))  # Original was 10, now scaled to 1
            break
    area_score = min(area_score, 1)

    # Duration score: assign based on how well user duration matches course duration, scale it to 0-1
    duration_score = 0
    user_duration = safe_int_conversion(user['duration'])
    course_duration = safe_int_conversion(course['duration'])

    if user_duration == course_duration:
        duration_score += 1  # Original was 10, now scaled to 1
    elif user_duration > course_duration:
        duration_score += 0.7  # Equivalent of 7 on a 0-10 scale, scaled to 0-1
    else:
        duration_score += 0.5  # Equivalent of 5 on a 0-10 scale, scaled to 0-1

    # Combine all scores into a single float value, now on a 0-4 scale
    score = (stream_score + location_score + area_score + duration_score) * 4

    # Return the total score and individual component scores, all in the 0-4 range
    return score, stream_score * 10, location_score * 10, area_score * 10, duration_score * 10
