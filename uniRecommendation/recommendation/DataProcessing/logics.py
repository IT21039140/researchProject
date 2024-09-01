from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

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
        subjects_met_prerequisite2 = [subject for subject in prerequisite2['subjects'] if user_results.get(subject, 0) >= prerequisite2['grade'] and subject not in subjects_met_prerequisite1]
        if len(subjects_met_prerequisite1) + len(subjects_met_prerequisite2) == 3:
            prerequisites_met = True

    elif len(prerequisites) == 3:
        prerequisite1, prerequisite2, prerequisite3 = prerequisites
        subjects_met_prerequisite1 = [subject for subject in prerequisite1['subjects'] if user_results.get(subject, 0) >= prerequisite1['grade']]
        subjects_met_prerequisite2 = [subject for subject in prerequisite2['subjects'] if user_results.get(subject, 0) >= prerequisite2['grade'] and subject not in subjects_met_prerequisite1]
        subjects_met_prerequisite3 = [subject for subject in prerequisite3['subjects'] if user_results.get(subject, 0) >= prerequisite3['grade'] and subject not in subjects_met_prerequisite1 and subjects_met_prerequisite2]
        if subjects_met_prerequisite1 and subjects_met_prerequisite2 and subjects_met_prerequisite3:
            prerequisites_met = True

    english_requirement_met = True
    if 'english_requirement' in course:
        english_req = course['english_requirement']
        if english_req and user_results.get("English", 0) < english_req:
            english_requirement_met = False

    return prerequisites_met and english_requirement_met


# Initialize Sentence-BERT model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Function to safely convert a value to an integer
def safe_int_conversion(value, default=0):
    try:
        return int(value)
    except (ValueError, TypeError):
        return default

# Function to compute similarity between career and specialization
def compute_similarity(career, specialization):
    # Encode career and specialization
    career_vec = model.encode([career])
    specialization_vec = model.encode([specialization])

    # Compute cosine similarity
    similarity_score = cosine_similarity(career_vec, specialization_vec)[0][0]
    print(similarity_score)

    return similarity_score

def calculate_matching_score(user, course):
    stream_score = 0
    if safe_int_conversion(user['Stream_encoded']) == safe_int_conversion(course['stream_encoded']):
        stream_score += 30

    location_score = 0
    for i in range(1, 10):
        user_location = safe_int_conversion(user.get(f'Location_{i}', 0))
        if user_location == safe_int_conversion(course['province_encoded']):
            location_score += 50 * (10 - i)
            break

    area_score = 0
    for i in range(1, 10):
        user_area = safe_int_conversion(user.get(f'Area_{i}', 0))
        if user_area == safe_int_conversion(course['area_encoded']):
            area_score += 100 * (10 - i)
            break

    duration_score = 0
    user_duration = safe_int_conversion(user['duration'])
    course_duration = safe_int_conversion(course['duration'])

    if user_duration == course_duration:
        duration_score += 3
    elif user_duration > course_duration:
        duration_score += 2
    else:
        duration_score += 1

    # Calculate career score
    career_score = 0
    for i in range(1, 5):
        career = user.get(f'career_{i}', '')
        specialization = course.get('specialization_name', '')
        course_name = course.get('course_name', '')
        if career:
            if specialization:
                career_score += 50 * compute_similarity(career, specialization)
            else:
                career_score += 50 * compute_similarity(career, course_name)

    score = stream_score * 0.5 + location_score * 0.4 + area_score * 0.6 + duration_score * 0.3 + career_score * 0.7

    return score