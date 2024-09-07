import React, { useState, useEffect } from "react";
import SubjectResultSelector from "./form";
import SortableListComponent from "./DragandDropForm";
import axios from "axios";
import "./Styles/profile.css";
import { RingLoader } from "react-spinners";
import swal from "sweetalert";
import {
  checkUserExists,
  updateUserRecommendations,
  addUserRecommendations,
} from "../../Pages/UniCourseRecommendationPages/apis/recomondationapi.js";
import {
  fetchUserData,
  fetchRecommendations,
} from "../../Pages/UniCourseRecommendationPages/apis/courseapi.js";

const UserProfile = () => {
  const [userId, setUserId] = useState("1234");
  const [isEditable, setIsEditable] = useState(false);
  const [answers, setAnswers] = useState({
    id: "",
    Year: "",
    Stream: "",
    English: "",
    Preferred_University: "",
    Career_Areas: "",
    duration: "",
    Locations: [],
    areas: [],
    Results: [],
  });
  const [courses, setCourses] = useState([]);
  const processCareerAreas = (input) => {
    // Handle the case where input is a comma-separated string
    if (typeof input === "string") {
      return input.split(",").map((item) => item.trim());
    }

    // Handle the case where input is an array or a single value
    return Array.isArray(input) ? input : [input];
  };

  const handleSubmit = async () => {
    // Format data to match API requirements
    const formattedData = {
      Year: answers.Year,
      Stream: answers.Stream,
      English: answers.English,
      Preferred_University: answers.Preferred_University,
      Career_Areas: processCareerAreas(answers.Career_Areas),
      duration: answers.duration,
      Locations: answers.Locations,
      areas: answers.areas,
      Results: answers.Results.map((result) => ({
        subject: result.subject,
        grade: result.grade,
      })),
    };

    try {
      const response = await axios.put(
        "http://localhost:8010/uni/users/" + answers.id + "/",
        formattedData
      );
      swal("Your responses have been submitted.");

      window.location.reload();
    } catch (error) {
      console.error("There was an error submitting the form!", error);
      alert("Submission failed. Please try again.");
    }
  };

  const handleConfirm = () => {
    // Define required fields and their human-readable labels
    const requiredFields = {
      Stream: "A/L Stream",
      English: "O/L English Grade",
      Preferred_University: "Preferred University Type",
      Career_Areas: "Career Areas",
      duration: "Preferred Course Duration",
      Locations: "Preferred Locations",
      areas: "Preferred Areas of Study",
      Results: "A/L Results",
    };

    // Find missing fields
    const missingFields = Object.keys(requiredFields).filter(
      (field) =>
        !answers[field] ||
        (Array.isArray(answers[field]) && answers[field].length === 0)
    );

    if (missingFields.length === 0) {
      // All required fields are answered
      console.log("All questions answered:", answers);

      // Proceed with further actions
      handleSubmit();
    } else {
      // Some fields are missing
      const missingFieldsText = missingFields
        .map((field) => requiredFields[field])
        .join(", ");
      swal(
        `Please complete the following fields before submitting: ${missingFieldsText}`
      );
    }
  };

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    profilePic: "",
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8010/uni/users/?user_id=${userId}`
        );
        const data = response.data;

        if (data.length > 0) {
          const lastRecord = data[data.length - 1];
          setAnswers(lastRecord);
          const id = lastRecord.id;
          console.log(id);

          fetchData(id);
          setProfile({
            name: lastRecord.name || "Charura Perera",
            email: lastRecord.email || "email@example.",
            profilePic:
              "https://i.pinimg.com/originals/07/33/ba/0733ba760b29378474dea0fdbcb97107.png",
          });
          setLoading(false);
        } else {
          console.log("No records found.");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, [userId]);

  const CourseFormat = (courses) => {
    return courses.map((course) => ({
      course_code: course["Course Code"] || "N/A",
      course_name: course["Course Name"] || "N/A",
      university: course["University"] || "N/A",
      specialization: course["Specialization"] || "None",
      duration: course["Duration"] || "N/A",
      Stream_Score: parseFloat(course["Stream Score"]) || 0, // Convert to float or use 0 as default
      Area_Score: parseFloat(course["Area Score"]) || 0, // Convert to float or use 0 as default
      Location_Score: parseFloat(course["Location Score"]) || 0, // Convert to float or use 0 as default
      Career_Score: parseFloat(course["Career Score"]) || 0, // Convert to float or use 0 as default
      Duration_Score: parseFloat(course["Duration Score"]) || 0, // Convert to float or use 0 as default
      Score: parseFloat(course["Score"]) || 0, // Convert to float or use 0 as default
    }));
  };

  const fetchData = async (id) => {
    try {
      const data = await fetchUserData(id);
      console.log("User data fetched:", data);

      const recommendations = await fetchRecommendations(data);
      setCourses(recommendations);

      // Ensure saveRecommendations is defined and called correctly
    } catch (error) {
      console.log("Error", error.message, "error");
    }
  };

  useEffect(() => {
    const saveRecommendations = async (courses) => {
      try {
        const userExists = await checkUserExists(userId);

        if (userExists) {
          await updateUserRecommendations(userId, courses);
          console.log("Recommendations updated");
        } else {
          await addUserRecommendations(userId, courses);
          console.log("Recommendations added");
        }
      } catch (error) {
        console.error("Error handling recommendations:", error);
      }
    };

    if (courses.length > 0) {
      const courseFormat = CourseFormat(courses);
      saveRecommendations(courseFormat);
    }
  }, [courses]);

  const handleChange = (field, value) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "Stream" && { areas: "" }),
    }));
  };

  const handleResultSubmit = (results) => {
    handleChange("Results", results);
  };

  const handleSortUpdate = (sortedList, field) => {
    handleChange(field, sortedList);
  };

  const toggleEdit = () => {
    setIsEditable((prev) => !prev);
  };

  const renderQuestion = (q) => {
    switch (q.type) {
      case "choice":
        return (
          <div className="question-choice">
            {q.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleChange(q.name, option)}
                className={answers[q.name] === option ? "selected" : ""}
              >
                {option}
              </button>
            ))}
          </div>
        );
      case "input":
        return (
          <div className="question-input">
            <input
              type="text"
              value={answers[q.name]}
              placeholder={q.placeholder}
              onChange={(e) => handleChange(q.name, e.target.value)}
            />
          </div>
        );
      case "custom":
        return (
          <div className="question-custom">
            {q.result &&
              React.cloneElement(q.result, { onSubmit: handleResultSubmit })}
          </div>
        );
      case "Rank":
        return (
          <div className="question-rank">
            {React.cloneElement(q.rank, {
              items: answers[q.name],
              onSortUpdate: (sortedList) =>
                handleSortUpdate(sortedList, q.name),
            })}
          </div>
        );
      default:
        return null;
    }
  };

  const questions = [
    {
      type: "input",
      text: "A/L year",
      placeholder: "Type your answer here...",
      name: "Year",
    },
    {
      type: "choice",
      text: "A/L Stream",
      options: [
        "Biological Science Stream",
        "Physical Science Stream",
        "Commerce Stream",
        "Arts Stream",
        "Bio Technology Stream",
        "Engineering Technology Stream",
      ],
      name: "Stream",
    },
    {
      type: "custom",
      text: "A/L result",
      result: (
        <SubjectResultSelector
          initialResults={answers.Results}
          onSubmit={handleResultSubmit}
          readOnly={!isEditable}
        />
      ),
      name: "Results",
    },
    {
      type: "choice",
      text: "O/L English Grade",
      options: ["A", "B", "C", "S", "W"],
      name: "English",
    },
    {
      type: "choice",
      text: "Preferred University Type",
      options: ["Private", "Government"],
      name: "Preferred_University",
    },
    {
      type: "Rank",
      text: "Preferred areas of Study?",
      rank: (
        <SortableListComponent
          stream={answers.Stream}
          displayArea={true}
          onSortUpdate={(sortedList) => handleSortUpdate(sortedList, "areas")}
          readOnly={!isEditable}
        />
      ),
      name: "areas",
    },
    {
      type: "Rank",
      text: "Preferred University Locations?",
      rank: (
        <SortableListComponent
          displayLocations={true}
          onSortUpdate={(sortedList) =>
            handleSortUpdate(sortedList, "Locations")
          }
          readOnly={!isEditable}
        />
      ),
      name: "Locations",
    },
    {
      type: "input",
      text: "Preferred career areas",
      placeholder: "Type your answer here...",
      name: "Career_Areas",
    },
    {
      type: "choice",
      text: "Preferred duration",
      options: ["2 years", "3 years", "4 years", "5 years"],
      name: "duration",
    },
  ];

  if (loading) {
    return (
      <div className="loading">
        <RingLoader color="#007BFF" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <main className="dashboard-content">
      <div className="profile-container">
        <div className="profile-grid">
          {/* Personal Data Column */}
          <div className="profile-personal-data">
            <div className="profile-header">
              <h1>My Profile</h1>
            </div>
            <div className="profile-header">
              <img
                src={profile.profilePic}
                alt="Profile"
                className="profile-pic"
              />
            </div>
            <div className="profile-header">
              <h2>Name </h2>
              <p>:{profile.name}</p>
            </div>
            <div className="profile-header">
              <h2>Email</h2>
              <p>{profile.email}</p>
            </div>
          </div>

          {/* Education Data Column */}
          <div className="profile-education-data">
            <h2>Education Qualifications</h2>
            <br />
            {questions.slice(0, 4).map((q, idx) => (
              <div
                key={idx}
                className={isEditable ? "profile-editable" : "profile-readonly"}
              >
                <p className="question-text">{q.text}</p>
                {isEditable ? (
                  renderQuestion(q)
                ) : (
                  <div className="profile-readonly-content">
                    {q.name === "Results" &&
                    answers[q.name] &&
                    Array.isArray(answers[q.name]) ? (
                      <ul>
                        {answers[q.name].map((result, i) => (
                          <li key={i}>
                            {result.subject}: {result.grade}
                          </li>
                        ))}
                      </ul>
                    ) : q.name === "areas" || q.name === "Locations" ? (
                      <ul>
                        {answers[q.name].map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{answers[q.name]}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Preference Data Column */}
          <div className="profile-preference-data">
            <h2>Preferences</h2>
            <br />
            {questions.slice(4).map((q, idx) => (
              <div
                key={idx}
                className={isEditable ? "profile-editable" : "profile-readonly"}
              >
                <p className="question-text">{q.text}</p>
                {isEditable ? (
                  renderQuestion(q)
                ) : (
                  <div className="profile-readonly-content">
                    {q.name === "Results" &&
                    answers[q.name] &&
                    Array.isArray(answers[q.name]) ? (
                      <ul>
                        {answers[q.name].map((result, i) => (
                          <li key={i}>
                            {result.subject}: {result.grade}
                          </li>
                        ))}
                      </ul>
                    ) : q.name === "areas" || q.name === "Locations" ? (
                      <ul>
                        {answers[q.name].map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{answers[q.name]}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="profile-buttons">
          {!isEditable ? (
            <button onClick={toggleEdit} className="edit-button">
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsEditable(false)}
                className="back-button"
              >
                Back
              </button>
              <button onClick={handleConfirm} className="submit-button">
                Save Profile
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default UserProfile;
