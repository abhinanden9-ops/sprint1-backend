import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CreateRecipe from '../components/Recipes/CreateRecipe';
import './RecipeList.css';

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Drink', 'Other'];

function RecipeList() {
  const [recipes, setRecipes]       = useState([]);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('All');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'https://sprint1-backend-u1ka.onrender.com';
  const token   = localStorage.getItem('token');

  useEffect(() => { fetchRecipes(); }, [search, category]);

  const fetchRecipes = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search)              params.search   = search;
      if (category !== 'All') params.category = category;
      const response = await axios.get(`${API_URL}/api/recipes`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      if (Array.isArray(response.data)) setRecipes(response.data);
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Session expired. Please log out and sign in again.'
          : 'Unable to load recipes. Please check your connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeCreated = () => {
    setShowCreate(false);
    fetchRecipes();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recipe? This cannot be undone.')) return;
    try {
      await axios.delete(`${API_URL}/api/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipes(recipes.filter((r) => r.id !== id));
    } catch {
      setError('Unable to delete recipe. Please try again.');
    }
  };

  return (
    <div className="App-main">
      <div className="container">

        <div className="rl-header">
          <h1>My Recipes</h1>
          <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? '✕ Cancel' : '+ New Recipe'}
          </button>
        </div>

        {showCreate && <CreateRecipe onCreated={handleRecipeCreated} />}

        <div className="rl-search">
          <span className="rl-search__icon">🔍</span>
          <input
            type="text"
            className="form-control"
            placeholder="Search recipes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="rl-filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`rl-filter-pill ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && <div className="alert alert-info">Loading recipes…</div>}
        {error && (
          <div className="alert alert-danger alert-dismissible">
            {error}
            <button className="btn-close" onClick={() => setError('')} />
          </div>
        )}

        <div className="row g-4">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="col-sm-6 col-lg-4">
              <div className="recipe-card">
                <div className="recipe-card__body">
                  {recipe.category && (
                    <span className="recipe-card__badge">{recipe.category}</span>
                  )}
                  <h5 className="recipe-card__title">{recipe.title}</h5>
                  <p className="recipe-card__desc">
                    {recipe.description || 'No description provided.'}
                  </p>
                  <div className="recipe-card__meta">
                    {recipe.prep_time != null && (
                      <span className="recipe-card__meta-item">⏱ {recipe.prep_time} min</span>
                    )}
                    {recipe.servings != null && (
                      <span className="recipe-card__meta-item">🍽 {recipe.servings} servings</span>
                    )}
                  </div>
                  <div className="recipe-card__actions">
                    <Link to={`/recipes/${recipe.id}`} className="btn btn-primary">View</Link>
                    <button className="btn btn-danger" onClick={() => handleDelete(recipe.id)}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && !error && recipes.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">🍽</div>
            <div className="empty-state__title">
              {category !== 'All' ? `No ${category} recipes yet` : 'No recipes yet'}
            </div>
            <p className="empty-state__text">
              {category !== 'All'
                ? 'Try a different category or create a new recipe.'
                : 'Hit "+ New Recipe" to add your first one!'}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default RecipeList;
