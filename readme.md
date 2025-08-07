# Fusion ERP Web Application

Fusion ERP is a full-stack Enterprise Resource Planning (ERP) system designed for small to medium-sized businesses to efficiently manage core business processes including sales, purchases, inventory, finance, deliveries, invoicing, customer relations, and employee management.

## 📦 Project Structure

vinaydev19-fusion-erp-project/
├── backend/        # Node.js/Express REST API
└── frontend/       # React.js (Vite) SPA

## 🚀 Features

### ✅ Backend (Node.js, Express, MongoDB)
- RESTful API with full CRUD support  
- Authentication (JWT-based)  
- Role-based access control  
- File upload (Cloudinary integration)  
- Email services (registration, verification, password reset)  
- Modular MVC architecture  
- Prebuilt modules:  
  - User management  
  - Product and inventory management  
  - Sales and purchase orders  
  - Customer and delivery tracking  
  - Invoice management  
  - Financial transactions  
  - Employee records  

### ✅ Frontend (React + Vite)
- Responsive UI built with reusable components  
- Dashboard with role-based protected routes  
- Form validation and state management (Redux)  
- Live data fetch via custom hooks  
- Components:  
  - Dashboard, Forms, Tables, Charts  
  - Landing page (Marketing sections)  
  - UI Library (Buttons, Tabs, Dialogs, etc.)

## 🛠️ Technologies Used

### Backend:
- Node.js  
- Express.js  
- MongoDB & Mongoose  
- JWT & Bcrypt  
- Nodemailer  
- Cloudinary  
- Multer  
- dotenv  

### Frontend:
- React.js (with Vite)  
- Redux Toolkit  
- React Router  
- Axios  
- Custom hooks  
- ShadCN/UI style component library

## ⚙️ Setup Instructions

### 1. Clone the Repository
git clone https://github.com/vinaydev19/fusion-erp-project.git
cd fusion-erp-project

### 2. Backend Setup
cd backend
npm install

Create a `.env` file with the following:
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

Run the server:
npm run dev

### 3. Frontend Setup
cd ../frontend
npm install
npm run dev

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

## 📄 License

This project is licensed under the ISC License.
