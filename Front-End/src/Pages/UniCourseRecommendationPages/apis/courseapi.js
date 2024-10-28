import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";
import swal from 'sweetalert';

// Function to fetch user data
export const fetchUserData = async (id) => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/service3/users/${id}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error in fetching user data: ${error.message}`);
  }
};

export const fetchProfileData = async (id, navigate) => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/api/service3/users/?user_id=${id}/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    const data = response.data;

    // Log the fetched data for debugging
    console.log("Fetched Data:", data);

    if (data.length > 0) {
      // Ensure all records have a `created_at` field
      const validData = data.filter((record) => record.created_at);

      // Log valid data to verify records with `created_at`
      console.log("Valid Data:", validData);

      // Sort records by `created_at` in descending order
      validData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Log sorted data for debugging
      console.log("Sorted Data:", validData);

      // Get the most recent record
      const lastRecord = validData[0];

      if (lastRecord) {
        console.log("Last Record:", lastRecord);
        return lastRecord;
      } else {
        swal("No user records found. Please build your preference profile.").then(() => {
          navigate("/recommendation-dashboard?tab=RecommendationHome");
        });
      }
    } else {
      swal("No user records found. Please build your preference profile.").then(() => {
        navigate("/recommendation-dashboard?tab=RecommendationHome");
      });
    }
  } catch (error) {
    if (error.response && error.response.data.detail === "No users found") {
      swal("No user records found. Please build your preference profile.").then(() => {
        navigate("/recommendation-dashboard?tab=RecommendationHome");
      });
    } else {
      console.error("Error fetching profile data:", error);
    }
  }
};

export const fetchUserDataN = async (id) => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/api/service3/users/?user_id=${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      }
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
      "http://127.0.0.1:8000/api/service3/gnn//",
      userData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      }
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
