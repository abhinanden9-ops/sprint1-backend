import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import IngredientList from '../components/Ingredients/IngredientList';

function RecipeDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [recipe, setRecipe]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [editMode, setEditMode]   = useState(false);
  const [formData, setFormData]   = useState({});
  const [error, setError]         = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'https://sprint1-backend-u1ka.onrender.com';
  const token   = localStorage.getItem('token');

  useEffect(() => { fetchRecipe(); }, [id]);

  const fetchRecipe = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/api/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setRecipe(response.data);
        setFormData(response.data);
      }
    } catch (err) {
      setError(err.response?.status === 404 ? 'Recipe not found.' : 'Unable to load recipe.');
      setTimeout(() => navigate('/'), 1500);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!formData.title?.trim()) { setError('Title is required.'); return; }
    try {
      const response = await axios.put(`${API_URL}/api/recipes/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipe(response.data || formData);
      setEditMode(false);
      setSuccessMsg('Recipe updated!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setError('Failed to update recipe. Please try again.');
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  if (loading) return <div className="container mt-5 alert alert-info">Loading recipe…</div>;
  if (!recipe) return <div className="container mt-5 alert alert-danger">Recipe not found.</div>;

  return (
    <div className="App-main">
      <div className="container" style={{ maxWidth: 820 }}>

        <button className="btn btn-secondary mb-4" onClick={() => navigate('/')}>
          ← Back to recipes
        </button>

        {error && (
          <div className="alert alert-danger alert-dismissible mb-3">
            {error}
            <button className="btn-close" onClick={() => setError('')} />
          </div>
        )}
        {successMsg && (
          <div className="alert alert-success mb-3">{successMsg}</div>
        )}

        {editMode ? (
          <div className="card p-4 mb-4">
            <h2 className="mb-4" style={{ fontSize: '1.4rem' }}>Edit Recipe</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-3">
                <label className="form-label">Title *</label>
                <input type="text" className="form-control" name="title"
                  value={formData.title || ''} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" name="description" rows="2"
                  value={formData.description || ''} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Instructions</label>
                <textarea className="form-control" name="instructions" rows="5"
                  value={formData.instructions || ''} onChange={handleChange} />
              </div>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Prep Time (min)</label>
                  <input type="number" className="form-control" name="prep_time" min="0"
                    value={formData.prep_time || ''} onChange={handleChange} />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Servings</label>
                  <input type="number" className="form-control" name="servings" min="1"
                    value={formData.servings || ''} onChange={handleChange} />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Category</label>
                  <input type="text" className="form-control" name="category"
                    placeholder="e.g. Dessert" value={formData.category || ''} onChange={handleChange} />
                </div>
              </div>
              <div className="d-flex gap-2 mt-2">
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-secondary"
                  onClick={() => { setEditMode(false); setFormData(recipe); setError(''); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card mb-4" style={{ overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', padding: '32px 36px', color: '#fff' }}>
              {recipe.category && (
                <span style={{ background: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', fontWeight: 700, padding: '4px 14px', borderRadius: 50, display: 'inline-block', marginBottom: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {recipe.category}
                </span>
              )}
              <h1 style={{ color: '#fff', fontSize: '2rem', marginBottom: 8 }}>{recipe.title}</h1>
              <div style={{ display: 'flex', gap: 24, fontSize: '0.85rem', opacity: 0.85 }}>
                {recipe.prep_time != null && <span>⏱ {recipe.prep_time} min prep</span>}
                {recipe.servings  != null && <span>🍽 {recipe.servings} servings</span>}
              </div>
            </div>
            <div className="card-body p-4">
              {recipe.description && (
                <p style={{ fontSize: '1rem', color: 'var(--text-mid)', marginBottom: 24 }}>
                  {recipe.description}
                </p>
              )}
              {recipe.instructions && (
                <div>
                  <h5 style={{ fontWeight: 700, marginBottom: 12, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-light)' }}>
                    Instructions
                  </h5>
                  <p style={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>{recipe.instructions}</p>
                </div>
              )}
              <button className="btn btn-warning mt-4" onClick={() => setEditMode(true)}>
                ✏ Edit Recipe
              </button>
            </div>
          </div>
        )}

        <IngredientList recipeId={id} />
      </div>
    </div>
  );
}

export default RecipeDetail;
