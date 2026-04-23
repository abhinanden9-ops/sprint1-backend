import React, { useState } from 'react';
import axios from 'axios';

function CreateRecipe({ onCreated }) {
  const [formData, setFormData] = useState({
    title: '', description: '', instructions: '',
    prep_time: '', servings: '', category: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'https://sprint1-backend-u1ka.onrender.com';
  const token   = localStorage.getItem('token');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { setError('Recipe title is required.'); return; }
    if (formData.prep_time && (isNaN(formData.prep_time) || formData.prep_time < 0)) {
      setError('Prep time must be a positive number.'); return;
    }
    if (formData.servings && (isNaN(formData.servings) || formData.servings < 1)) {
      setError('Servings must be at least 1.'); return;
    }
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/recipes`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({ title: '', description: '', instructions: '', prep_time: '', servings: '', category: '' });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 mb-4">
      <h4 className="mb-4" style={{ fontWeight: 700 }}>New Recipe</h4>
      {error && <div className="alert alert-danger mb-3">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title *</label>
          <input type="text" className="form-control" name="title"
            value={formData.title} onChange={handleChange} placeholder="e.g. Spaghetti Bolognese" required />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea className="form-control" name="description" rows="2"
            value={formData.description} onChange={handleChange}
            placeholder="A short summary of the dish…" />
        </div>
        <div className="mb-3">
          <label className="form-label">Instructions</label>
          <textarea className="form-control" name="instructions" rows="4"
            value={formData.instructions} onChange={handleChange}
            placeholder="Step-by-step instructions…" />
        </div>
        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label">Prep Time (min)</label>
            <input type="number" className="form-control" name="prep_time"
              value={formData.prep_time} onChange={handleChange} min="0" placeholder="30" />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Servings</label>
            <input type="number" className="form-control" name="servings"
              value={formData.servings} onChange={handleChange} min="1" placeholder="4" />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Category</label>
            <input type="text" className="form-control" name="category"
              value={formData.category} onChange={handleChange} placeholder="e.g. Dinner" />
          </div>
        </div>
        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? 'Creating…' : '+ Create Recipe'}
        </button>
      </form>
    </div>
  );
}

export default CreateRecipe;
