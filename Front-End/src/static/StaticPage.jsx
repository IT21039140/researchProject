// src/components/StaticPage.js
import React from 'react';
import styles from './StaticPage.module.css'; // CSS module for unique styling
import logo from './logInImage.png'
import { Link } from 'react-router-dom';

const StaticPage = () => {
  return (
    <div className={styles.pageContainer}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <img src={logo} alt="Logo" className={styles.logoImage} />
          <h1>Aspira</h1>
        </div>
        <div className={styles.navButtons}>
          {/* Use Link to navigate to the login page */}
          <Link to="/login">
            <button className={styles.navButton}>Login</button>
          </Link>
          <button className={styles.navButton}>Contact Us</button>
        </div>
      </nav>

      <div className={styles.content}>
        <h1>Welcome to My Static Page</h1>
        <p>This is a simple static page with unique styles and a custom navigation bar.</p>
      </div>
    </div>
  );
};

export default StaticPage;
