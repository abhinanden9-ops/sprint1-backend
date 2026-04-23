import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Navigation.css';

function Navigation({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const initials = user?.username ? user.username.charAt(0).toUpperCase() : '?';

  return (
    <nav className="qc-nav">
      <Link to="/" className="qc-nav__brand">
        <div className="qc-nav__logo">🍳</div>
        <span className="qc-nav__name">QuickCook</span>
      </Link>

      <div className="qc-nav__right">
        <Link to="/profile" className="qc-nav__profile-btn">
          <div className="qc-nav__avatar">{initials}</div>
          <span className="qc-nav__username">{user?.username}</span>
        </Link>
        <button className="btn btn-outline-light qc-nav__logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navigation;
