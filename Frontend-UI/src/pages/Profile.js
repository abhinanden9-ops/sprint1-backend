import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

function Profile({ user: appUser, onProfileUpdate }) {
  const navigate = useNavigate();
  const API_URL  = process.env.REACT_APP_API_URL || 'https://sprint1-backend-u1ka.onrender.com';
  const token    = localStorage.getItem('token');

  const [profile, setProfile]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [username, setUsername]     = useState('');
  const [nameMsg, setNameMsg]       = useState({ text: '', type: '' });
  const [nameSaving, setNameSaving] = useState(false);

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg]   = useState({ text: '', type: '' });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
        setUsername(res.data.username);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
          return;
        }
        // Fall back to data we already have from login so the page still renders
        if (appUser) {
          const fallback = { ...appUser, recipe_count: null };
          setProfile(fallback);
          setUsername(appUser.username || '');
          setFetchError('Some info unavailable — showing cached data.');
        } else {
          setFetchError('Unable to load profile. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!username.trim()) { setNameMsg({ text: 'Username cannot be empty.', type: 'danger' }); return; }
    setNameSaving(true);
    setNameMsg({ text: '', type: '' });
    try {
      const res = await axios.put(
        `${API_URL}/api/auth/profile`,
        { username: username.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile((p) => ({ ...p, username: res.data.username }));
      onProfileUpdate && onProfileUpdate(res.data);
      setNameMsg({ text: 'Username updated!', type: 'success' });
    } catch (err) {
      setNameMsg({ text: err.response?.data?.error || 'Failed to update. Try again.', type: 'danger' });
    } finally {
      setNameSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.next.length < 6) {
      setPwMsg({ text: 'New password must be at least 6 characters.', type: 'danger' }); return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg({ text: 'New passwords do not match.', type: 'danger' }); return;
    }
    setPwSaving(true);
    setPwMsg({ text: '', type: '' });
    try {
      await axios.put(
        `${API_URL}/api/auth/profile`,
        { currentPassword: pwForm.current, newPassword: pwForm.next },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPwForm({ current: '', next: '', confirm: '' });
      setPwMsg({ text: 'Password changed successfully!', type: 'success' });
    } catch (err) {
      setPwMsg({ text: err.response?.data?.error || 'Failed to change password.', type: 'danger' });
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return <div className="container mt-5"><div className="alert alert-info">Loading profile…</div></div>;
  }

  if (!profile) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{fetchError || 'Unable to load profile.'}</div>
        <button className="btn btn-secondary mt-3" onClick={() => navigate('/')}>← Back</button>
      </div>
    );
  }

  const joinedDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  const initials = (profile.username || '?').charAt(0).toUpperCase();

  return (
    <div className="App-main">
      <div className="container" style={{ maxWidth: 760 }}>

        <button className="btn btn-secondary mb-4" onClick={() => navigate('/')}>
          ← Back to recipes
        </button>

        {fetchError && (
          <div className="alert alert-info mb-4">{fetchError}</div>
        )}

        {/* Hero */}
        <div className="profile-hero">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-hero__name">{profile.username}</div>
          <div className="profile-hero__email">{profile.email}</div>
          {profile.created_at && (
            <div className="profile-hero__joined">Member since {joinedDate}</div>
          )}
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-card__value">
              {profile.recipe_count != null ? profile.recipe_count : '—'}
            </div>
            <div className="stat-card__label">Recipes</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">🍳</div>
            <div className="stat-card__label">Chef Status</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value" style={{ fontSize: '1.05rem', paddingTop: 10 }}>
              {profile.created_at ? new Date(profile.created_at).getFullYear() : '—'}
            </div>
            <div className="stat-card__label">Year Joined</div>
          </div>
        </div>

        {/* Account Info */}
        <div className="profile-section">
          <div className="profile-section__header">
            <div className="profile-section__icon profile-section__icon--orange">👤</div>
            <h3 className="profile-section__title">Account Info</h3>
          </div>
          <div className="profile-section__body">
            <div className="info-row">
              <span className="info-row__label">Username</span>
              <span className="info-row__value">{profile.username}</span>
            </div>
            <div className="info-row">
              <span className="info-row__label">Email</span>
              <span className="info-row__value">{profile.email}</span>
            </div>
            {profile.created_at && (
              <div className="info-row">
                <span className="info-row__label">Member Since</span>
                <span className="info-row__value">{joinedDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Edit Username */}
        <div className="profile-section">
          <div className="profile-section__header">
            <div className="profile-section__icon profile-section__icon--orange">✏️</div>
            <h3 className="profile-section__title">Edit Username</h3>
          </div>
          <div className="profile-section__body">
            {nameMsg.text && (
              <div className={`alert alert-${nameMsg.type} mb-3`}>{nameMsg.text}</div>
            )}
            <form onSubmit={handleUpdateName}>
              <div className="mb-3">
                <label className="form-label">New Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter new username"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={nameSaving}>
                {nameSaving ? 'Saving…' : 'Save Username'}
              </button>
            </form>
          </div>
        </div>

        {/* Change Password */}
        <div className="profile-section">
          <div className="profile-section__header">
            <div className="profile-section__icon profile-section__icon--blue">🔒</div>
            <h3 className="profile-section__title">Change Password</h3>
          </div>
          <div className="profile-section__body">
            {pwMsg.text && (
              <div className={`alert alert-${pwMsg.type} mb-3`}>{pwMsg.text}</div>
            )}
            <form onSubmit={handleChangePassword}>
              <div className="mb-3">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={pwForm.current}
                  onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={pwForm.next}
                  onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                  placeholder="Min. 6 characters"
                />
              </div>
              <div className="mb-4">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={pwSaving}>
                {pwSaving ? 'Changing…' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;
