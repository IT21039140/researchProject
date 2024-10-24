// Message.js
import React from 'react';

function Message({ text, sender }) {
  const messageStyle = {
    margin: '5px 0',
    padding: '10px',
    borderRadius: '5px',
    alignSelf: sender === 'bot' ? 'flex-start' : 'flex-end',
    backgroundColor: sender === 'bot' ? '#e0e0e0' : '#007bff',
    color: sender === 'bot' ? 'black' : 'white',
  };

  return (
    <div style={messageStyle}>
      <p>{text}</p>
    </div>
  );
}

export default Message;
