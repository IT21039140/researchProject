import React, { useState } from "react";
import "./Styles/SubjectResultSelector.css"; // Import the stylesheet

const subjects = ["Math", "Science", "English", "History", "Geography"];
const results = ["A", "B", "C", "D", "E"];

const SubjectResultSelector = ({ onSubmit }) => {
  const [subjectPairs, setSubjectPairs] = useState([
    "", // Initial empty subject pairs
    "",
    "",
  ]);
  const [resultPairs, setResultPairs] = useState([
    "", // Initial empty grade pairs
    "",
    "",
  ]);

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
    // Combine subjects and results into pairs
    const combinedPairs = subjectPairs.map((subject, index) => ({
      subject: subject,
      grade: resultPairs[index] || "", // Ensure each pair has a grade
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
      <button onClick={handleSubmit} className="submit-button">
        Submit Results
      </button>
    </div>
  );
};

export default SubjectResultSelector;
