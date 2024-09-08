import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert';

const LoginForm = ({ switchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Request to login and get tokens
      const response = await axios.post('http://127.0.0.1:8001/api/login/', {
        email,
        password,
      });

      swal('Login successful!', '', 'success');

      // Store tokens in localStorage
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);

      // Fetch user details using the access token
      const userResponse = await axios.get('http://127.0.0.1:8001/api/users/'+email, {
        headers: {
          Authorization: `Bearer ${response.data.access}`,
        },
      });

      // Store user details in localStorage
      localStorage.setItem('user_details', JSON.stringify({
        id: userResponse.data.id,
        first_name: userResponse.data.first_name,
        last_name: userResponse.data.last_name,
        email: userResponse.data.email,
      }));

      setMessage('Login successful!');
      setMessageType('success');

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      setMessage('Invalid email or password.');
      setMessageType('error');
    }
  };

  return (
    <div className="login-form">
      <h2>Login</h2>
      <p>Don't have an account yet? <a href="#" onClick={switchToRegister}>Sign Up</a></p>
      <form onSubmit={handleLogin}>
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          placeholder="Enter 6 characters or more"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="extras">
          <a href="#" className="forgot-password">Forgot Password?</a>
        </div>

        <button type="submit">LOGIN</button>
      </form>
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default LoginForm;
