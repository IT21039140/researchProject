import React, { useState, useEffect } from "react";
import { RingLoader } from "react-spinners";
import "./Styles/CourseCatalog.css"; // Ensure the path is correct
import axios from "axios";
import swal from "sweetalert";
import { FaThList, FaTh } from "react-icons/fa";

import PopupChart from "../../Components/UniCourseRecommendationComponenets/RadarChartApp";

//http://localhost:5173/myrecommendations/66387dca157b0e532fea6106
const RecommendationHistory = () => {
  const userId = "1234"; // Hardcoded user ID for now
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGridView, setIsGridView] = useState(true);
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

  useEffect(() => {
    const getRecommendations = async (userId) => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8010/uni/recommendations/get-by-user/${userId}/`
        );

        const recommendationData = response.data.recommendations;
        setCourses(recommendationData);
      } catch (error) {
        swal("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      getRecommendations(userId);
    }
  }, [userId]);

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
    if (!Array.isArray(courses)) return [];
    return [...new Set(courses.map((course) => course[key]))].filter(
      (value) => value !== undefined && value !== null
    );
  };

  const uniqueSpecializations = () => {
    if (!Array.isArray(courses)) return [];
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
          if (!key) {
            if (!acc["Unknown"]) acc["Unknown"] = [];
            acc["Unknown"].push(course);
          } else {
            if (!acc[key]) acc[key] = [];
            acc[key].push(course);
          }
          return acc;
        }, {});

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const renderCourses = (coursesToRender) => {
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
          {groupBy && <h2>{key || "All Courses"}</h2>}
          {isGridView ? (
            courses.map((course, i) => (
              <div className="course-card" key={course["course_code"] + i}>
                <div className="course-number">{index * 10 + i + 1}</div>
                <img
                  src={`https://via.placeholder.com/80?text=${course["course_name"][0]}`}
                  alt="Course Thumbnail"
                />
                <div className="course-info">
                  <h3>{course["course_name"]}</h3>
                  <p>University: {course["university"]}</p>
                  <p>Specialization: {course["specialization"] || "N/A"}</p>
                  <p>Duration: {course["duration"]}</p>
                  <p>Course Code: {course["course_code"]}</p>
                  <button
                    className="sub-button"
                    onClick={() => handleCourseClick(course)}
                  >
                    View
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
                {courses.map((course, i) => (
                  <tr key={course["course_code"] + i}>
                    <td>{index * 10 + i + 1}</td>
                    <td>
                      <img
                        src={`https://via.placeholder.com/80?text=${course["course_name"][0]}`}
                        alt="Course Thumbnail"
                      />
                    </td>
                    <td>{course["course_name"]}</td>
                    <td>{course["course_code"]}</td>
                    <td>{course["university"]}</td>
                    <td>{course["specialization"] || "N/A"}</td>
                    <td>{course["duration"] || "N/A"}</td>
                    <td>
                      <button
                        className="sub-button"
                        onClick={() => handleCourseClick(course)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      );
    });
  };

  return (
    <div className="dashboard-content">
      <h1 className="title">Course Catalog</h1>
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

export default RecommendationHistory;
