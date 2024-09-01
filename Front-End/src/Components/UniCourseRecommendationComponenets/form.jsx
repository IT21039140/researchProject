import React, { useState } from 'react';

const subjects = ['Math', 'Science', 'English', 'History', 'Geography'];
const results = ['A', 'B', 'C', 'D', 'E'];

const SubjectResultSelector = ({ onChange }) => {
  const [pairs, setPairs] = useState([
    { subject: '', result: '' },
    { subject: '', result: '' },
    { subject: '', result: '' }
  ]);

  const handleSubjectChange = (index, value) => {
    const newPairs = [...pairs];
    newPairs[index].subject = value;
    setPairs(newPairs);
    onChange(newPairs); // Notify parent of the update
  };

  const handleResultChange = (index, value) => {
    const newPairs = [...pairs];
    newPairs[index].result = value;
    setPairs(newPairs);
    onChange(newPairs); // Notify parent of the update
  };

  // Function to get filtered subjects and results for dropdowns
  const getAvailableSubjects = (index) => {
    const selectedSubjects = pairs.map(pair => pair.subject).filter(subject => subject);
    return subjects.filter(subject => !selectedSubjects.includes(subject));
  };

  const getAvailableResults = (index) => {
    return results;
  };

  return (
    <div>
      {pairs.map((pair, index) => (
        <div key={index} style={{ marginBottom: '10px' }}>
          <div>
            <label>
              Subject {index + 1}:
              <select
                value={pair.subject}
                onChange={(e) => handleSubjectChange(index, e.target.value)}
              >
                <option value="">Select Subject</option>
                {getAvailableSubjects(index).map(subj => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ marginLeft: '10px' }}>
              Result {index + 1}:
              <select
                value={pair.result}
                onChange={(e) => handleResultChange(index, e.target.value)}
              >
                <option value="">Select Result</option>
                {getAvailableResults(index).map(result => (
                  <option key={result} value={result}>
                    {result}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubjectResultSelector;
