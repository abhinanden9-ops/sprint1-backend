import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import IngredientList from '../components/Ingredients/IngredientList';

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  const API_URL = process.env.REACT_APP_API_URL || 'https://sprint1-backend-u1ka.onrender.com';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data) {
        setRecipe(response.data);
        setFormData(response.data);
      }
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 404) {
        alert('Recipe not found');
      } else {
        alert('Unable to load recipe. Please try again.');
      }
      navigate('/');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!formData.title || formData.title.trim() === '') {
      alert('Recipe title is required');
      return;
    }

    try {
      await axios.put(`${API_URL}/api/recipes/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipe(formData);
      setEditMode(false);
      alert('Recipe updated successfully!');
    } catch (err) {
      alert('Failed to update recipe. Please check your input and try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  if (loading) return <div className="alert alert-info">Loading...</div>;
  if (!recipe) return <div className="alert alert-danger">Recipe not found</div>;

  return (
    <div className="App-main">
      <div className="container">
        <button className="btn btn-secondary mb-3" onClick={() => navigate('/')}>Back</button>

        {editMode ? (
          <form onSubmit={handleUpdate} className="card p-4 mb-4">
            <h2>Edit Recipe</h2>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Instructions</label>
              <textarea
                className="form-control"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Prep Time (minutes)</label>
              <input
                type="number"
                className="form-control"
                name="prep_time"
                value={formData.prep_time}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Servings</label>
              <input
                type="number"
                className="form-control"
                name="servings"
                value={formData.servings}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-control"
                name="category"
                value={formData.category}
                onChange={handleChange}
              />
            </div>
            <div className="btn-group w-100" role="group">
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setEditMode(false); setFormData(recipe); }}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className="card mb-4">
            <div className="card-body">
              <h1>{recipe.title}</h1>
              <p>{recipe.description}</p>
              <div className="mb-3">
                <strong>Instructions:</strong>
                <p>{recipe.instructions}</p>
              </div>
              <div className="row mb-3">
                <div className="col-md-4">
                  <strong>Prep Time:</strong> {recipe.prep_time} minutes
                </div>
                <div className="col-md-4">
                  <strong>Servings:</strong> {recipe.servings}
                </div>
                <div className="col-md-4">
                  <strong>Category:</strong> {recipe.category}
                </div>
              </div>
              <button className="btn btn-warning" onClick={() => setEditMode(true)}>Edit</button>
            </div>
          </div>
        )}

        <IngredientList recipeId={id} />
      </div>
    </div>
  );
}

export default RecipeDetail;
