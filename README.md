# 🥦 GroceryAI — Ingredient-Based Grocery eCommerce with AI Cooking Assistant

A production-grade full-stack web application that lets users enter ingredients, get AI-generated recipes, auto-add missing items to cart, and interact with an AI cooking chatbot.

---

## 🌐 Live Demo

| Portal | URL |
|--------|-----|
| User Store | https://groceryai-rho.vercel.app |
| Admin Panel | https://groceryai-rho.vercel.app/admin |
| Delivery Dashboard | https://groceryai-rho.vercel.app/delivery |
| Backend API | https://groceryai-iehq.onrender.com |

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `aman123@groceryai.com` | `aman123` |
| Delivery | `delivery123@groceryai.com` | `delivery123` |
| User | Register at `/register` | — |

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Tailwind CSS, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| AI | OpenAI GPT-3.5 / GPT-4 Vision |
| Payments | Stripe |
| Auth | JWT |

---

## 📂 Project Structure

```
├── client/                  # React frontend
│   └── src/
│       ├── components/
│       │   ├── layout/      # Navbar, Footer
│       │   ├── ui/          # ProductCard, RecipeCard, Chatbot, Spinner
│       │   └── admin/       # Admin panel components
│       ├── context/         # AuthContext, CartContext, ThemeContext
│       ├── pages/           # All page components
│       └── services/        # Axios API instance
│
└── server/                  # Express backend
    ├── controllers/         # Business logic
    ├── middleware/          # Auth, validation
    ├── models/              # Mongoose schemas
    ├── routes/              # API routes
    └── services/            # OpenAI, Stripe integrations
```

---

## ⚙️ Setup & Installation

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

**Server** — copy `server/.env.example` to `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/grocery-ai
JWT_SECRET=your_super_secret_key
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

**Client** — copy `client/.env.example` to `client/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm start
```

App runs at: http://localhost:3000  
API runs at: http://localhost:5000

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (search, filter, paginate) |
| GET | `/api/products/:id` | Get product |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |
| POST | `/api/products/:id/reviews` | Add review |

### Recipes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recipes` | List recipes |
| POST | `/api/recipes/generate` | AI recipe generation |
| POST | `/api/recipes` | Create recipe (admin) |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get cart |
| POST | `/api/cart/add` | Add item |
| POST | `/api/cart/add-missing` | Auto-add missing ingredients |
| PUT | `/api/cart/:productId` | Update quantity |
| DELETE | `/api/cart/clear` | Clear cart |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place order |
| POST | `/api/orders/payment-intent` | Create Stripe payment intent |
| PUT | `/api/orders/:id/pay` | Confirm payment |
| GET | `/api/orders/my-orders` | User's orders |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | AI chatbot message |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/analyze-ingredients` | Image ingredient detection |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Stats + analytics |
| GET | `/api/admin/orders` | All orders |
| PUT | `/api/admin/orders/:id/status` | Update order status |
| GET | `/api/admin/users` | All users |

---

## 🎯 Features

- ✅ JWT Authentication (Register/Login)
- ✅ AI Recipe Generation from ingredients (OpenAI)
- ✅ Image-based ingredient detection (GPT-4 Vision)
- ✅ Voice input for ingredients and chatbot
- ✅ Smart cart with auto-add missing ingredients
- ✅ Stripe payment integration
- ✅ Order tracking with status timeline
- ✅ Weekly meal planner
- ✅ Nutrition dashboard with charts
- ✅ AI chatbot floating widget
- ✅ Admin panel (products, orders, users, recipes)
- ✅ Dark/Light mode toggle
- ✅ Product reviews & ratings
- ✅ Responsive design (mobile-first)

---

## 🚀 Deployment

### Frontend — Vercel
- Live: https://groceryai-rho.vercel.app
- Root Directory: `client`, Build: `npm run build`, Output: `build`
- Env var: `REACT_APP_API_URL=https://groceryai-iehq.onrender.com/api`

### Backend — Render
- Live: https://groceryai-iehq.onrender.com
- Root Directory: `server`, Start: `node index.js`
- Set all env vars from `server/.env.example` in Render dashboard

---

## 🔐 Creating Admin User

After registering, update the user role in MongoDB:
```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

---

## 📝 License

MIT
