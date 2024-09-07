import axios from 'axios';

// Function to fetch user data
export const fetchUserData = async (id) => {
  try {
    const response = await axios.get(`http://localhost:8010/uni/users/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(`Error in fetching user data: ${error.message}`);
  }
};

// Function to fetch recommendations based on user data
export const fetchRecommendations = async (userData) => {
  try {
    const response = await axios.post('http://localhost:8010/uni/gnn/', userData);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      throw new Error('Error in fetching course data: Bad Request');
    } else {
      throw new Error(`Error: ${error.message}`);
    }
  }
};
