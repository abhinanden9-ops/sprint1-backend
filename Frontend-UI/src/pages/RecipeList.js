import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CreateRecipe from '../components/Recipes/CreateRecipe';
import './RecipeList.css';

function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'https://sprint1-backend-u1ka.onrender.com';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRecipes();
  }, [search]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/recipes`, {
        headers: { Authorization: `Bearer ${token}` },
        params: search ? { search } : {},
      });
      
      if (Array.isArray(response.data)) {
        setRecipes(response.data);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Session expired. Please login again.');
      } else {
        alert('Unable to load recipes. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeCreated = () => {
    setShowCreate(false);
    fetchRecipes();
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Delete this recipe? This action cannot be undone.');
    if (!confirmDelete) return;
    
    try {
      await axios.delete(`${API_URL}/api/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipes(recipes.filter(r => r.id !== id));
    } catch (err) {
      alert('Unable to delete recipe. Please try again.');
    }
  };

  return (
    <div className="App-main">
      <div className="container">
        <div className="mb-4">
          <h1>My Recipes</h1>
          <button className="btn btn-success" onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? 'Cancel' : 'Create New Recipe'}
          </button>
        </div>

        {showCreate && <CreateRecipe onCreated={handleRecipeCreated} />}

        <div className="mb-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && <div className="alert alert-info">Loading...</div>}

        <div className="row">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="col-md-4 mb-4">
              <div className="card recipe-card">
                <div className="card-body">
                  <h5 className="card-title">{recipe.title}</h5>
                  <p className="card-text">{recipe.description}</p>
                  <p className="text-muted">
                    <small>Prep: {recipe.prep_time} min | Servings: {recipe.servings}</small>
                  </p>
                  <div className="btn-group w-100" role="group">
                    <Link to={`/recipes/${recipe.id}`} className="btn btn-primary">View</Link>
                    <button className="btn btn-danger" onClick={() => handleDelete(recipe.id)}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {recipes.length === 0 && !loading && (
          <div className="alert alert-info">No recipes found. Create one to get started!</div>
        )}
      </div>
    </div>
  );
}

export default RecipeList;
