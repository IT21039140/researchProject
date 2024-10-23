import React, { useState } from 'react';

function MessageInput({ onSend, loading }) {
  const [input, setInput] = useState('');

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSend = (e) => {
    e.preventDefault()
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <div style={styles.messageInput}>
      {loading && (
        <div style={styles.sendingLoader}>Sending...</div>
      )}
      
      <form onSubmit={handleSend} style={{ display: 'flex', marginTop: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message"
          style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #ddd' }}
          disabled={loading}
        />
        <button
          type="submit"
          style={{ padding: '10px 20px', marginLeft: '10px', borderRadius: '10px', border: '1px solid #00BCD4', backgroundColor: '#00BCD4', color: 'white' }}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  messageInput: {
    display: 'flex',
    flexDirection: 'column', // Stack loader above input
    alignItems: 'center',
    padding: '10px',
    borderTop: '1px solid #ddd',
    backgroundColor: '#f9f9f9',
  },
  input: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '20px',
    marginBottom: '10px', // Space between loader and input
  },
  button: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '20px',
    backgroundColor: '#00BCD4',//007BFF
    color: 'white',
    cursor: 'pointer',
  },
  sendingLoader: {
    textAlign: 'center',
    padding: '5px',
    fontSize: '14px',
    color: '#007BFF',//#007BFF
  },
};

export default MessageInput;
