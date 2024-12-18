import React, { useState, useEffect } from "react";
import { RingLoader } from "react-spinners";
import "./Styles/CourseCatalog.css"; // Ensure the path is correct
import axios from "axios";

import swal from "sweetalert";
import { FaThList, FaTh } from "react-icons/fa";

import PopupChart from "../../Components/UniCourseRecommendationComponenets/RadarChartApp";

import { fetchRecommendations, fetchUserData } from "./apis/courseapi";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faUniversity,
  faGraduationCap,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";

//http://localhost:5173/myrecommendations/66387dca157b0e532fea6106
const CourseCatalog = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState([]);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGridView, setIsGridView] = useState(true);
  // State to manage selected course and popup visibility
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [filters, setFilters] = useState({
    "Course Code": "",
    University: "",
    Duration: "",
    Specialization: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [groupBy, setGroupBy] = useState("");

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

  const fetchProfileData = async (id) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/service3/users/?user_id=${id}`,
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

  const fetchData = async (id) => {
    try {
      const data = await fetchUserData(id);
      console.log("User data fetched:", data);

      const recommendations = await fetchRecommendations(data);
      setCourses(recommendations);
      setLoading(false);

      // Ensure saveRecommendations is defined and called correctly
    } catch (error) {
      console.log("Error", error.message, "error");
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

  const handleToggleView = () => {
    setIsGridView(!isGridView);
  };

  const handleResetFilters = () => {
    setFilters({
      "Course Code": "",
      University: "",
      Duration: "",
      Specialization: "",
    });
    setSearchQuery("");
    setGroupBy("");
  };

  if (loading) {
    return (
      <div className="loading">
        <RingLoader color="#007BFF" />
        <p>Loading...</p>
      </div>
    );
  }

  const uniqueValues = (key) => {
    return [...new Set(courses.map((course) => course[key]))].filter(
      (value) => value !== undefined && value !== null
    );
  };

  const uniqueSpecializations = () => {
    const specializations = courses.flatMap((course) => {
      return Array.isArray(course["Specialization"])
        ? course["Specialization"]
        : [course["Specialization"]];
    });
    return [...new Set(specializations)].filter(
      (value) => value !== undefined && value !== null
    );
  };

  const filteredCourses = courses.filter(
    (course) =>
      (!filters["Course Code"] ||
        course["Course Code"] === filters["Course Code"]) &&
      (!filters["University"] ||
        course["University"] === filters["University"]) &&
      (!filters["Duration"] || course["Duration"] === filters["Duration"]) &&
      (!filters["Specialization"] ||
        (Array.isArray(course["Specialization"])
          ? course["Specialization"].includes(filters["Specialization"])
          : course["Specialization"] === filters["Specialization"])) &&
      (searchQuery === "" ||
        course["Course Name"]
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        course["University"].toLowerCase().includes(searchQuery.toLowerCase()))
  );

  

  const groupedCourses =
    groupBy === ""
      ? { "": filteredCourses }
      : filteredCourses.reduce((acc, course) => {
          const key = course[groupBy];
          if (!acc[key]) acc[key] = [];
          acc[key].push(course);
          return acc;
        }, {});

  // Function to handle course selection and show the radar chart modal

  // Function to handle course selection and show the radar chart popup
  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setIsPopupOpen(true); // Open the popup
  };

  // Close popup handler
  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const renderCourses = (coursesToRender) => {
    // Function to parse specialization data
    const parseSpecialization = (specialization) => {
      try {
        // Attempt to parse JSON-like strings
        const parsed = JSON.parse(specialization.replace(/'/g, '"'));
        return {
          name: parsed.name || specialization,
          duration: parsed.duration || "",
        };
      } catch {
        // If parsing fails, return as is
        return {
          name: specialization,
          duration: "",
        };
      }
    };

    // Function to get the display duration
    const getDisplayDuration = (course) => {
      const specializationList = course["Specialization"] || [];
      if (course["Duration"] === "years" && specializationList.length > 0) {
        return parseSpecialization(specializationList[0]).duration;
      }
      return course["Duration"] || "N/A";
    };

    // Function to get background color based on index
    const getBackgroundColor = (index) => {
      const colorIndex = Math.floor(index / 10);
      switch (colorIndex) {
        case 0:
          return "#49ffff"; // Light Cyan
        case 1:
          return "hwb(166 22% 9%)"; // Dark Blue
        case 2:
          return "lightyellow"; // Light Yellow
        case 3:
          return "hwb(28 50% 11%)"; // Light Orange
        case 4:
          return "#ee5a5a"; // Light Red
        default:
          return "hwb(326 50% 9%)"; // Dark Pink
      }
    };

    // Check if there are any courses to render
    const hasCourses = Object.values(coursesToRender).some(
      (courses) => courses.length > 0
    );

    if (!hasCourses) {
      return <p>No course found</p>;
    }

    // Map over courses and render them
    return Object.keys(coursesToRender).map((key, index) => {
      const courses = coursesToRender[key] || [];

      return (
        <div
          key={key}
          className={
            isGridView
              ? "grid-view"
              : `list-view ${
                  index % 4 === 0
                    ? "green"
                    : index % 4 === 1
                    ? "blue"
                    : index % 4 === 2
                    ? "yellow"
                    : "orange"
                }`
          }
        >
          {groupBy && <h2>{key}</h2>}
          {isGridView ? (
            courses.length > 0 ? (
              courses.map((course, i) => {
                const specializationList = course["Specialization"] || [];
                const specializationDetails =
                  typeof specializationList === "string"
                    ? [parseSpecialization(specializationList)]
                    : specializationList.map((spec) =>
                        parseSpecialization(spec)
                      );

                return (
                  <div
                    className="course-card"
                    key={course["Course Code"] + i}
                    style={{
                      backgroundColor: getBackgroundColor(index * 10 + i),
                    }}
                  >
                    <div className="course-number">{index * 10 + i + 1}</div>
                    <img
                      src={`https://via.placeholder.com/80/000000/FFFFFF?text=${encodeURIComponent(
                        course["Course Name"][0]
                      )}`}
                      alt="Course Thumbnail"
                    />

                    <div className="course-info">
                      <h3>{course["Course Name"]}</h3>
                      <p>
                        <FontAwesomeIcon icon={faUniversity} /> University:{" "}
                        {course["University"]}
                      </p>
                      <p>
                        <FontAwesomeIcon icon={faGraduationCap} />{" "}
                        Specializations:
                        <ul>
                          {specializationDetails.map((spec, j) => (
                            <li key={j}>
                              {spec.name}
                              <br />
                              <small>{spec.duration}</small>
                            </li>
                          ))}
                        </ul>
                      </p>
                      <p>
                        <FontAwesomeIcon icon={faCalendarAlt} /> Duration:{" "}
                        {getDisplayDuration(course)}
                      </p>
                      <p>Course Code: {course["Course Code"]}</p>
                      <button
                        className="sub-button"
                        onClick={() => handleCourseClick(course)}
                      >
                        View
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No course found</p>
            )
          ) : (
            <table className="list-view-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Thumbnail</th>
                  <th>Course Name</th>
                  <th>Course Code</th>
                  <th>University</th>
                  <th>Specializations</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.length > 0 ? (
                  courses.map((course, i) => {
                    const specializationList = course["Specialization"] || [];
                    const specializationDetails =
                      typeof specializationList === "string"
                        ? [parseSpecialization(specializationList)]
                        : specializationList.map((spec) =>
                            parseSpecialization(spec)
                          );

                    return (
                      <tr
                        key={course["Course Code"] + i}
                        style={{
                          backgroundColor: getBackgroundColor(index * 10 + i),
                        }}
                      >
                        <td>
                          <span className="course-number">
                            {index * 10 + i + 1}
                          </span>
                        </td>
                        <td>
                          <img
                            src={`https://via.placeholder.com/80/000000/FFFFFF?text=${course["Course Name"][0]}`}
                            alt="Course Thumbnail"
                          />
                        </td>
                        <td>{course["Course Name"]}</td>
                        <td>{course["Course Code"]}</td>
                        <td>{course["University"]}</td>
                        <td>
                          <ul>
                            {specializationDetails.map((spec, j) => (
                              <li key={j}>
                                {spec.name}
                                <br />
                                <small>{spec.duration}</small>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td>{getDisplayDuration(course)}</td>
                        <td>
                          <button
                            className="sub-button"
                            onClick={() => handleCourseClick(course)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8">No course found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      );
    });
  };

  return (
    <div className="course-catalog">
      {/* make below center */}

      <h1>Personalized University Recommendation List</h1>
      <div className="filters">
        <input
          type="text"
          placeholder="Search by Course Name, University, etc."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          name="Course Code"
          onChange={(e) =>
            setFilters({ ...filters, "Course Code": e.target.value })
          }
          value={filters["Course Code"]}
        >
          <option value="">All Course Codes</option>
          {uniqueValues("Course Code").map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          name="University"
          onChange={(e) =>
            setFilters({ ...filters, University: e.target.value })
          }
          value={filters["University"]}
        >
          <option value="">All Universities</option>
          {uniqueValues("University").map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          name="Duration"
          onChange={(e) => setFilters({ ...filters, Duration: e.target.value })}
          value={filters["Duration"]}
        >
          <option value="">All Durations</option>
          {uniqueValues("Duration").map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          name="Specialization"
          onChange={(e) =>
            setFilters({ ...filters, Specialization: e.target.value })
          }
          value={filters["Specialization"]}
        >
          <option value="">All Specializations</option>
          {uniqueSpecializations().map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          name="Group By"
          onChange={(e) => setGroupBy(e.target.value)}
          value={groupBy}
        >
          <option value="">No Grouping</option>
          <option value="University">University</option>
          <option value="Duration">Duration</option>
          <option value="Specialization">Specialization</option>
          <option value="Course Code">Course Code</option>
        </select>
        <button onClick={handleResetFilters}>Reset Filters</button>
      </div>
      <div className="view-toggle">
        <button onClick={handleToggleView}>
          {isGridView ? <FaThList /> : <FaTh />}{" "}
          {isGridView ? "Switch to List View" : "Switch to Grid View"}
        </button>
      </div>

      {selectedCourse && (
        <PopupChart
          isOpen={isPopupOpen}
          closePopup={closePopup}
          scores={{
            areaScore: selectedCourse["Area Score"],
            locationScore: selectedCourse["Location Score"],
            durationScore: selectedCourse["Duration Score"],
            careerScore: selectedCourse["Career Score"],
            streamScore: selectedCourse["Stream Score"],
          }}
        />
      )}

      <div className="course-list">{renderCourses(groupedCourses)}</div>
    </div>
  );
};

export default CourseCatalog;
