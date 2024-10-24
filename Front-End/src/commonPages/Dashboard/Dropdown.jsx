import React from 'react';
import { useNavigate } from 'react-router-dom';

function Dropdown({ visible, onClose }) {
  const navigate = useNavigate();

  if (!visible) return null;

  return (
    <div className="dropdown-menu">
      <ul>
        <li><a href="#" onClick={() => { onClose(); navigate('/settings'); }}>Settings</a></li>
        <li><a href="#" onClick={() => { onClose(); navigate('/'); }}>Log Out</a></li>
      </ul>
    </div>
  );
}

export default Dropdown;
