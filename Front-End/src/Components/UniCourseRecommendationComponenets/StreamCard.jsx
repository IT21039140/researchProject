import React from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming you're using React Router

const StreamCard = ({ title, description, color, link, icon }) => {
  const navigate = useNavigate(); // For navigation

  const handleClick = () => {
    navigate(link); // Navigate to the relevant page
  };

  return (
    <div className="stream-card" style={{ backgroundColor: color }} onClick={handleClick}>
      <div className="icon-wrapper">
        <img src={icon} alt={`${title} icon`} className="stream-icon" />
      </div>
      <h3 className="stream-title">{title}</h3>
      <p className="stream-description">{description}</p>
      <button className="explore-button">Explore Now</button>
    </div>
  );
};

export default StreamCard;
