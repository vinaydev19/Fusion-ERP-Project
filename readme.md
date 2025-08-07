# 🌐 Fusion ERP Web Application

**Fusion ERP** is a full-stack Enterprise Resource Planning (ERP) system designed for small to medium-sized businesses. It helps manage essential business processes including:

> 🛒 Sales • 📦 Purchases • 📊 Inventory • 💰 Finance • 🚚 Deliveries • 🧾 Invoicing • 🤝 Customer Relations • 👨‍💼 Employee Management

---

## 📁 Project Structure

```
vinaydev19-fusion-erp-project/
├── backend/        # Node.js/Express REST API
└── frontend/       # React.js (Vite) SPA
```

---

## 🚀 Features

### ✅ Backend (Node.js, Express, MongoDB)
- Full RESTful API (CRUD)
- JWT-based Authentication
- Role-Based Access Control
- File Uploads via Cloudinary
- Email Services: registration, verification, reset
- Modular MVC Architecture
- Prebuilt Modules:
  - 👤 User Management  
  - 📦 Product & Inventory  
  - 🛍️ Sales & Purchase Orders  
  - 👥 Customer & Delivery Tracking  
  - 🧾 Invoice Management  
  - 💵 Financial Transactions  
  - 🧑‍💼 Employee Records

### ✅ Frontend (React + Vite)
- Fully Responsive UI
- Role-Based Protected Routes
- State Management with Redux Toolkit
- Form Validation (React Hook Form / Custom)
- Real-time Data via Custom Hooks
- Components:
  - 📊 Dashboard
  - 📝 Forms
  - 📋 Tables
  - 📈 Charts
  - 🖼️ Landing Page (Marketing)
  - 🧩 UI Library (Buttons, Tabs, Dialogs)

---

## ⚙️ Tech Stack

### 🧠 Backend
- Node.js  
- Express.js  
- MongoDB + Mongoose  
- JWT + Bcrypt  
- Nodemailer  
- Cloudinary + Multer  
- dotenv

### 🎨 Frontend
- React.js + Vite  
- Redux Toolkit  
- React Router  
- Axios  
- Custom Hooks  
- ShadCN/UI (Style Component Library)

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/vinaydev19/fusion-erp-project.git
cd fusion-erp-project
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file with the following:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017
ACCESS_TOKEN_SECRET=your_jwt_access_secret
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
EMAIL_USER=your_email
EMAIL_PASS=your_password
CORS_ORIGIN=http://localhost:3000
```

Run the server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

---

## 📂 API Routes Overview

| Resource          | Base Route             |
|-------------------|------------------------|
| Users             | /api/v1/users          |
| Products          | /api/v1/products       |
| Sales             | /api/v1/sales          |
| Purchases         | /api/v1/purchases      |
| Financials        | /api/v1/financials     |
| Employees         | /api/v1/employees      |
| Deliveries        | /api/v1/deliveries     |
| Customers         | /api/v1/customers      |
| Invoices          | /api/v1/invoices       |

---

## 📄 License

This project is licensed under the ISC License.
