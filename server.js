const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const ingredientRoutes = require('./routes/ingredients');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check — confirms the API is running
app.get('/', (req, res) => {
  res.status(200).json({ message: 'QuickCook API is running.' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/ingredients', ingredientRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`QuickCook API running on port ${PORT}`);
});
