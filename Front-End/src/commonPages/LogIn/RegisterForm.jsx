import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterForm = ({ switchToLogin }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  // Function to validate strong password
  const validatePassword = (password) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== passwordConfirm) {
      setMessage('Passwords do not match.');
      setMessageType('error');
      return;
    }

    // Check if password meets criteria
    if (!validatePassword(password)) {
      setMessage(
        'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'
      );
      setMessageType('error');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/register/', {
        email,
        first_name: firstName,
        last_name: lastName,
        password,
        password_confirm: passwordConfirm,
      });

      if (response.data.email) {
        setMessage('Registration successful! Proceed to payment.');
        setMessageType('success');
        navigate('/');
      }
    } catch (error) {
      setMessage('Registration failed. Please check your details.');
      setMessageType('error');
    }
  };

  return (
    <div className="login-form">
      <h2>Register</h2>
      <p>
        Already have an account?{' '}
        <a href="#" onClick={switchToLogin}>
          Log In
        </a>
      </p>
      <form onSubmit={handleRegister}>
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="first_name">First Name</label>
        <input
          type="text"
          id="first_name"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <label htmlFor="last_name">Last Name</label>
        <input
          type="text"
          id="last_name"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          placeholder="Enter a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label htmlFor="password_confirm">Confirm Password</label>
        <input
          type="password"
          id="password_confirm"
          placeholder="Confirm your password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
        />

        <button type="submit">REGISTER</button>
      </form>
      {message && <div className={`message ${messageType}`}>{message}</div>}
    </div>
  );
};

export default RegisterForm;
