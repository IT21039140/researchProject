import React from 'react';

function PaperDetails({ selectedPaper, isUnanswered = false }) {
  if (!selectedPaper) {
    return null; // If no paper is selected, don't render anything
  }

  return (
    <div className="selected-paper-container">
      <h3>Paper ID: {selectedPaper.paperId}</h3>
      <p>Number of Questions: {selectedPaper.number_of_questions}</p>

      {/* Conditionally render based on whether it's an unanswered paper or not */}
      {isUnanswered ? (
        <div className="questions-list">
          <h4>Questions:</h4>
          {selectedPaper.questions.map((question, index) => (
            <div key={index} className="question-item">
              <p><strong>Question {question.question_number}:</strong> {question.question_text}</p>
              <ul>
                {question.options.map((option, idx) => (
                  <li key={idx}>{option}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="questions-list">
          <h4>User Score: {selectedPaper.user_score}</h4>
          <h4>Questions:</h4>
          {selectedPaper.questions.map((question, index) => (
            <div key={index} className="question-item">
              <p><strong>Question {question.question_number}:</strong> {question.question}</p>
              <ul>
                {question.options.map((option, idx) => (
                  <li key={idx}>{option}</li>
                ))}
              </ul>
              <p><strong>Your Answer:</strong> {question.user_answer}</p>
              {/* <p><strong>Correct Answer:</strong> {question.correct_answer}</p> */}
              <p
                style={{
                  color: question.answered_correct ? 'green' : 'red',
                  fontWeight: 'bold',
                }}
              >
                {question.answered_correct ? 'Answered Correctly' : 'Answered Incorrectly'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PaperDetails;
