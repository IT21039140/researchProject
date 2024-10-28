import axios from 'axios';
import React, { useNavigate} from "react";

// Function to check if the user exists
export const checkUserExists = async (userId) => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/service3/recommendations/get-by-user/${userId}/`,{
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
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
    await axios.put(`http://127.0.0.1:8000/api/service3/recommendations/update-by-user/${userId}/`, {
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
    await axios.post('http://127.0.0.1:8000/api/service3/recommendations/', {
      user_id: userId,
      recommendations: recommendations
    });
    console.log('User added successfully.');
  } catch (error) {
    console.error('Error adding user:', error);
  }
};
