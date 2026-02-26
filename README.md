# 📊 LeaveSync – Employee Leave & Reimbursement Management System

A full-stack MERN application for managing employee leave requests and reimbursement claims with role-based access control.

---

## 🚀 Features

### 👤 Authentication & Roles
- JWT-based login & registration
- **First registered user** is automatically assigned **Admin** role
- All subsequent users are assigned **Employee** role by default
- Admin can promote users to **Manager** or **Admin**

### 👥 Role-Based Dashboards
| Role | Dashboard |
|------|-----------|
| Employee | Personal leave/reimbursement overview + balance |
| Manager | Approval queues for leaves and reimbursements |
| Admin | Full user management (CRUD + role assignment) |

### 🏖️ Leave Management
- Apply for Casual, Sick, or Annual leave
- Auto-calculates working days (excludes weekends)
- Manager/Admin can approve or reject with notes
- Leave balance is deducted only on approval
- Employee can cancel pending requests

### 💰 Reimbursement Management
- Submit claims with Amount, Category, Description
- Categories: Travel, Food, Accommodation, Equipment, Medical, Other
- Manager/Admin can approve or reject with notes
- Employee can cancel pending claims

### 🛡️ Security
- Passwords hashed with bcryptjs
- JWT tokens stored in localStorage
- Protected routes (frontend + backend)
- Role-based middleware on all sensitive endpoints

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, React Router v6, Context API |
| Styling | Pure CSS3 (modular: global, layout, dashboard, forms) |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT (jsonwebtoken) |
| Password | bcryptjs |

---

## 📁 Project Structure

```
employee-leave-mgmt/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── leaveController.js
│   │   ├── reimbursementController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification
│   │   └── roleMiddleware.js     # Role-based access
│   ├── models/
│   │   ├── User.js
│   │   ├── Leave.js
│   │   └── Reimbursement.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── leaveRoutes.js
│   │   ├── reimbursementRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/generateToken.js
│   ├── .env
│   └── server.js
│
└── frontend/
    ├── public/index.html
    └── src/
        ├── assets/styles/
        │   ├── global.css
        │   ├── layout.css
        │   ├── dashboard.css
        │   └── forms.css
        ├── app/
        │   ├── App.js
        │   ├── routes.js
        │   └── context/AuthContext.js
        ├── pages/
        │   ├── Login.js
        │   ├── Register.js
        │   ├── dashboards/
        │   │   ├── EmployeeDashboard.js
        │   │   ├── ManagerDashboard.js
        │   │   └── AdminDashboard.js
        │   ├── leaves/
        │   │   ├── ApplyLeave.js
        │   │   ├── LeaveStatus.js
        │   │   └── LeaveApprovals.js
        │   └── reimbursements/
        │       ├── ApplyReimbursement.js
        │       ├── ReimbursementStatus.js
        │       └── ReimbursementApprovals.js
        ├── components/
        │   ├── Layout.js
        │   ├── Sidebar.js
        │   ├── Navbar.js
        │   └── ProtectedRoute.js
        └── services/api.js
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd employee-leave-mgmt
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/employee_leave_mgmt
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
```

Start the backend:
```bash
npm run dev     # Development (nodemon)
npm start       # Production
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm start
```

The app will run at `http://localhost:3000` and proxy API calls to `http://localhost:5000`.

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Private |

### Leaves
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/leaves | Employee+ |
| GET | /api/leaves | Private |
| PUT | /api/leaves/:id/review | Manager/Admin |
| DELETE | /api/leaves/:id | Employee (own) |

### Reimbursements
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/reimbursements | Employee+ |
| GET | /api/reimbursements | Private |
| PUT | /api/reimbursements/:id/review | Manager/Admin |
| DELETE | /api/reimbursements/:id | Employee (own) |

### Admin
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/admin/users | Admin |
| PUT | /api/admin/users/:id/role | Admin |
| PUT | /api/admin/users/:id/department | Admin |
| DELETE | /api/admin/users/:id | Admin |

---

## 🎨 Design System

- **Color Palette**: Blue (#2563eb) primary, Purple accent, semantic success/warning/danger
- **Typography**: Inter font (Google Fonts)
- **Responsive**: Mobile-first, sidebar collapses on ≤900px
- **CSS Architecture**: 4 modular files (global, layout, dashboard, forms)

---

## 🔒 Role Logic

1. **First user** to register → automatically gets `admin` role
2. All subsequent registrations → `employee` role
3. **Only admins** can change user roles via the Admin Panel
4. Role-based route protection on both frontend and backend

## 📝 Leave Balance (Default)
| Type | Days |
|------|------|
| Casual | 10 |
| Sick | 10 |
| Annual | 15 |

Balance is deducted only when a leave is **approved**.
