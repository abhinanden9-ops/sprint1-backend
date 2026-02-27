-- QuickCook Database Schema
-- Run this script once against your PostgreSQL database to set up all tables

-- Users table: stores registered user accounts with hashed passwords
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  username    VARCHAR(100) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipes table: stores recipes created by users
CREATE TABLE IF NOT EXISTS recipes (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  instructions TEXT,
  prep_time    INTEGER,   -- in minutes
  servings     INTEGER,
  category     VARCHAR(100),
  image_url    VARCHAR(500),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ingredients table: stores ingredient details for each recipe
CREATE TABLE IF NOT EXISTS ingredients (
  id        SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name      VARCHAR(255) NOT NULL,
  quantity  VARCHAR(100),
  unit      VARCHAR(50)
);
