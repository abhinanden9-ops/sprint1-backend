import React, { useState, useEffect } from 'react';
import axios from 'axios';

function IngredientList({ recipeId }) {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: '',
    unit: '',
  });

  const API_URL = process.env.REACT_APP_API_URL || 'https://sprint1-backend-u1ka.onrender.com';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchIngredients();
  }, [recipeId]);

  const fetchIngredients = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/ingredients/recipe/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (Array.isArray(response.data)) {
        setIngredients(response.data);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        alert('Unable to load ingredients');
      }
    }
  };

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    
    if (!newIngredient.name || newIngredient.name.trim() === '') {
      alert('Please enter an ingredient name');
      return;
    }

    if (newIngredient.quantity && isNaN(parseFloat(newIngredient.quantity))) {
      alert('Quantity must be a valid number');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/ingredients`,
        { 
          recipe_id: recipeId, 
          name: newIngredient.name.trim(),
          quantity: newIngredient.quantity || null,
          unit: newIngredient.unit || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewIngredient({ name: '', quantity: '', unit: '' });
      fetchIngredients();
    } catch (err) {
      alert('Failed to add ingredient. Please try again.');
    }
  };

  const handleDeleteIngredient = async (ingredientId) => {
    const confirmed = window.confirm('Remove this ingredient from the recipe?');
    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/api/ingredients/${ingredientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIngredients(ingredients.filter(ing => ing.id !== ingredientId));
    } catch (err) {
      alert('Failed to delete ingredient. Please try again.');
    }
  };

  return (
    <div className="card p-4">
      <h2>Ingredients</h2>
      <form onSubmit={handleAddIngredient} className="mb-4">
        <div className="row">
          <div className="col-md-5 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Ingredient name"
              value={newIngredient.name}
              onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Quantity"
              value={newIngredient.quantity}
              onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
            />
          </div>
          <div className="col-md-2 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Unit"
              value={newIngredient.unit}
              onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
            />
          </div>
          <div className="col-md-2 mb-2">
            <button type="submit" className="btn btn-primary w-100">Add</button>
          </div>
        </div>
      </form>

      <ul className="list-group">
        {ingredients.map((ingredient) => (
          <li key={ingredient.id} className="list-group-item d-flex justify-content-between align-items-center">
            <span>
              {ingredient.quantity} {ingredient.unit} {ingredient.name}
            </span>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleDeleteIngredient(ingredient.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {ingredients.length === 0 && (
        <div className="alert alert-info">No ingredients added yet.</div>
      )}
    </div>
  );
}

export default IngredientList;
