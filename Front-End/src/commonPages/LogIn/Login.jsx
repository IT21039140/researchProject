// Login.js (modified)
import React, { useState } from 'react';
import './LoginStyles.css';
import LoginPageImage from '../../assets/logInImage.png';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import PasswordResetForm from './PasswordResetForm';

const Login = () => {
  const [activeForm, setActiveForm] = useState('login'); // Track the active form

  const switchToRegister = () => setActiveForm('register');
  const switchToLogin = () => setActiveForm('login');
  const switchToPasswordReset = () => setActiveForm('passwordReset');

  return (
    <div className="login-container">
      {activeForm === 'login' && <LoginForm switchToRegister={switchToRegister} switchToPasswordReset={switchToPasswordReset} />}
      {activeForm === 'register' && <RegisterForm switchToLogin={switchToLogin} />}
      {activeForm === 'passwordReset' && <PasswordResetForm switchToLogin={switchToLogin} />}
      
      <div className="illustration">
        <img src={LoginPageImage} alt="Illustration of woman using computer" />
      </div>
    </div>
  );
};

export default Login;
