import React, { useState, useEffect } from "react";
import { RingLoader } from "react-spinners";
import {
  FaUniversity,
  FaClock,
  FaSearch,
  FaUndoAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";
import axios from "axios";
import swal from "sweetalert";
import { useParams } from "react-router-dom";
import "./Styles/course.css";

const CourseByStream = () => {
  const { stream } = useParams() || "Biological Science";
  console.log(stream);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    "Course Code": "",
    University: "",
    Specialization: "",
    Duration: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const parseSpecializations = (specializations) => {
    return specializations.map((spec) => {
      if (typeof spec === 'string') {
        // Trim whitespace and check if the string resembles a JSON object
        const trimmedSpec = spec.trim();
  
        // Try parsing as JSON if it looks like an object
        if (trimmedSpec.startsWith('{') && trimmedSpec.endsWith('}')) {
          try {
            const parsedSpec = JSON.parse(trimmedSpec.replace(/'/g, '"'));
            return {
              name: parsedSpec.name || "",
              duration: parsedSpec.duration || "",
            };
          } catch (error) {
            console.error("Failed to parse specialization JSON:", spec, error);
            return null; // Return null if parsing fails
          }
        }
  
        // If it's a plain string (not JSON), return an object with name and default duration
        return {
          name: trimmedSpec,
          duration: "", // Modify as needed
        };
      } else {
        console.error("Unexpected type encountered:", spec);
        return null; // Return null for unexpected types
      }
    }).filter((spec) => spec !== null); // Filter out any null entries
  };
  
  

  const uniqueValues = (key) => {
    return [
      ...new Set(
        courses.flatMap((course) =>
          course.universities.flatMap((uni) =>
            key === "specializations" ? uni.specializations : uni[key]
          )
        )
      ),
    ].filter((value) => value);
  };


  useEffect(() => {
    const getCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://127.0.0.1:8000/api/service3/courses/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        setCourses(response.data); // Store all courses initially
      } catch (error) {
        swal("Error fetching courses:", error.message);
      } finally {
        setLoading(false);
      }
    };

    getCourses();
  }, []);

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

  const filteredCourses = courses.filter((course) => {
    const isInStream =
      stream === "ALL" || (stream ? course.stream === stream : true);
    return (
      isInStream &&
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
      (!searchQuery ||
        course.course_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const renderCourses = () => {
    return (
      <div className="course-catalog1">
        {filteredCourses.map((course) => (
          <div className="course-card1" key={course.id}>
            <h3 className="course-name">{course.course_name}</h3>
            <p className="course-code"><strong>Code:</strong> {course.course_code}</p>
            <p className="course-intake"><strong>Intake:</strong> {course.proposed_intake}</p>
            <p className="course-area"><strong>Area:</strong> {course.area}</p>
            <p className="course-english"><strong>English Requirement:</strong> {course.english_requirement}</p>

            <div className="universities-section">
              <strong>Universities:</strong>
              <div className="university-list">
                {course.universities.map((uni, i) => (
                  <div key={i} className="university-card">
                    <h4><FaUniversity /> {uni.uni_name}</h4>
                    <p className="university-info"><FaMapMarkerAlt className="icon" /> {uni.province}</p>
                    <p className="university-info"><FaClock className="icon" /> {uni.duration}</p>
                    <div className="specializations-section">
                      <h4>Specializations:</h4>
                      <ul className="specializations-list">
                        {parseSpecializations(uni.specializations).map((spec, index) => (
                          <li key={index} className="specialization-item">
                            <strong>{spec.name}</strong> - <span>{spec.duration}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="course-content">
      <h1>Course Catalog</h1>
      <div className="filters1">
        <div className="filter-group">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by Course Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            name="Course Code"
            onChange={(e) => setFilters({ ...filters, "Course Code": e.target.value })}
            value={filters["Course Code"]}
          >
            <option value="">All Course Codes</option>
            {uniqueValues("course_code").map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            name="University"
            onChange={(e) => setFilters({ ...filters, University: e.target.value })}
            value={filters["University"]}
          >
            <option value="">All Universities</option>
            {uniqueValues("uni_name").map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            name="Specialization"
            onChange={(e) => setFilters({ ...filters, Specialization: e.target.value })}
            value={filters["Specialization"]}
          >
            <option value="">All Specializations</option>
            {uniqueValues("specializations").map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
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
        </div>

        <button onClick={handleResetFilters} className="reset-button">
          <FaUndoAlt /> Reset Filters
        </button>
      </div>

      <div className="courses">{renderCourses()}</div>
    </div>
  );
};

export default CourseByStream;
