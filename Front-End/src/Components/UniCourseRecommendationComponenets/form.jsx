import React, { useState, useEffect } from "react";
import "./Styles/SubjectResultSelector.css"; // Import the stylesheet

const subjects = [
  "Accounting",
  "Business Studies",
  "Economics",
  "Business Statistics",
  "Geography",
  "Political Science",
  "History The logic and the scientific method",
  "English",
  "German",
  "French",
  "Agricultural Sciences",
  "Combined Mathematics",
  "Information and Communication Technology",
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Home Economics",
  "Communication & Media Studies",
  "Civil Technology",
  "Electrical, Electronic and Information Technology",
  "Agro Technology",
  "Mechanical Technology",
  "Food Technology",
  "Bio-Resource Technology",
  "Sinhala",
  "Tamil",
  "Arabic",
  "Pali",
  "Sanskrit",
  "Buddhism",
  "Hinduism",
  "Christianity",
  "Islam",
  "Buddhist Civilization",
  "Hindu Civilization",
  "Christian Civilization",
  "Islamic Civilization",
  "Greek & Roman Civilization",
  "Art",
  "Dancing",
  "Music",
  "Drama & Theatre",
  "Chinese",
  "Hindi",
  "Japanese",
  "Malay",
  "Russian",
  "Korean",
  "Biosystems Technology",
  "Science for Technology",
  "Engineering Technology",
];
const results = ["A", "B", "C", "S", "F","W"];

const SubjectResultSelector = ({ initialResults = [], onSubmit }) => {
  const [subjectPairs, setSubjectPairs] = useState(["", "", ""]); // Initial empty subjects
  const [resultPairs, setResultPairs] = useState(["", "", ""]); // Initial empty results

  // Update state when initialResults prop changes
  useEffect(() => {
    if (initialResults.length > 0) {
      const subjectsFromInitial = initialResults.map(
        (item) => item.subject || ""
      );
      const resultsFromInitial = initialResults.map((item) => item.grade || "");
      setSubjectPairs(subjectsFromInitial);
      setResultPairs(resultsFromInitial);
    }
  }, [initialResults]);

  const handleSubjectChange = (index, value) => {
    const newSubjectPairs = [...subjectPairs];
    newSubjectPairs[index] = value;
    setSubjectPairs(newSubjectPairs);
  };

  const handleResultChange = (index, value) => {
    const newResultPairs = [...resultPairs];
    newResultPairs[index] = value;
    setResultPairs(newResultPairs);
  };

  const getAvailableSubjects = (index) => {
    const selectedSubjects = subjectPairs.filter((subject) => subject);
    return subjects.filter(
      (subject) =>
        !selectedSubjects.includes(subject) || subject === subjectPairs[index]
    );
  };

  const getAvailableResults = () => results;

  const handleSubmit = () => {
    const combinedPairs = subjectPairs.map((subject, index) => ({
      subject: subject,
      grade: resultPairs[index] || "",
    }));
    if (typeof onSubmit === "function") {
      onSubmit(combinedPairs); // Pass combined pairs to parent
    }
  };

  return (
    <div className="option-item">
      {subjectPairs.map((subject, index) => (
        <div key={index} className="subject-grade-pair">
          <label className="form-label">
            Subject {index + 1}:
            <select
              className="form-select"
              value={subject}
              onChange={(e) => handleSubjectChange(index, e.target.value)}
            >
              <option value="">Select Subject</option>
              {getAvailableSubjects(index).map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Result {index + 1}:
            <select
              className="form-select"
              value={resultPairs[index]}
              onChange={(e) => handleResultChange(index, e.target.value)}
            >
              <option value="">Select Result</option>
              {getAvailableResults().map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </label>
        </div>
      ))}
      <div className="profile-buttons">
        <button onClick={handleSubmit} className="submit-button">
          Submit Results
        </button>
      </div>
    </div>
  );
};

export default SubjectResultSelector;
