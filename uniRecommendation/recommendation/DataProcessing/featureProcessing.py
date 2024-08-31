import torch

def build_user_features(userdata, user_nodes, unique_subjects):
    user_features = []
    for user in userdata:
        if user['user_id'] in user_nodes:
            features = [
                user['Stream_encoded'],
                user['duration'],
                user['English'],
                *[user.get(f'Area_{i}', 0) for i in range(1, 10)],
                *[user.get(f'Location_{i}', 0) for i in range(1, 10)],
                *[user.get(subj, 0) for subj in unique_subjects],
            ]
            user_features.append(features)
    return torch.tensor(user_features, dtype=torch.float) if user_features else torch.empty((0, 0))

def build_course_features(coursesdata, course_nodes, column_names):
    course_features = []
    for course in coursesdata:
        if course['course_id'] in course_nodes:
            features = [
                course['stream_encoded'],
                course['area_encoded'],
                course['course_name_encoded'],
                course['english_requirement'],
                course['uni_name_encoded'],
                course['specialization_name_encoded'],
                course['province_encoded'],
                course['duration'],
                *[course.get(column_name, 0) for column_name in column_names],
            ]
            course_features.append(features)
    return torch.tensor(course_features, dtype=torch.float) if course_features else torch.empty((0, 0))

def build_features(graph, userdata, coursesdata, unique_subjects, column_names):
    user_nodes = [node for node, data in graph.nodes(data=True) if data['bipartite'] == 0]
    course_nodes = [node for node, data in graph.nodes(data=True) if data['bipartite'] == 1]
    user_oids = [data['oId'] for node, data in graph.nodes(data=True) if data['bipartite'] == 0]
    course_oids = [data['oId'] for node, data in graph.nodes(data=True) if data['bipartite'] == 1]

    user_features = build_user_features(userdata, user_oids, unique_subjects)
    course_features = build_course_features(coursesdata, course_oids, column_names)

    num_user_features = user_features.shape[1] if user_features.shape[0] > 0 else 0
    num_course_features = course_features.shape[1] if course_features.shape[0] > 0 else 0
    max_features = max(num_user_features, num_course_features)

    if num_user_features < max_features:
        padding = torch.zeros((user_features.shape[0], max_features - num_user_features))
        user_features = torch.cat((user_features, padding), dim=1)

    if num_course_features < max_features:
        padding = torch.zeros((course_features.shape[0], max_features - num_course_features))
        course_features = torch.cat((course_features, padding), dim=1)

    return user_features, course_features
