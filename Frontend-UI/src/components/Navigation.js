import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navigation.css';

function Navigation({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="qc-nav">
      <div className="qc-nav__brand">
        <div className="qc-nav__logo">🍳</div>
        <span className="qc-nav__name">QuickCook</span>
      </div>
      <div className="qc-nav__right">
        <span className="qc-nav__user">
          Hey, <span>{user?.username}</span>
        </span>
        <button className="btn btn-outline-light qc-nav__logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navigation;
