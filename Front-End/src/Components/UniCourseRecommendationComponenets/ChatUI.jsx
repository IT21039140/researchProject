import React, { useState, useEffect, useRef } from "react";
import "./Styles/chat.css";
import chatImg from "../../icons/chat.png";
import bot from "../../icons/bot.png";
import boy from "../../icons/boy.png";
import SubjectResultSelector from "./form";
import SortableListComponent from "./DragandDropForm";
import swal from "sweetalert";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ChatUI = () => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [name, setName] = useState("User");
  const [id, setId] = useState("102030");

  const [answers, setAnswers] = useState({
    welcome: "",
    Year: "",
    Stream: "",
    English: "",
    Preferred_University: "",
    Career_Areas: [],
    duration: "",
    Locations: [],
    areas: [],
    Results: [],
  });

  const navigate = useNavigate();

  const processCareerAreas = (input) => {
    // Handle the case where input is a comma-separated string
    if (typeof input === "string") {
      return input.split(",").map((item) => item.trim());
    }

    // Handle the case where input is an array or a single value
    return Array.isArray(input) ? input : [input];
  };

  const handleSubmit = async () => {
    // Format data to match API requirements
    const formattedData = {
      user_id: id,
      Name: name,
      Year: answers.Year,
      Stream: answers.Stream,
      English: answers.English,
      Preferred_University: answers.Preferred_University,
      Career_Areas: processCareerAreas(answers.Career_Areas),
      duration: answers.duration,
      Locations: answers.Locations,
      areas: answers.areas,
      Results: answers.Results.map((result) => ({
        subject: result.subject,
        grade: result.grade,
      })),
    };

    try {
      const response = await axios.post(
        "http://localhost:8010/uni/users/",
        formattedData
      );
      const { id } = response.data; // Ensure the API response contains an 'id'
      navigate(`/myrecommendations/${id}`); // Navigate to the page with the returned id
    } catch (error) {
      console.error("There was an error submitting the form!", error);
      alert("Submission failed. Please try again.");
    }
  };

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [shouldAutoClose, setShouldAutoClose] = useState(false);
  const chatBodyRef = useRef(null);
  const endOfMessagesRef = useRef(null);
  const [subjectResultPairs, setSubjectResultPairs] = useState([]);
  const [message, setMessage] = useState("");
  const [showQText, setShowQText] = useState(false);

  const handleResultSubmit = (results) => {
    console.log("Results from SubjectResultSelector:", results);
    setSubjectResultPairs(results);
    const hasEmptyField = subjectResultPairs.some(
      (pair) => !pair.subject || !pair.grade
    );

    if (hasEmptyField) {
      swal("Please fill in all subject and result fields.");
      return; // Exit early if there's an error
    } else {
      setAnswers((prev) => ({
        ...prev,
        Results: results,
      }));

      goToNextQuestion();
    }
  };

  const handleSortUpdate = (sortedList, type) => {
    if (type === "areas") {
      setAnswers((prev) => {
        const updatedAnswers = { ...prev, areas: sortedList };

        if (updatedAnswers.areas.length === 0) {
          swal("Please rank areas");
        } else {
          goToNextQuestion();
        }

        return updatedAnswers;
      });
    } else if (type === "locations") {
      setAnswers((prev) => {
        const updatedAnswers = { ...prev, Locations: sortedList };

        if (updatedAnswers.Locations.length === 0) {
          swal("Please rank locations");
        } else {
          goToNextQuestion();
        }

        return updatedAnswers;
      });
    }
  };

  const questions = [
    {
      type: "choice",
      text: (
        <div>
          <p>Hello {name}! 👋</p>
          <p>
            Welcome to our personalized university course recommendation system.
          </p>
          <p>
            I'm here to help you find the best university courses based on your
            interests and goals.
          </p>
          <p>Shall we get started?</p>
        </div>
      ),
      options: ["Yes, let's go!", "Not right now"],
      name: "welcome",
    },
    {
      type: "input",
      text: "In which Year did you complete your A/L exam?",
      placeholder: "Type your answer here...",
      name: "Year",
    },
    {
      type: "choice",
      text: "In which Stream did you take your A/L exam?",
      options: [
        "Biological Science Stream",
        "Physical Science Stream",
        "Commerce Stream",
        "Arts Stream",
        "Bio Technology Stream",
        "Engineering Technology Stream",
      ],
      name: "Stream",
    },
    {
      type: "custom",
      text: "Include your A/L results Here",
      result: (
        <div>
          <SubjectResultSelector
            initialResults={answers.Results}
            onSubmit={handleResultSubmit}
          />
        </div>
      ),
      name: "Results",
    },
    {
      type: "choice",
      text: "Select Your O/L English Grade",
      options: ["A", "B", "C", "S", "W"],
      name: "English",
    },
    {
      type: "choice",
      text: "Whitch University type you prefer more",
      options: ["Private", "Government"],
      name: "Preferred_University",
    },
    {
      type: "Rank",
      text: "Rank your prefered areas of Study?",
      rank: (
        <SortableListComponent
          stream={answers.Stream}
          displayArea={true}
          onSortUpdate={(sortedList) => handleSortUpdate(sortedList, "areas")} // Pass the sorted areas back to the parent
        />
      ),
      name: "areas",
    },
    {
      type: "Rank",
      text: "Rank your prefered University Locations?",
      rank: (
        <SortableListComponent
          displayLocations={true}
          onSortUpdate={(sortedList) =>
            handleSortUpdate(sortedList, "locations")
          } // Pass the sorted locations back to the parent
        />
      ),
      name: "Locations",
    },

    {
      type: "input",
      text: "Insert your prefered career areas",
      placeholder: "Type your answer here...",
      name: "Career_Areas",
    },
    {
      type: "choice",
      text: "Choose your prefered duration",
      options: ["2 years", "3 years", "4 years", "5 years"],
      name: "duration",
    },
    {
      type: "text",
      text: "You have come to the end.Click Confirm button to get your personalized recommendations",
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

  const handleOptionClick = (option, name) => {
    setAnswers({
      ...answers,
      [name]: option,
    });
    if (name === "welcome" && option === "Not right now") {
      setShouldAutoClose(true);
    }
    goToNextQuestion();
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputSubmit = () => {
    if (inputValue) {
      setAnswers({
        ...answers,
        [questions[questionIndex].name]: inputValue,
      });
      setInputValue("");
      goToNextQuestion();
    }
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

  const handleEditClick = (name) => {
    const questionIdx = questions.findIndex((q) => q.name === name);
    setQuestionIndex(questionIdx);
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleConfirm = () => {
    // Define required fields and their human-readable labels
    const requiredFields = {
      Stream: "A/L Stream",
      English: "O/L English Grade",
      Preferred_University: "Preferred University Type",
      Career_Areas: "Career Areas",
      duration: "Preferred Course Duration",
      Locations: "Preferred Locations",
      areas: "Preferred Areas of Study",
      Results: "A/L Results",
    };

    // Find missing fields
    const missingFields = Object.keys(requiredFields).filter(
      (field) =>
        !answers[field] ||
        (Array.isArray(answers[field]) && answers[field].length === 0)
    );

    if (missingFields.length === 0) {
      // All required fields are answered
      console.log("All questions answered:", answers);
      swal("Your responses have been submitted.");
      // Proceed with further actions
      handleSubmit();
    } else {
      // Some fields are missing
      const missingFieldsText = missingFields
        .map((field) => requiredFields[field])
        .join(", ");
      swal(
        `Please complete the following fields before submitting: ${missingFieldsText}`
      );
    }
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
          <div className="chat-popup-body" ref={chatBodyRef}>
            <div className="chat-messages">
              {questions.slice(0, questionIndex + 1).map((q, idx) => (
                <div key={idx} className="chat-message">
                  <div className="bot-message">
                    <div className="bot-icon">
                      <img src={bot} alt="Bot" />
                    </div>
                    <div className="message-content">
                      <div className="message-text">{q.text}</div>

                      {q.type === "choice" && idx === questionIndex && (
                        <div className="options-list">
                          {q.options.map((option, index) => (
                            <div
                              key={index}
                              className={`option-item ${
                                answers[idx] === option ? "selected" : ""
                              }`}
                              onClick={() => handleOptionClick(option, q.name)}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      )}
                      {q.type === "custom" && <div>{q.result}</div>}
                      {q.type === "Rank" && <div>{q.rank}</div>}

                      {questionIndex === questions.length && (
                        <div className="message-text">
                          Thank you for answering all the questions! 🎉
                          <br />
                          Your preferences have been saved.
                        </div>
                      )}
                    </div>
                  </div>

                  {answers[q.name] && (
                    <div className="user-message">
                      <div className="message-content">
                        <div className="message-text">
                          {q.type === "Rank" && answers[q.name] && (
                            <div>
                              {answers[q.name].map((item, index) => (
                                <div key={index} className="ranked-item">
                                  <span>{index + 1}.</span>
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {q.type === "custom" && answers[q.name] && (
                            <div>
                              {answers[q.name].map((pair, index) => (
                                <div key={index}>
                                  <span>{pair.subject}:</span>
                                  <span>{pair.grade}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {q.type === "input" && answers[q.name] && (
                            <div>
                              {Array.isArray(answers[q.name])
                                ? answers[q.name].join(", ")
                                : answers[q.name]}{" "}
                            </div>
                          )}

                          {q.type === "choice" && answers[q.name]}
                        </div>
                        <div className="btn-container">
                          <button
                            className="edit-btn"
                            onClick={() => handleEditClick(q.name)}
                          >
                            ✎
                          </button>
                        </div>
                      </div>
                      <div className="user-icon">
                        <img src={boy} alt="User" />
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
                  ➤
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
                <button
                  type="submit"
                  className="confirm-btn"
                  onClick={handleConfirm}
                >
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
