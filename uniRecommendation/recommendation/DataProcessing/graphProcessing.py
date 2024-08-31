import networkx as nx
from .logics import meets_prerequisites, calculate_matching_score

class BipartiteGraphSingleton:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.graph = nx.Graph()
        return cls._instance

    def get_graph(self):
        return self.graph

def create_nodes(graph, userdata, coursesdata):
    """
    Create user and course nodes in the graph.

    Args:
        graph (nx.Graph): The graph to which nodes will be added.
        userdata (list): List of user data.
        coursesdata (list): List of course data.

    Returns:
        tuple: (user_id_to_node, course_id_to_node) - Mappings from IDs to node indices.
    """
    user_counter = 0
    course_counter = len(userdata)
    user_id_to_node = {}
    course_id_to_node = {}

    for user in userdata:
        user_id = int(user['user_id'])
        node_index = user_counter
        graph.add_node(node_index, bipartite=0, oId=user_id)
        user_id_to_node[user_id] = node_index
        user_counter += 1

    for course in coursesdata:
        course_id = int(course['course_id'])
        node_index = course_counter
        graph.add_node(node_index, bipartite=1, oId=course_id)
        course_id_to_node[course_id] = node_index
        course_counter += 1

    return user_id_to_node, course_id_to_node

def add_edges(graph, userdata, coursesdata, user_id_to_node, course_id_to_node):
    """
    Add edges between users and courses based on prerequisites and matching scores.

    Args:
        graph (nx.Graph): The graph to which edges will be added.
        userdata (list): List of user data.
        coursesdata (list): List of course data.
        user_id_to_node (dict): Mapping from user IDs to node indices.
        course_id_to_node (dict): Mapping from course IDs to node indices.

    Returns:
        nx.Graph: The graph with added edges.
    """
    for user in userdata:
        user_id = int(user['user_id'])
        user_node = user_id_to_node.get(user_id)

        for course in coursesdata:
            course_id = int(course['course_id'])
            course_node = course_id_to_node.get(course_id)

            if user_node is not None and course_node is not None:
                if meets_prerequisites(user, course):
                    matching_score = calculate_matching_score(user, course)
                    graph.add_edge(user_node, course_node, weight=matching_score)
    return graph

def remove_isolated_nodes(graph):
    """
    Remove isolated nodes from the graph.

    Args:
        graph (nx.Graph): The graph from which isolated nodes will be removed.

    Returns:
        nx.Graph: The graph with isolated nodes removed.
    """
    isolated_nodes = [node for node, degree in graph.degree() if degree == 0]
    graph.remove_nodes_from(isolated_nodes)
    return graph

def reindex_graph_inplace(graph):
    """
    Reindex the nodes of the graph to ensure continuous node IDs.

    Args:
        graph (nx.Graph): The graph to be reindexed.

    Returns:
        tuple: (reindexed_graph, node_mapping) - The reindexed graph and the node mapping.
    """
    node_mapping = {old_node: i for i, old_node in enumerate(graph.nodes())}
    temp_graph = nx.relabel_nodes(graph, node_mapping)

    graph.clear()
    graph.add_nodes_from(temp_graph.nodes(data=True))
    graph.add_edges_from(temp_graph.edges(data=True))

    return graph, node_mapping

def prepare_graph(userdata, coursesdata):
    """
    Prepare the bipartite graph with nodes and edges based on user and course data.

    Args:
        userdata (list): List of user data.
        coursesdata (list): List of course data.

    Returns:
        nx.Graph: The prepared bipartite graph.
    """
    print("Preparing graph...")
    graph = BipartiteGraphSingleton().get_graph()
    user_id_to_node, course_id_to_node = create_nodes(graph, userdata, coursesdata)
    add_edges(graph, userdata, coursesdata, user_id_to_node, course_id_to_node)
    graph = remove_isolated_nodes(graph)
    reindexed_graph, node_mapping = reindex_graph_inplace(graph)
    return reindexed_graph
