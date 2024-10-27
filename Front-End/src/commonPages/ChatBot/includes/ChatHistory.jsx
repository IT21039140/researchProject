import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ChatHistory({ onSelectSession }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [userEmail, setUserEmail] = useState(localStorage.getItem('email'));
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    async function fetchChatHistory() {
      try {
        
        // const response = await axios.get(`http://127.0.0.1:5000/api/get_chat/${userEmail}`);
        const response = await axios.get(
          `http://127.0.0.1:8000/api/service2/get_chat/${userEmail}/`,
          {
            headers: {
              Authorization: `Bearer ${token}` // Attach the token in the Authorization header
            }
          }
        );        const uniqueSessions = [...new Set(response.data.chat_history.map(chat => chat.session_id))];
        setChatHistory(uniqueSessions);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    }

    fetchChatHistory();
  }, [userEmail]);

  return (
    <div
      style={{
        width: '300px',
        backgroundColor: '#5C6BC0',//#343a40
        color: '#fff',
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      <h2>EduGuideBot</h2>
      {chatHistory.length > 0 ? (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {chatHistory.map((sessionID, index) => (
            <li key={index} style={{ marginBottom: '10px' }}>
              <button
                onClick={() => onSelectSession(sessionID)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#0D47A1',//#007bff
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Chat {index+1}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No chat history available.</p>
      )}
    </div>
  );
}

export default ChatHistory;
