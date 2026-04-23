import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import RecipeList from './pages/RecipeList';
import RecipeDetail from './pages/RecipeDetail';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser]   = useState(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  );

  const handleLogin = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleProfileUpdate = (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    setUser(merged);
    localStorage.setItem('user', JSON.stringify(merged));
  };

  return (
    <Router>
      <div className="App">
        {token && <Navigation user={user} onLogout={handleLogout} />}
        <Routes>
          <Route path="/login"       element={token ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
          <Route path="/register"    element={token ? <Navigate to="/" /> : <Register onLogin={handleLogin} />} />
          <Route path="/"            element={token ? <RecipeList /> : <Navigate to="/login" />} />
          <Route path="/recipes/:id" element={token ? <RecipeDetail /> : <Navigate to="/login" />} />
          <Route path="/profile"     element={token ? <Profile user={user} onProfileUpdate={handleProfileUpdate} /> : <Navigate to="/login" />} />
          <Route path="*"            element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
