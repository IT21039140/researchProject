import React, { useState } from 'react';
import ITQuestionsComponent from './ITQuestionsComponent';

function PaperDetails({ selectedPaper, isUnanswered = false ,fetchQuestions}) {
  const [retakeMode, setRetakeMode] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Handle the retake button click
  // setRetakeMode(true)
  const handleRetake = () => {
    setRetakeMode(false);
    setUserAnswers({}); // Reset user answers for the retake
    setShowResults(false);
    setScore(0);
    setMessage('');
    setMessageType('');
  };

  console.log('retakeMode :: ',retakeMode)

  const normalizeAnswer = (answer) => {
    if (!answer) return ''; // Return an empty string if answer is undefined or empty
    return answer.replace(/^[A-D]\.\s*/, '').trim().toLowerCase();
  };

  const handleAnswerChange = (questionNumber, answer) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionNumber]: answer,
    }));
  };

  if (!selectedPaper) {
    return null; // If no paper is selected, don't render anything
  }

  return (
    <div className="selected-paper-container">
      <h3>Paper ID: {selectedPaper.paperId}</h3>
      <p>Number of Questions: {selectedPaper.number_of_questions}</p>

      {retakeMode===true ? (
        <div className="questions-list">
          <h4>{isUnanswered ? 'Unanswered Questions' : 'User Score: ' + selectedPaper.user_score}</h4>
          {selectedPaper.questions.map((question, index) => (
            <div key={index} className="question-item">
              <p><strong>Question {question.question_number}:</strong> {question.question_text || question.question}</p>
              <ul>
                {question.options.map((option, idx) => (
                  <li key={idx}>{option}</li>
                ))}
              </ul>
              {!isUnanswered && (
                <p><strong>Your Answer:</strong> {question.user_answer}</p>
              )}
              {!isUnanswered && (
                <p
                  style={{
                    color: question.answered_correct ? 'green' : 'red',
                    fontWeight: 'bold',
                  }}
                >
                  {question.answered_correct ? 'Answered Correctly' : 'Answered Incorrectly'}
                </p>
              )}
            </div>
          ))}
          <button onClick={handleRetake} className="retake-button">
            {isUnanswered ? 'Answer Paper' : 'Retake Questions'}
          </button>
        </div>
      ) : (
        <ITQuestionsComponent
          questions={selectedPaper.questions}
          userAnswers={userAnswers}
          handleAnswerChange={handleAnswerChange}
          normalizeAnswer={normalizeAnswer}
          showResults={showResults}
          setShowResults={setShowResults}
          setScore={setScore}
          score={score}
          setMessage={setMessage}
          setMessageType={setMessageType}
          paperId={selectedPaper.paperId}
          paperDes={selectedPaper.paperDes}
          fetchQuestions={fetchQuestions} // Pass the fetchQuestions callback to ITQuestionsComponent

        />
      )}

      {message && (
        <div className={`message ${messageType === 'success' ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default PaperDetails;
