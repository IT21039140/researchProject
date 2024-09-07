import React, { useState, useEffect } from "react";
import { RingLoader } from "react-spinners";
import "./Styles/CourseCatalog.css"; // Ensure the path is correct
import axios from "axios";
import swal from "sweetalert";
import { FaThList, FaTh } from "react-icons/fa";
import { useParams } from "react-router-dom";
import PopupChart from "../../Components/UniCourseRecommendationComponenets/RadarChartApp";
import {
  checkUserExists,
  updateUserRecommendations,
  addUserRecommendations,
} from "./apis/recomondationapi";
import { fetchUserData, fetchRecommendations } from "./apis/courseapi";

//http://localhost:5173/myrecommendations/66387dca157b0e532fea6106
const CourseCatalog = () => {
  const { id } = useParams();
  const userId = "4090"; // Hardcoded user ID for now
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
  const [userData, setUserData] = useState({
    Name: "",
    Year: "",
    Stream: "",
    Results: [
      { subject: "", grade: "" },
      { subject: "", grade: "" },
      { subject: "", grade: "" },
    ],
    English: "",
    Preferred_University: "",
    Locations: [],
    "Career Areas": [],
    areas: [],
    duration: "",
  });

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchUserData(id);
        setUserData(data);
        const recommendations = await fetchRecommendations(data);
        setCourses(recommendations);

        // Ensure saveRecommendations is defined and called correctly
      } catch (error) {
        console.log("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]); // Dependency array contains only id

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
    const courseFormat = CourseFormat(courses);
    saveRecommendations(courseFormat);
  }, [courses]);

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
    return Object.keys(coursesToRender).map((key, index) => (
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
          coursesToRender[key].map((course, i) => (
            <div className="course-card" key={course["Course Code"] + i}>
              <div className="course-number">{index * 10 + i + 1}</div>
              <img
                src={`https://via.placeholder.com/80?text=${course["Course Name"][0]}`}
                alt="Course Thumbnail"
              />
              <div className="course-info">
                <h3>{course["Course Name"]}</h3>
                <p>University: {course["University"]}</p>
                <p>Specialization: {course["Specialization"] || "N/A"}</p>
                <p>Duration: {course["Duration"]}</p>
                <p>Course_code:{course["Course Code"]}</p>
                <button
                  className="submit-button"
                  onClick={() => handleCourseClick(course)}
                >
                  View Radar Chart
                </button>
              </div>
            </div>
          ))
        ) : (
          <table className="list-view-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Thumbnail</th>
                <th>Course Name</th>
                <th>Course Code</th>
                <th>University</th>
                <th>Specialization</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coursesToRender[key].map((course, i) => (
                <tr key={course["Course Code"] + i}>
                  <td>{index * 10 + i + 1}</td>
                  <td>
                    <img
                      src={`https://via.placeholder.com/80?text=${course["Course Name"][0]}`}
                      alt="Course Thumbnail"
                    />
                  </td>
                  <td>{course["Course Name"]}</td>
                  <td>{course["Course Code"]}</td>
                  <td>{course["University"]}</td>
                  <td>{course["Specialization"] || "N/A"}</td>
                  <td>{course["Duration"] || "N/A"}</td>
                  <td>
                    {" "}
                    <button
                      className="submit-button"
                      onClick={() => handleCourseClick(course)}
                    >
                      View Radar Chart
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    ));
  };

  return (
    <div className="course-catalog">
      {/* make below center */}

      <h1>Course Catalog</h1>
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
