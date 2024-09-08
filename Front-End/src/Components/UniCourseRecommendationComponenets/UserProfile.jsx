import React, { useState, useEffect } from "react";
import SubjectResultSelector from "./form";
import SortableListComponent from "./DragandDropForm";
import axios from "axios";
import "./Styles/profile.css";
import { RingLoader } from "react-spinners";
import swal from "sweetalert";
import { useNavigate } from "react-router-dom";
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
  const [userDetails, setUserDetails] = useState([]);
  const [isEditable, setIsEditable] = useState(false);
  const [loading, setLoading] = useState(true);

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
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve and parse user details from localStorage
    const storedUserDetails = JSON.parse(localStorage.getItem("user_details"));

    if (!storedUserDetails) {
      // Redirect to login page if user details are not found
      navigate("/login");
    } else {
      // Set user details to state if found
      setUserDetails(storedUserDetails);
      console.log(storedUserDetails);
      fetchProfileData(storedUserDetails.id);
    }
  }, [navigate]);

  // Check if userDetails is still null, indicating redirection might still be occurring
  if (!userDetails) {
    return <p>Redirecting...</p>;
  }

  // Destructure user details
  const { id, first_name, last_name, email } = userDetails;

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
      localStorage.removeItem("uId");
      const uId = answers.id; // Ensure the API response contains an 'id'
      localStorage.setItem("uId", uId);
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

  const fetchProfileData = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:8010/uni/users/?user_id=${id}`
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
        validData.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        // Log sorted data for debugging
        console.log("Sorted Data:", validData);

        // Get the most recent record
        const lastRecord = validData[0];

        if (lastRecord) {
          setAnswers(lastRecord);
          const recordId = lastRecord.id;
          console.log("Most Recent Record ID:", recordId);

          fetchData(recordId);
          setLoading(false);
        } else {
          console.log("No valid records found after sorting.");
        }
      } else {
        console.log("No records found.");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.status === 404 &&
        error.response.data.detail === "No users found"
      ) {
        swal(
          "No user records found. Please build your preference profile."
        ).then(() => {
          navigate("/recommendation/");
        });
      } else {
        console.error("Error fetching profile data:", error);
      }
    }
  };

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
        const userExists = await checkUserExists(id);

        if (userExists) {
          await updateUserRecommendations(id, courses);
          console.log("Recommendations updated");
        } else {
          await addUserRecommendations(id, courses);
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

          {/* Education Data Column */}
          <div className="profile-education-data">
            <div className="profile-header">
              <h1>My Profile</h1>
            </div>
            <div className="profile-header">
              <img
                src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMSEhISExIVFRUVFRUSFRUVFRUVFRYVFRUWFhUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGhAQGi0lHyUtKy0tKy0tLS0rLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIALcBEwMBIgACEQEDEQH/xAAcAAABBQEBAQAAAAAAAAAAAAADAAIEBQYBBwj/xAA8EAABAwIDBAgEBQIGAwAAAAABAAIRAyEEEjEFIkFRBhMyYXGBkaFCscHwBxRSYtFy4SMzQ4KS8RVTY//EABkBAAMBAQEAAAAAAAAAAAAAAAECAwAEBf/EACgRAAICAgIBBAEEAwAAAAAAAAABAhEDIRIxEwQiQVEyFGGRsUJScf/aAAwDAQACEQMRAD8A9ap4cDgjEoTXk2HqnsZHeszD0kkkDHC1cfMWXSUgVjDabfVPSSIWMDqvgKMzE3UmqyQqwNym6zdBSsmV5IVdUJU7rwUx7BCWceS7Gi6Kd7TKQoEqU4AkqZRoBcywJyKOdIBh6YapuUEWTqlEQoPXZV2Koojtg8RRN1Uuo5ntJ0CtsRiswsqrrIK5cmZcqRWMNFnkACFTqQbIQeSjMpJlKUnYGkkFc6VX46RxUp1eFAxVWStlyxqn2aMWTMHwUk1CAYVXRrxojDElDFnSVM08buyh23Xe50Gwmy5Rc5wy87KTtMSQibPZvN8VHJN86vsovxNRsejDRKibSoiTKsMLWythVO0cRmMLuyuls5orZDqUUmMI4o7W80qlQQVy8N2yt/BFxLzEKvyIlbEXTOvC5p5FJlFGtFfXmYVtswNDe9VWJrCZQhiSbAwhhy+OVtBnDkqJ+Jx4DiLJKrcwyurr/VS+iPh/c9XwrYCMuNbC6uomJJJJAwysbGF2m2AAlUFkD8xYQiYkpJjKgSdWaNTCBh6rtpGEaptBg71WYzFBxUMuWKVXsrjg7sGKkFH6+REqAKic2pdRjkl0VcUSmi6sGOMKuY4KW2uAuqDRGSYnVSCmPp5hdcNUE2R3PDQSYgcZ0Tx2K9ESthoCzmOxrWOgm44C65tjpc1pIpjMNCfnlWW27tVoEklpdeI+qSWGLdjKbSNOzpJRbqHegU7BdIsPUIHWBp/db30XklTGgzf3+o080ahjCLO0Pr4qscaEcj29+FBbmBBBuCLg+BVPtCmBdee7I6UVcK6AczDq0yWu7xxB+76Lc0Np08U1r6ZkHUcWnkVPPjUo0GEmmdoIrjyVlQwII0UTG4UsBMLmfp5KI/PZW1n3QxXgqLUxEuIXW3K43B2VTLhu0HEQhCqhYenopzsNZWXknv6F0gDsXAsoNSsVKOGRG4UJZOU+0FUipfUQKtRWlbBImHwLOIEpsWKwTlRm331RqLVc7RwjBwVTiaWW8app42nsVSssBQakq4VKnCUlXyL/AFFr9z1lJQ8RiLwFwuNrrromTVwG65TNrpPdF0DDa/ZPgo9DQckLF44RA4qE7E2UZZknRRY3Ra9YALKsxrpKjuxBXabp1UpZuWiihWyO+UwNJVqKQhR3Ur2SeHjsbnZX1KZCbh3XU6voq0DeU5ypjJWi1IBQupPfCVElTKdYDVXUIz2ybbiDp7uqoeku0iQaTSYAl/fyar3G4lrWk9y8829inBuVt6tZ4Y3xcbnwAldMaXRPvshYDZr8TUOSSAYLvhHcFs27CaGhrt6OcH5q52HslmGoMptFwJJ5nim1kspNjxSRkNrdD6VS7RlPAtsQsXtjYVXDXdvU/wBQ1b3kL1twUXGYcPaWkAgiCCjGTXRnFM8eLpEHyKm9HNtOw9UO1Ew5vMfz9U3pBso4eoWj/Lddp/THw+XyVQ9038irqSkrOdpxdM+j9iY5j6bXNIIcAR5pbUykWXln4e7ecJoOdzLfEajzF/Vb52IkapHNJ7DTMtjKGWo6EOhXh0KxxtPMSVVYfDnrCVxSnGVpF0mjQYV+iuKVxCo6ZiFZYfELYZJOmaa0ErtCHSk8FytVupNJ4hWXFsm7SI1cWuq2tVI0srDGYhqq31AVDI6emMutkatWc6yDi3WF5Uw0+KgYhpJhZcmrYNHGVJC6k3DuFrJKyTEs19PG3UtuLmFUtUqmyVVTYziaTD1AQm4t4iJVTSqOHFdq1SVLJmUUNHHZFqm6G4pHVEyLzFJnXSRxqMIUZxQTWMqyzqifAmvrwhDFBRquIEKG6pOiSXqZfA6xonVa0pUAMwlQGgowU4zd8mNJKqRoHRlVRXqibINSuY1UMvJK6MmbnVEVDiPx1bdMn7CynR1/5nadMnsUGOP+493gQFY9KMYKdJ3p9XeygfhDY4rEO+EZZ8pcV2wXGBJv3UbranSNtIwabo5/eiqMJ0pp1X5crmk2E6Km2t00Bk02F7A7Kag3WAmTAJBLjA5AJ2xceazmnqyJh0ObBiY1Fvke5Ft/Q8Uvs1GIxjWNLjoBKzGK6YOLstKgX98mPZabbmHAaQOVli8aatIO6umXFonQgGY7MXebzA5G6KbM0qHbRo18VSIfTY06gEwQV568Fri0iCJEciNQtX/53GSC6lIJIytzh4Gslri6NfZZzpG0is5xBGaHX9/kni2mSmk1Z3ZeJLHhzTdpkf7bj2levYTFipSZUGjmgrxXDvhwPf8AK/ykL0XoXjM1F9Im9N0t/pP37pM8OUbQsGaJ70fB0hCrqlSyNh6xXBH2Stl3tEzEU7oYdCTKqG96WTt2hkFFW6MX2UMrnXQitmoFipJsU+hSTqTplHa266FKMVRGSbZJa0BugVTUYMxU2u9RCJNlpzcqSAo1thwAklkI4+y4rb+haRMlWmEcIVWBdTaLlHyqCL8ORMc5cQcyJmsubLmUh4wojVnQVwVrIWJchUzK50tFGztWtdMJlddSTnMhT6CRHsKfSZGqI0pr0UZkloEKPWrQgVMTCh1CXFO5WZImvqyu02xdDw9JD2pWyUzGpt/KpiVySA2YPpttDO4tBs0Hzc439AfdbX8HMIPybn/re6fIx9F5V0gqnrHDvM+P2SvVvwgxIbgPCpUHqQfqvVeoqzl7k6L7aWzQ90iAeYAlG2Vs1oMTJAmP5VbtbbAbMFC2fi6zKb3MDc74O8SIAm0i/FS5qy/B0W+0t4lVLaLXy3iOHFVO2dq1ZLacZiBqTAJ1kxwXGGoGhzu0Bw5ck3kvo3jotWbKY3iVjfxE2aOrFVou1wB8HW+cLT0NqBw1VH0xxIOFreA9ZEIqa+DTg6dnmrD9+BWp6K4nJWbez25T8voFlKRv9/fBXOzKmUscPhI/srNXGjjj2eiVgVKoGyideDHep1Ftl5mVs6I9jQUQLhTXVFBMrQUBOZSlMZVRWOTKdMDQ80oQH144p9WrZVFaSSrXZF6JlZ5dopuFwzgJKp6dfKb3V9TrEtkAnyXVhUUrJybBOdf+6SjVK4BIhySpyFotyxEYmYl0JtGpK8mTbR3Ik5kGrXXarkKmyVHbHB1HoLK0KTiGKPTopov7FaDh8plSrwR2gAKNVF0t2w1oFBTiCiUQjPAQYxWVaJJRGU4UgoRCy0AKxVW26kDydA8rn6eYVkOQ8z98VSbWrgio4aN3BykXPuAPJduBVsm0eZbcAFR3HedPkYK3P4TbQBp18PoWkVBftB0gmO6Gj0Xn+0XSSfvVd2FtZ+ErsrMvlMOb+ph7TfviAvRlDlCjkjPjOz1rHbMc6pY3zWm40JEjxhSsMcZldnZTZlMAg5g4RZw3Z8oUjZOOp4kMrU3S13qDxaRwIV3isNmZHBc+PR2ue1fRjMSMVJOakBrM+wGRV+IxeM7DOreSeNgBOpMT/wBrQYjYv7zHKSm08EKQsArBlOLWv6RVf+OLWy8jObmLDyWa6ZYjJQDf1uAjuG8fkPVazaNeJJNgvLeke1OvqyOy3db38z529FPHG5WTyzqFEKmbjxVnh37k8vsKppns+KssG6zx98P4XScRttl4nN1f9IWuodlYbozdre6y2tE2Xneo7OvGdeEJ1GUQojSuZIoyLlhGpvTnhBITUKPqmyip+dNqssqog+wWUStVg3t6sXGix9OZVizEGIV8cuKA0dxOJGY+KShvbdJbmwUXLqxdwRKRhOa0BcqNUnjT6KLIMr10fDPsoraSOGlCWGlSGWW3sdVdJS0Qw0o7AoLA29jvIktASXLgB5KZAXQAq/p0T8rZDDSjBhRrJQtL06YVlYDqk1+HJ7vmpjIC654WWBIPlKXEuLGk+TfE6LM7ZGWmWiYptk973aT36k960mNqhzy49ilJ8X6fWFnelQ6ug4HtEZnf1EifnHkrY4JOkNy1s83xRsfE+llHo0wXtBsJEnkJujVtB98UbDsApvcdTDWjjzJ++a7vg4n2WfRPaVSjiv8ADcQ18y34TGkjn3r13C7eDmQd09+nkV4x0fbOIZ3C69Lot3Vz5tPR1Ydx2T622G3kqk2ht8Ta6h46hdQ/yykptl3FIqukW0H1GOmzdI5+KyBWr6SMy0+8kBZc0yurEtHFmfuEzRTMK+x7wfkoUqThnaD1807Jo23QZwOZvEQfWf4W+ZTsF5r0ArRisnBzHDzBn+V6xTZZQnFNlUyD1JXDS7lZ5AuGmFJwX0PyZUlpCZUdZW1SkFFOGQcU0bZXNZKbVVp1EIVWhPBTUDUU7dUctPJTWUIXXhWioiuLKl0zokprguKntBxZZNKICgJwXPZXgHbCfIQAF2FrZvGgucLoeEDKuimhbGUEFc9N6xMNNNNJBykMoRCGsl16C6kuCihykHhEP16HicTlaTxAt48FwUUzG4ewB4uAPzI9E8OUhXGCKyrWazq2nSc7v3OndH/Iz5LO9NcTmYe+PmVo8XgKbiXuLiWmWgG27pI43v6LI9KbtI5BnzVowcWrFck06MbW4JEQ0u8gu1xYIeIdZo4XK6kcjNL0MwmYOqd8ei9Bw9OWhY/8PDNN7ToHekgLeYehZc+RbOnE/aVdfBSUCrhgLK/NBRRhZJJU1Eq5GD29gjUq02Ra7j5R/Kp9q7LyuiO1a3GD/C9Dq4NprXtuj0zclS7fwVWWuZlLgCWjlAnzNvddEPg58iW2efY7D5HvGoBMHnyPmLo1LAuDA/Kb38uak4nZtXOA8Sf23ENkfRbQYMZBECw1EiPPwiDe1/hXQoWc90ZDo7ierxVE/vjycvW6e0RGqwtPouC+nUY7KWuDiDcOAvu8jAPl4GNpTwIItdcfqFKFM6MVSJTccnDGoDMCkcIubyMtwQc4xc/NhRzh0w4YreQ3BEr80Fw4kc1GOGKb+XKPkNwJBrhDdWCA6kUM0iipgcAxqBJAyJI8wcCc2sUUVUxgCM4DgsZWcbWujCohU2SjClCAw01E7Ouhqe5ohajAutSFRNDU8MQoNiLks6TkzIhQbDUnxLj8IlRtq18rWN42PfJ1Np58kaq2KTze9ra+Xqqvb9SarWzoW2NxM8j6Lv8ATwSicmaVyC4wFuZgIFhMjWTEniP7LMdIdmPLSQ0xlE8TY3018Vqq7Cap8fkSZH9j5K5pUhDQQDF084JghNo8DxNBxsGExMwCYEiPK6gu4dy9Y6VBok5RznLw3nE3Y7kNF5PSbJJ539UeNIm3Zv8A8Lmz145FpHnP8L0NjYC87/DK1SuObWH3cvRgFCfZ0Q/E4WymFlkUqs25tqlhaeeobnssHaeeQH14IIZkXb+KpYZhrVDHwgDtPdwa37ssjsHGVa762KqdlsMY3eytgtqGCB3NBNtTyhZvbu1qmKqGpUPcxg7LG8h9TxWv6P4YMw1GYkjPJiAXOkEmwkBzbZ2khxsuiEKITnyH18MMwi8bsyHTlnLcftDXHnMcVOIgSTHN08ImXHQ2+I2IEzLSEgy95nUTAcYERJIceyBIDt5oMlAxbnOzEOyhsiQAHfCQ64PVjea7KYiHXghWsnQ+pWayxJk6Ng5nEEaNbJkGLjkTMgzJwu0Hdq7QNZiYkbxDZa2xkhxEQ7RVtCk0SA2ARmI3i4t3jecxdANQXDxLBDkWo62bWCdL65pAdLv/AKRDmnebbgi9mNPhNoh1jAPt3qWSFj6Fe1rgQNQb5WnyN1Y4HHO0MkTlH396Fceb0cX7ofwXx52tSLxIwgtclK8/idVhXEIZKFVehB61BHwk+FwvQiVkjNj4C6ohqHkktQLLKk0aJtRsHVRi85kY3VX0LEMKkJ3XygVBZCDoQQ1E4OXc8oFMyEVoT0K2EYE4lD60QkDKAB0grqG1i4UDB8V2GtmJI9z3rO4tvWYloHF8xoYBkxz7PBaDGVIIN/LuHcR9VRbDp5673fpF45vIbcR3HVvmvRgqRxSey9pUIe48y4+8ffFTqjsrT3BR2ASIvJJJ+X/a5tGoAyOZA9TePKefgbrGPPOnWIhlQcSS3vvDOLQeB19Vg6AWj6b1yerbETvaEfuOrRxeOAWdoi6aXYDafh9iIxIafjY5v+4EOHsHL1DJZeOdHqvV1qL+VRo/5HKfZxW72904o4cmmxpq1BqBZjTyc7j4D2UJxbei+OSS2TOku3qeDZLt57gclMau7zyb3ryjamOqYioatV0uOn6Wt/S0cAiY7Gmu99Wq4l5uTwAGgA4AaAKsqP5D7708YKJOc+Q1wzHKONpPM/RepBuQtaODQ1uskNBAaLgnR7bOdqN1ea7IpZsRQbBM1aekkxmBOl9JXpuJEOeOOjo8oJblmJ6sy5jhrdUj2KCdaQOFjymQA5wDbX6p28z4nXuojyCBIhp7J5AiIZfg157Dx/l9lGqQQ3gDZvCBHwmYkNJ7Dwf8LRALruJudXgTPxZg60/+7ttI0unMcBsSeBkgiwdqQQRAOZju0Gnf7V5QsWQ2JPK5IktEOdd94LW09S5pvcIzZ3Y7XwnwcOyWmYLmN7DiN/soNZwzNDdO0LDXUEgRO7DbtB5ysA6XwLyDBF7GGjLO9Jy2FwXNvcI2GgOboeJiDrrcMd81EawWEmAQbWuLhx5OkTIujg3Ek66kkxe2qxjYOQ3PRadwCmOIleO0ejY0NlNeE6pVQWklBILYnGyZnRiAUCq7KjRkzhhJRTUXVqNok4Q5zxUp7YOqr6VYA2KkOeXd/eU3wTbphKjrohaFFHepFM2QQOQe0JwcFHpsvqpQhNQzOZAU5tkNzhwuiUhK1AToDUrp2Fu5viuVqAmZRsAzenkD/CEItyQ0muLYzaboa/8ApPuQ36qL0cobheRd1T2ZAPvmTto1JbU5Wbz5zF51jQnwU/ZdHLSpiLhoJ4jM7eO8Lak6wvS+DgCUN4juJ9NPv3Eqt6Q4ixA45heL7uUa67zxwdpoCrdkNED+/rr/ANHVZTbGIMk8BBJ0Fsz7nM1p7FMXc7wCMezHnHSypOIiIgco1J/Y3gBwVYwo2135q9TuIbaODQDpbWUFqD7AXOAdMeI9rn2aom0n7x+yVzCTBgx38vh+p9EPaRzPJmfoOSxiMahKRdCbCYUDFz0NaX47Dj9znelN5HA8Y4Fb3FxJGgmB2Y0MgQcoIBeN0sd/hjWFjvw+pD83J+GlUdw/a0xJF948ZWuxtTecTcjtayYJsZGbKS2p2g9u/qngH4A1id7NrBz6zxJDiWyBIqjfaRvDeTbjKIk/Dpc3uwTeS3/Td/q9lIatAuRduvcJYAZiWsP+G6N87qaCIMWaYvaJ3QM8jKTHU9trTY3TgOASHXt2ZkEcgXSImOqMVADY3UNzw6o43GXdvMN0cRmk5SCWC58DCkvqQC64ygyLgtaQTc9poy5x8bd0KuwTrF3HtHgQSSTdoDmSSW3BbuoMxPFOxsYmO7djThq4j0XGuAdq2bfE0GwuYlRxBEjLwmOqm7Wk3axyNTngHeXWAX8mArBNkx+42P0j5IYbe65hHTTYf2j28z8yi07ryZr3M7k9IcIUSvVvDVLqUpUPJBlKPoNRokaoGPYeEKSyrZQsTiLwiYYI5pKOUljUjmB5EXKuMEADe4SSRhsVoNjWCbaqGTBhcSTGQ5uLiylN3hKSSRO3QZKjjaV9UbPlXEkyFUUdDM11Lo04akkq4l7hMr9pUObna8TOaqGmeIMA62MTxCvM4JMaiB33MC5bPHmVxJdZyEXHYjK1x4BhJPdoOBtw0OmmhWS2y/KXF27eJJvGZrNQHO0pu+IariSaJmeZVqmao90zL3HjxcTxXWlJJAAdjzBA7vaf5XCkksYE4JoSSQMa38O3BtTEPmIptaLkTmdmIsDqGcRCvsQMrncMlyNMpBgO3TaTTF2Edoy1JJUgH4BhpMNHxDMNN5sDeIs18B1I3yu3Ch57Z5sTAMkQInLm7Q3XuEHO3dCSSYBD2vUyU3Ni4N221LocYFhdpu0iZMi6isMECewRcWJhwDj3SZSSSsxLaXERmfaPjdpcaE/tTTTabReSJOvDiuJIoxsNlXos8CPcqWwQEkl5eX8n/wBPQgvahjqsAqtc8+XikkkXRv8AII2oSFEfRmXHySSTpUCTbAikefukkkpubG4o/9k="
                alt="Profile"
                className="profile-pic"
              />
            </div>
            <div className="profile-header">
              <h2>
                {first_name} {last_name}
              </h2>
            </div>
            <div className="profile-header">
              <h3>{email}</h3>
            </div>
            <div className="profile-header">
              <h4>Education Qualifications</h4>
            </div>
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
            <div className="profile-header">
              <h4>Preferences</h4>
            </div>
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
