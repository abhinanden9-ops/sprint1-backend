import React, { useState, useEffect } from 'react';
import axios from 'axios';

function IngredientList({ recipeId }) {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [editingId, setEditingId]     = useState(null);
  const [editData, setEditData]       = useState({ name: '', quantity: '', unit: '' });
  const [newIngredient, setNewIngredient] = useState({ name: '', quantity: '', unit: '' });

  const API_URL = process.env.REACT_APP_API_URL || 'https://sprint1-backend-u1ka.onrender.com';
  const token   = localStorage.getItem('token');

  useEffect(() => { fetchIngredients(); }, [recipeId]);

  const fetchIngredients = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/api/ingredients/recipe/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data)) setIngredients(response.data);
    } catch (err) {
      if (err.response?.status !== 404) setError('Unable to load ingredients. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    if (!newIngredient.name.trim()) { setError('Ingredient name is required.'); return; }
    if (newIngredient.quantity && isNaN(parseFloat(newIngredient.quantity))) {
      setError('Quantity must be a valid number.'); return;
    }
    try {
      const response = await axios.post(
        `${API_URL}/api/ingredients`,
        { recipe_id: recipeId, name: newIngredient.name.trim(),
          quantity: newIngredient.quantity || null, unit: newIngredient.unit || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIngredients([...ingredients, response.data]);
      setNewIngredient({ name: '', quantity: '', unit: '' });
    } catch {
      setError('Failed to add ingredient. Please try again.');
    }
  };

  const startEdit = (ing) => {
    setEditingId(ing.id);
    setEditData({ name: ing.name, quantity: ing.quantity ?? '', unit: ing.unit ?? '' });
  };

  const cancelEdit = () => { setEditingId(null); setEditData({ name: '', quantity: '', unit: '' }); };

  const handleUpdate = async (id) => {
    setError('');
    if (!editData.name.trim()) { setError('Ingredient name cannot be empty.'); return; }
    if (editData.quantity && isNaN(parseFloat(editData.quantity))) {
      setError('Quantity must be a valid number.'); return;
    }
    try {
      const response = await axios.put(
        `${API_URL}/api/ingredients/${id}`,
        { name: editData.name.trim(), quantity: editData.quantity || null, unit: editData.unit || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIngredients(ingredients.map((ing) => (ing.id === id ? response.data : ing)));
      cancelEdit();
    } catch {
      setError('Failed to update ingredient. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this ingredient?')) return;
    try {
      await axios.delete(`${API_URL}/api/ingredients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIngredients(ingredients.filter((ing) => ing.id !== id));
    } catch {
      setError('Failed to delete ingredient. Please try again.');
    }
  };

  return (
    <div className="card p-4">
      <h4 className="mb-4" style={{ fontWeight: 700 }}>Ingredients</h4>

      {error && (
        <div className="alert alert-danger alert-dismissible mb-3">
          {error}
          <button className="btn-close" onClick={() => setError('')} />
        </div>
      )}

      <form onSubmit={handleAdd} className="mb-4">
        <div className="row g-2 align-items-end">
          <div className="col-md-5">
            <label className="form-label">Name *</label>
            <input type="text" className="form-control" placeholder="e.g. Flour"
              value={newIngredient.name}
              onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })} />
          </div>
          <div className="col-md-3">
            <label className="form-label">Quantity</label>
            <input type="text" className="form-control" placeholder="e.g. 2"
              value={newIngredient.quantity}
              onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })} />
          </div>
          <div className="col-md-2">
            <label className="form-label">Unit</label>
            <input type="text" className="form-control" placeholder="cups"
              value={newIngredient.unit}
              onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })} />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary w-100">Add</button>
          </div>
        </div>
      </form>

      {loading && <div className="alert alert-info">Loading…</div>}

      {ingredients.length > 0 && (
        <ul className="list-group list-group-flush" style={{ gap: 8, display: 'flex', flexDirection: 'column' }}>
          {ingredients.map((ing) =>
            editingId === ing.id ? (
              <li key={ing.id} className="list-group-item" style={{ borderRadius: 'var(--radius-sm)' }}>
                <div className="row g-2 align-items-center">
                  <div className="col-md-5">
                    <input type="text" className="form-control form-control-sm" value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                  </div>
                  <div className="col-md-2">
                    <input type="text" className="form-control form-control-sm" value={editData.quantity}
                      onChange={(e) => setEditData({ ...editData, quantity: e.target.value })} />
                  </div>
                  <div className="col-md-2">
                    <input type="text" className="form-control form-control-sm" value={editData.unit}
                      onChange={(e) => setEditData({ ...editData, unit: e.target.value })} />
                  </div>
                  <div className="col-md-3 d-flex gap-1">
                    <button className="btn btn-sm btn-success" onClick={() => handleUpdate(ing.id)}>Save</button>
                    <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              </li>
            ) : (
              <li key={ing.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span style={{ fontWeight: 500, color: 'var(--text-dark)' }}>
                  {[ing.quantity, ing.unit, ing.name].filter(Boolean).join(' ')}
                </span>
                <div className="d-flex gap-1">
                  <button className="btn btn-sm btn-warning" onClick={() => startEdit(ing)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(ing.id)}>Delete</button>
                </div>
              </li>
            )
          )}
        </ul>
      )}

      {!loading && ingredients.length === 0 && (
        <div className="alert alert-info mt-2">No ingredients added yet. Use the form above.</div>
      )}
    </div>
  );
}

export default IngredientList;
