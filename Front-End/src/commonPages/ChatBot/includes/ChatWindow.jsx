import React from 'react';

function ChatWindow({ messages, loading }) {
  return (
    <div style={styles.chatWindow}>
      {messages.map((message, index) => (
        <div
          key={index}
          style={{
            ...styles.message,
            alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
            backgroundColor: message.sender === 'user' ? '#00BCD4' : '#BBDEFB', // Blue for user, default for bot 
            textAlign: message.sender === 'user' ? 'right' : 'left',
            marginLeft: message.sender === 'user' ? 'auto' : '10px', // Align user messages to the right with margin
            marginRight: message.sender === 'user' ? '10px' : 'auto', // Align bot messages to the left with margin
          }}
        >
          {message.text}
        </div>
      ))}
    </div>
  );
}

const styles = {
  chatWindow: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '70px',
    overflowY: 'auto',
    backgroundColor: '#E3F2FD',
    
  },
  message: {
    maxWidth: '60%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '10px', // Slightly curved ends
    boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.1)',
    color: '#0D47A1', // Text color for the user message (white on blue)
  },
  loader: {
    textAlign: 'center',
    padding: '10px',
    fontSize: '16px',
    color: '#007BFF',
  },
};

export default ChatWindow;
