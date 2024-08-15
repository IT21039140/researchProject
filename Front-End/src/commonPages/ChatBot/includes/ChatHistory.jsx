import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ChatHistory({ onSelectSession }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [userEmail, setUserEmail] = useState('lahiru@gmail.com');

  useEffect(() => {
    async function fetchChatHistory() {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/get_chat/${userEmail}`);
        const uniqueSessions = [...new Set(response.data.chat_history.map(chat => chat.session_id))];
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
        backgroundColor: '#343a40',
        color: '#fff',
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      <h2>Chat History</h2>
      {chatHistory.length > 0 ? (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {chatHistory.map((sessionID, index) => (
            <li key={index} style={{ marginBottom: '10px' }}>
              <button
                onClick={() => onSelectSession(sessionID)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#007bff',
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
