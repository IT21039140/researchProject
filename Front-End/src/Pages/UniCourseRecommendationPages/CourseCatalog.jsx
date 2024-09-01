import React, { useState, useEffect } from 'react';
import { RingLoader } from 'react-spinners';
import './Styles/CourseCatalog.css'; // Ensure the path is correct
import axios from 'axios';
import swal from 'sweetalert';
import { FaThList, FaTh } from 'react-icons/fa';

const CourseCatalog = () => {
    const apiEndpoint = 'http://localhost:8000/api/gnn/';
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isGridView, setIsGridView] = useState(true);
    const [filters, setFilters] = useState({
        'Course Code': '',
        'University': '',
        'Duration': '',
        'Specialization': ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [groupBy, setGroupBy] = useState('');
    const [userData, setUserData] = useState({
        Name: "Sayuni",
        Year: 2018,
        Stream: "Biological Science Stream",
        Results: [
            { subject: "Biology", grade: "B" },
            { subject: "Physics", grade: "C" },
            { subject: "Chemistry", grade: "B" }
        ],
        English: "A",
        Preferred_University: "Government",
        Locations: [
            "Central Province", "Western Province", "Sabaragamuwa Province", "North Western Province",
            "North Central Province", "Southern Province", "Uva Province", "Eastern Province", "Northern Province"
        ],
        "Career Areas": ["Doctor", "Lawyer"],
        areas: [
            "Medicine & Health Care", "Science & Technology", "Agricultural Sciences",
            "Information Technology & Management", "Architecture & Design", "Business & Management",
            "Tourism & Hospitality", "Arts & Humanities", "Law", "Environmental Sciences"
        ],
        duration: "4 years"
    });

    useEffect(() => {
        const fetchRecommendations = async () => {
            setLoading(true);
            try {
                const response = await axios.post(apiEndpoint, userData);
                setCourses(response.data);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                if (error.response && error.response.status === 400) {
                    swal("Error", "Bad Request", "error");
                } else {
                    swal("Error", error.message, "error");
                }
            }
        };

        fetchRecommendations();
    }, [userData]);

    const handleToggleView = () => {
        setIsGridView(!isGridView);
    };

    const handleResetFilters = () => {
        setFilters({
            'Course Code': '',
            'University': '',
            'Duration': '',
            'Specialization': ''
        });
        setSearchQuery('');
        setGroupBy('');
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
        return [...new Set(courses.map(course => course[key]))].filter(value => value !== undefined && value !== null);
    };

    const uniqueSpecializations = () => {
        const specializations = courses.flatMap(course => {
            return Array.isArray(course['Specialization']) ? course['Specialization'] : [course['Specialization']];
        });
        return [...new Set(specializations)].filter(value => value !== undefined && value !== null);
    };

    const filteredCourses = courses
        .filter(course => (
            (!filters['Course Code'] || course['Course Code'] === filters['Course Code']) &&
            (!filters['University'] || course['University'] === filters['University']) &&
            (!filters['Duration'] || course['Duration'] === filters['Duration']) &&
            (!filters['Specialization'] || 
                (Array.isArray(course['Specialization']) ? course['Specialization'].includes(filters['Specialization']) : course['Specialization'] === filters['Specialization'])
            ) &&
            (searchQuery === '' || course['Course Name'].toLowerCase().includes(searchQuery.toLowerCase()) ||
             course['University'].toLowerCase().includes(searchQuery.toLowerCase()))
        ));

    const groupedCourses = groupBy === '' ? { '': filteredCourses } : filteredCourses.reduce((acc, course) => {
        const key = course[groupBy];
        if (!acc[key]) acc[key] = [];
        acc[key].push(course);
        return acc;
    }, {});

const renderCourses = (coursesToRender) => {
    return Object.keys(coursesToRender).map((key, index) => (
        <div key={key} className={isGridView ? 'grid-view' : `list-view ${index % 4 === 0 ? 'green' : index % 4 === 1 ? 'blue' : index % 4 === 2 ? 'yellow' : 'orange'}`}>
            {groupBy && <h2>{key}</h2>}
            {isGridView ? (
                coursesToRender[key].map((course, i) => (
                    <div className="course-card" key={course['Course Code'] + i}>
                        <div className="course-number">{index * 10 + i + 1}</div>
                        <img src={`https://via.placeholder.com/80?text=${course['Course Name'][0]}`} alt="Course Thumbnail" />
                        <div className="course-info">
                            <h3>{course['Course Name']}</h3>
                            <p>University: {course['University']}</p>
                            <p>Specialization: {course['Specialization'] || 'N/A'}</p>
                            <p>Duration: {course['Duration']}</p>
                            <p>Course_code:{course['Course Code']}</p>
                            <button>View</button>
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
                        </tr>
                    </thead>
                    <tbody>
                        {coursesToRender[key].map((course, i) => (
                            <tr key={course['Course Code'] + i}>
                                <td>{index * 10 + i + 1}</td>
                                <td><img src={`https://via.placeholder.com/80?text=${course['Course Name'][0]}`} alt="Course Thumbnail" /></td>
                                <td>{course['Course Name']}</td>
                                <td>{course['Course Code']}</td>
                                <td>{course['University']}</td>
                                <td>{course['Specialization'] || 'N/A'}</td>
                                <td>{course['Duration'] || 'N/A'}</td>
                                <td> <button>View</button></td>
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
            <div className="filters">
                <input
                    type="text"
                    placeholder="Search by Course Name, University, etc."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select name="Course Code" onChange={e => setFilters({ ...filters, 'Course Code': e.target.value })} value={filters['Course Code']}>
                    <option value="">All Course Codes</option>
                    {uniqueValues('Course Code').map(value => <option key={value} value={value}>{value}</option>)}
                </select>
                <select name="University" onChange={e => setFilters({ ...filters, 'University': e.target.value })} value={filters['University']}>
                    <option value="">All Universities</option>
                    {uniqueValues('University').map(value => <option key={value} value={value}>{value}</option>)}
                </select>
                <select name="Duration" onChange={e => setFilters({ ...filters, 'Duration': e.target.value })} value={filters['Duration']}>
                    <option value="">All Durations</option>
                    {uniqueValues('Duration').map(value => <option key={value} value={value}>{value}</option>)}
                </select>
                <select name="Specialization" onChange={e => setFilters({ ...filters, 'Specialization': e.target.value })} value={filters['Specialization']}>
                    <option value="">All Specializations</option>
                    {uniqueSpecializations().map(value => <option key={value} value={value}>{value}</option>)}
                </select>
                <select name="Group By" onChange={e => setGroupBy(e.target.value)} value={groupBy}>
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
                    {isGridView ? <FaThList /> : <FaTh />} {isGridView ? 'Switch to List View' : 'Switch to Grid View'}
                </button>
            </div>
            <div className="course-list">
                {renderCourses(groupedCourses)}
            </div>
        </div>
    );
};

export default CourseCatalog;
