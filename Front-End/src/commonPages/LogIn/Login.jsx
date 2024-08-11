import React, { useState } from 'react';
import './LoginStyles.css'; // Import your CSS styles
import LoginPageImage from '../../assets/LoginPageImage.png'; // Import the image
import RegisterForm from './RegisterForm'; // Import the Register component
import LoginForm from './LoginForm';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);

  const switchToRegister = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  return (
    <div className="container">
      {isLogin ? (
        <LoginForm switchToRegister={switchToRegister} />
      ) : (
        <RegisterForm switchToLogin={switchToLogin} />
      )}
      <div className="illustration">
        <img src={LoginPageImage} alt="Illustration of woman using computer" />
      </div>
    </div>
  );
};


export default Login;
