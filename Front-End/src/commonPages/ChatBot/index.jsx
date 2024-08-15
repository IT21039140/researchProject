import React, { useState, useEffect } from 'react';
import ChatWindow from './includes/ChatWindow';
import MessageInput from './includes/MessageInput';
import ChatHistory from './includes/ChatHistory';
import axios from 'axios';

function Index() {
  const [email, setEmail] = useState('lahiru@gmail.com');
  const [sessionID, setSessionID] = useState('');
  const [messages, setMessages] = useState([
    { text: 'Hi! How can I help you today?', sender: 'bot' }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchMessages(sessionID) {
      if (sessionID) {
        setMessages([])
        try {
          const response = await axios.get(`http://127.0.0.1:5000/api/get_single_chat/${sessionID}`);
          const messages = response.data;

          const newMessages = [];
          messages.chat_history.forEach((x) => {
            newMessages.push({ text: x.user_message, sender: 'user' });
            newMessages.push({ text: x.user_respond, sender: 'bot' });
          });

          setMessages((prevMessages) => [...prevMessages, ...newMessages]);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }
    }

    fetchMessages(sessionID);
  }, [sessionID]); // Fetch messages only when sessionID changes

  const handleSelectSession = (sessionID) => {
    setSessionID(sessionID);
    // Fetch and display the chat for the selected session
  };

  const handleSend = async (text) => {
    setLoading(true); // Set loading to true when sending a message
    setMessages((prevMessages) => [...prevMessages, { text, sender: 'user' }]);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text, user_email: email, session_id: sessionID }),
      });
      const data = await response.json();
      setMessages((prevMessages) => [...prevMessages, { text: data.response, sender: 'bot' }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false); // Set loading to false when response is received
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <ChatHistory onSelectSession={handleSelectSession} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ChatWindow messages={messages} loading={loading} />
        <MessageInput onSend={handleSend} loading={loading} />
      </div>
    </div>
  );
}

export default Index;
