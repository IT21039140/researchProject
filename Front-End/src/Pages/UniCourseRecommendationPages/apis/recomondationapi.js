import axios from 'axios';

// Function to check if the user exists
export const checkUserExists = async (userId) => {
  try {
    const response = await axios.get(`http://localhost:8010/uni/recommendations/get-by-user/${userId}/`);
    return response.status === 200; // User exists if status is 200
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false; // User does not exist
    }
    throw error; // Handle other errors
  }
};

// Function to update user recommendations
export const updateUserRecommendations = async (userId, recommendations) => {
  try {
    await axios.put(`http://localhost:8010/uni/recommendations/update-by-user/${userId}/`, {
      recommendations
    });
    console.log('User recommendations updated successfully.');
  } catch (error) {
    console.error('Error updating user recommendations:', error);
  }
};

// Function to add new user recommendations
export const addUserRecommendations = async (userId, recommendations) => {
  try {
    await axios.post('http://localhost:8010/uni/recommendations/', {
      user_id: userId,
      recommendations: recommendations
    });
    console.log('User added successfully.');
  } catch (error) {
    console.error('Error adding user:', error);
  }
};
