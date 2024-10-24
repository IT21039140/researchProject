import React from 'react';

function LawQuestionsComponent({ questionSets }) {
  return (
    <div className="law-questions-container">
      {Object.keys(questionSets).map((setKey, index) => {
        const set = questionSets[setKey];
        return (
          <div key={index} className="question-set">
            <h3>{set.title}</h3>
            <div className="questions">
              {set.questions.split('\n').map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default LawQuestionsComponent;
