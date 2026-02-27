# QuickCook API — Sprint 1 Backend

A RESTful API for the QuickCook recipe management application. Built with Node.js, Express, and PostgreSQL with JWT-based authentication.

## Live URL
**https://sprint1-backend-u1ka.onrender.com**

---

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** PostgreSQL (hosted on Render)
- **Authentication:** JSON Web Tokens (JWT)
- **Password Hashing:** bcryptjs
- **Environment:** dotenv

---

## Project Structure
```
sprint1-backend/
├── server.js                          # Entry point
├── db.js                              # PostgreSQL connection pool
├── init.sql                           # Database schema
├── QuickCook_API.postman_collection.json
├── middleware/
│   └── auth.js                        # JWT verification middleware
├── controllers/
│   ├── authController.js
│   ├── recipeController.js
│   └── ingredientController.js
└── routes/
    ├── auth.js
    ├── recipes.js
    └── ingredients.js
```

---

## Database Schema

**users** — stores registered accounts with hashed passwords
**recipes** — stores recipes linked to a user (FK: user_id)
**ingredients** — stores ingredients linked to a recipe (FK: recipe_id)

---

## API Endpoints

### Authentication (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |

### Recipes (Protected — requires Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recipes` | Get all recipes (supports `?search=` and `?category=`) |
| GET | `/api/recipes/:id` | Get single recipe with ingredients |
| POST | `/api/recipes` | Create recipe (with optional ingredients array) |
| PUT | `/api/recipes/:id` | Update a recipe |
| DELETE | `/api/recipes/:id` | Delete a recipe (cascades to ingredients) |

### Ingredients (Protected — requires Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ingredients/recipe/:recipeId` | Get all ingredients for a recipe |
| POST | `/api/ingredients` | Add an ingredient to a recipe |
| PUT | `/api/ingredients/:id` | Update an ingredient |
| DELETE | `/api/ingredients/:id` | Delete an ingredient |

---

## Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/abhinanden9-ops/sprint1-backend.git
cd sprint1-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory:
```
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
PORT=5000
```

### 4. Initialize the database
Run `init.sql` against your PostgreSQL database to create the tables:
```bash
psql "your_DATABASE_URL" -f init.sql
```

### 5. Start the server
```bash
npm start
```

---

## Authentication

All recipe and ingredient routes are protected. To access them:

1. Register or login to receive a JWT token
2. Include the token in the `Authorization` header:
```
Authorization: Bearer <your_token>
```

---

## Documentation

A full Postman collection is included: `QuickCook_API.postman_collection.json`

Import it into Postman to test all 11 endpoints. The collection uses dynamic variables (`{{token}}`, `{{recipe_id}}`, `{{ingredient_id}}`) that are automatically set as you run requests in order.
