import axios from "axios";

// Function to fetch user data
export const fetchUserData = async (id) => {
  try {
    const response = await axios.get(`http://localhost:8010/uni/users/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(`Error in fetching user data: ${error.message}`);
  }
};

export const fetchUserDataN = async (id) => {
  try {
    const response = await axios.get(
      `http://localhost:8010/uni/users/?user_id=${id}`
    );
    const data = response.data;

    if (data.length > 0) {
      // Sort the data by created_at field in descending order
      const sortedData = data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      // Return the most recently created record
      return sortedData[0];
    } else {
      throw new Error("No user records found.");
    }
  } catch (error) {
    throw new Error(`Error in fetching user data: ${error.message}`);
  }
};

// Function to fetch recommendations based on user data
export const fetchRecommendations = async (userData) => {
  try {
    const response = await axios.post(
      "http://localhost:8010/uni/gnn/",
      userData
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      throw new Error("Error in fetching course data: Bad Request");
    } else {
      throw new Error(`Error: ${error.message}`);
    }
  }
};
