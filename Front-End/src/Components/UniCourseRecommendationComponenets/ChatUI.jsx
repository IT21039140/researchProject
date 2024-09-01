import React, { useState, useEffect, useRef } from "react";
import "./Styles/chat.css";
import chatImg from "../../icons/chat.png";
import SubjectResultSelector from "./form";

const ChatUI = () => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [shouldAutoClose, setShouldAutoClose] = useState(false);
  const chatBodyRef = useRef(null);
  const endOfMessagesRef = useRef(null);
  const handleSubjectResultChange = (newPairs) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      subjectsResults: newPairs
    }));
  };
 

  const questions = [
    {
      type: "choice",
      text: (
        <div>
          <p>Hello! 👋</p>
          <p>Welcome to our personalized university course recommendation system.</p>
          <p>I'm here to help you find the best university courses based on your interests and goals.</p>
          <p>Shall we get started?</p>
        </div>
      ),
      options: ["Yes, let's go!", "Not right now"],
    },
    {
      type: "text",
      text: "No problem! When you’re ready for course recommendations, just let me know. Feel free to reach out anytime! 😊",
    },
    {
      type: "text",
      text: "Great! Let's start with a few questions to understand your preferences.",
    },
    {
      type: "input",
      text: "In which year did you complete your A/L exam?",
      placeholder: "Type your answer here...",
    },
    {
      type: "choice",
      text: "In which stream did you take your A/L exam?",
      options: [
        "Biological Science Stream",
        "Physical Science Stream",
        "Commerce Stream",
        "Art Stream",
        "Bio Technology Stream",
        "Engineering Technology Stream",
      ],
    },
    {
      type: "custom",
      text: (  <div><SubjectResultSelector onChange={handleSubjectResultChange} /></div>), // Use SubjectResultSelector here
    },
    {
      type: "choice",
      text: "What is your preferred method of stress relief?",
      options: ["Exercise", "Meditation", "Socializing", "Hobbies"],
    },
    {
      type: "input",
      text: "Which of these do you struggle with the most?",
      placeholder: "Type your answer here...",
    },
    {
      type: "choice",
      text: "How would you rate your overall stress level?",
      options: ["Low", "Moderate", "High", "Extreme"],
    },
  ];

  useEffect(() => {
    if (isChatOpen && questionIndex >= 0) {
      setIsBotTyping(true);
      setTimeout(() => {
        setIsBotTyping(false);
        scrollToBottom();
      }, 1000);
    }
  }, [questionIndex, isChatOpen]);

  useEffect(() => {
    if (shouldAutoClose) {
      setTimeout(() => {
        setIsChatOpen(false);
      }, 3000); // Auto-close after 3 seconds
    }
  }, [shouldAutoClose]);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOptionClick = (option) => {
    setAnswers({
      ...answers,
      [questionIndex]: option,
    });

    if (option === "Not right now") {
      setQuestionIndex(1); // Move to the "Not right now" message
      setShouldAutoClose(true); // Set to auto-close chat
    } else {
      // Check if the next question should be skipped or not
      if (questionIndex === 0 && option === "Yes, let's go!") {
        setQuestionIndex(2); // Skip directly to the next question
      } else {
        goToNextQuestion();
      }
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputSubmit = () => {
    if (inputValue.trim() === "") return;
    setAnswers({
      ...answers,
      [questionIndex]: inputValue,
    });
    setInputValue("");
    goToNextQuestion();
  };

  const goToNextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    }
  };

  const skipQuestion = () => {
    goToNextQuestion();
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleConfirm = () => {
    console.log("All questions answered:", answers);
    alert("Your responses have been submitted.");
  };

  const handleRefreshChat = () => {
    setQuestionIndex(0);
    setAnswers({});
    setInputValue("");
    setIsBotTyping(false);
    scrollToBottom();
  };

  return (
    <div className="chat-container">
      <div className="user-chat-icon" onClick={toggleChat}>
        <img src={chatImg} alt="User" />
      </div>

      {isChatOpen && (
        <div className="chat-popup">
          <div className="nice-icon">
            <img src={chatImg} alt="User" />
          </div>
          <div className="chat-popup-header">
            <h3>Uni Course Advisor</h3>
            <div className="header-right-icons">
              <button className="refresh-chat-btn" onClick={handleRefreshChat}>
                ⟳
              </button>
              <button className="close-chat-btn" onClick={toggleChat}>
                ✖
              </button>
            </div>
          </div>
          <div className="chat-popup-body">
            <div className="chat-messages">
              {questions.slice(0, questionIndex + 1).map((q, idx) => (
                <div key={idx} className="chat-message">
                  <div className="bot-message">
                    <div className="bot-icon">
                      <img src="/path-to-bot-icon.png" alt="Bot" />
                    </div>
                    <div className="message-content">
                      <div className="message-text">{q.text}</div>
                      {q.type === "choice" && idx === questionIndex && (
                        <div className="options-list">
                          {q.options.map((option, optIdx) => (
                            <div
                              key={optIdx}
                              className={`option-item ${
                                answers[idx] === option ? "selected" : ""
                              }`}
                              onClick={() => handleOptionClick(option)}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      )}
                      {q.type === "custom" && <div>{q.text}</div>}
                    </div>
                  </div>

                  {answers[idx] && (
                    <div className="user-message">
                      <div className="message-content">
                        <div className="message-text">{answers[idx]}</div>
                      </div>
                      <div className="user-icon">
                        <img src="/path-to-user-icon.png" alt="User" />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isBotTyping && (
                <div className="bot-message typing-indicator">
                  <div className="bot-icon">
                    <img src="/path-to-bot-icon.png" alt="Bot" />
                  </div>
                  <div className="message-content">
                    <div className="message-text typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={endOfMessagesRef} />
            </div>

            {questions[questionIndex]?.type === "input" && (
              <div className="input-area">
                <input
                  type="text"
                  className="input-box"
                  placeholder={questions[questionIndex].placeholder}
                  value={inputValue}
                  onChange={handleInputChange}
                />
                <button className="send-btn" onClick={handleInputSubmit}>
                  Send
                </button>
              </div>
            )}

            <div className="nav-buttons-container">
              {questionIndex > 0 && (
                <button className="back-btn" onClick={goToPreviousQuestion}>
                  Back
                </button>
              )}
              {questionIndex < questions.length - 1 ? (
                <button className="skip-btn" onClick={skipQuestion}>
                  Skip
                </button>
              ) : (
                <button className="confirm-btn" onClick={handleConfirm}>
                  Confirm
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatUI;
