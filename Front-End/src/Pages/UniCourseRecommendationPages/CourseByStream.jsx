import React, { useState, useEffect } from "react";
import { RingLoader } from "react-spinners";
import "./Styles/CourseCatalog.css"; // Ensure the path is correct
import axios from "axios";
import swal from "sweetalert";
import { FaThList, FaTh } from "react-icons/fa";
import { useParams } from "react-router-dom";

const CourseByStream = () => {
  const { stream } = useParams();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGridView, setIsGridView] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [filters, setFilters] = useState({
    "Course Code": "",
    University: "",
    Specialization: "",
    Duration: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const getCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8010/uni/courses/`);
        const courses = response.data;
        const filteredCourses = courses.filter(
          (course) => course.stream === stream
        );
        setCourses(filteredCourses);
      } catch (error) {
        swal("Error fetching courses:", error.message);
      } finally {
        setLoading(false);
      }
    };

    getCourses();
  }, [stream]);

  const handleToggleView = () => {
    setIsGridView(!isGridView);
  };

  const handleResetFilters = () => {
    setFilters({
      "Course Code": "",
      University: "",
      Specialization: "",
      Duration: "",
    });
    setSearchQuery("");
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
    // To avoid direct access to nested arrays, use `flatMap` carefully
    if (key === "specializations") {
      return [
        ...new Set(
          courses.flatMap((course) =>
            course.universities.flatMap((uni) => uni.specializations)
          )
        ),
      ].filter((value) => value !== undefined && value !== null);
    } else {
      return [
        ...new Set(
          courses.flatMap((course) =>
            course.universities.map((uni) => uni[key])
          )
        ),
      ].filter((value) => value !== undefined && value !== null);
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      (!filters["Course Code"] ||
        course.course_code === filters["Course Code"]) &&
      (!filters["University"] ||
        course.universities.some(
          (uni) => uni.uni_name === filters["University"]
        )) &&
      (!filters["Specialization"] ||
        course.universities.some((uni) =>
          uni.specializations.includes(filters["Specialization"])
        )) &&
      (!filters["Duration"] ||
        course.universities.some(
          (uni) => uni.duration === filters["Duration"]
        )) &&
      (searchQuery === "" ||
        course.course_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const renderCourses = () => {
    return (
      <table className="courses-table">
        <thead>
          <tr>
            <th>Course Name</th>
            <th>Course Code</th>
            <th>Proposed Intake</th>
            <th>Area</th>
            <th>English Requirement</th>
            <th>Universities</th>
            <th>Minimum Eligibility Requirements</th>
          </tr>
        </thead>
        <tbody>
          {filteredCourses.map((course) => (
            <tr key={course.id} onClick={() => handleCourseClick(course)}>
              <td>{course.course_name}</td>
              <td>{course.course_code}</td>
              <td>{course.proposed_intake}</td>
              <td>{course.area}</td>
              <td>{course.english_requirement}</td>
              <td>
                <ul>
                  {course.universities.map((uni, i) => (
                    <li key={i}>
                      <strong>{uni.uni_name}</strong> -{" "}
                      {uni.specializations.join(", ")}, {uni.province},{" "}
                      {uni.duration}
                    </li>
                  ))}
                </ul>
              </td>
              <td>
                <ul>
                  {course.minimum_eligibility_requirements.map((req, i) => (
                    <li key={i}>
                      Subjects: {req.subjects.join(", ")}, Grade: {req.grade}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="course-content">
      <h1>Course Catalog</h1>
      <div className="filters">
        <input
          type="text"
          placeholder="Search by Course Name"
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
          {uniqueValues("course_code").map((value) => (
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
          {uniqueValues("uni_name").map((value) => (
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
          {uniqueValues("specializations").map((value) => (
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
          {uniqueValues("duration").map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <button onClick={handleResetFilters}>Reset Filters</button>
      </div>
      
      <div className="courses">{renderCourses()}</div>
    </div>
  );
};

export default CourseByStream;
