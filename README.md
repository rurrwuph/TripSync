<div align="center">
  <img src="https://via.placeholder.com/150x150.png?text=TripSync+Logo" alt="TripSync Logo" width="100"/>
  <h1>🚌 TripSync: Modern Bus Travel Ecosystem</h1>
  <p><i>A high-performance, synchronized bus ticket booking platform designed for seamless travel management.</i></p>
</div>

---

## 📖 Brief Description
**TripSync** is a comprehensive, full-stack web application designed to bridge the gap between passengers and transport operators. By combining a visually stunning, glassmorphic React frontend with a robust, asynchronous FastAPI backend, TripSync offers a premium digital experience for discovering routes, selecting seats, processing payments, and managing refunds. 

The platform also includes advanced administrative features, automated E-Tickets, dynamic "mock" seat integration (simulating third-party external bookings like Shohoz), and an integrated AI chatbot for customer assistance.

---

## ✨ Key Features

### 🛒 Seamless Passenger Experience
*   **High-Contrast Interface:** A premium, modern design system built with Tailwind CSS, focused on clarity and conversion.
*   **Interactive Seat Selection:** Real-time bus cabin visualization with dynamic availability tracking, specific bus layouts (e.g., Hino 1J, Scania Multi-Axle), and 5-minute seat locking (`HELD` state).
*   **Smart Search:** Fast trip discovery based on destination, operator, and departure time.
*   **Automated E-Tickets:** Secure QR-based tickets generated as printable PDFs immediately upon payment.
*   **Reward System:** Integrated loyalty points (1,000 points per seat) that unlock future discounts.

### 🛡️ Secure & Flexible Payments
*   **Partial Cancellations:** Passengers can cancel specific seats within a booking, automatically calculating dynamic refund policies strictly based on departure proximity (e.g., 90% refund if >48 hours).
*   **Promo Codes:** Support for checkout discount codes.

### 📊 Operator & Admin Management
*   **Centralized Dashboard:** Advanced tools for administrators to manage fleets, routes, and approve/reject passenger refund requests.
*   **Financial Analytics:** Insightful monitoring of daily/monthly Gross Revenue, Net Revenue, and automated refund tracking.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite |
| **Styling & UI** | Tailwind CSS 4, Framer Motion (Animations), Lucide React (Icons) |
| **PDF Generation** | `react-to-print` (E-Tickets) |
| **Backend Framework** | Python 3.10+, FastAPI (Asynchronous) |
| **Database ORM** | SQLAlchemy (Async engine) |
| **Database** | PostgreSQL |

---

## 📂 Project Structure

```text
TripSync-1/
├── src/                        # React Frontend
│   ├── assets/                 # Global CSS (index.css), fonts, JSON mocks
│   ├── components/             # Reusable UI elements (Header, Footer, SeatMap, ETicket)
│   ├── pages/                  # Main views (Home, Checkout, Profile, search, AdminDashboard)
│   ├── services/               # API connection utilities (api.js)
│   ├── App.jsx                 # React Router configuration
│   └── main.jsx                # Application entry point
│
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/endpoints/      # Route controllers (admin.py, auth.py, bookings.py, static.py)
│   │   ├── core/               # App configuration and security (security.py, config.py)
│   │   ├── models/             # SQLAlchemy DB schemas (models.py)
│   │   ├── schemas/            # Pydantic validation models (schemas.py)
│   │   └── services/           # Business logic (booking_service.py, trip_service.py)
│   ├── database.py             # DB connection logic
│   ├── main.py                 # FastAPI application definition
│   └── seed_trips.py           # Development utility to populate DB with dummy data
│
├── package.json                # Node/React dependencies
└── requirements.txt            # Python/FastAPI dependencies
```

---

## ⚙️ Environment Variables

To run the project locally, you must configure environment variables for both the frontend and backend.

### Backend (`backend/.env`)
Create a `.env` file in the `/backend` directory:
```env
# Database connection string (PostgreSQL)
DATABASE_URL=postgresql+psycopg2://<username>:<password>@localhost:5432/tripsync

# JWT Authentication Config
SECRET_KEY="your-super-secret-long-jwt-signing-key"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440 # 24 Hours
```

### Frontend (`.env`)
Create a `.env` file in the root directory (where `package.json` is located):
```env
# URL where your FastAPI backend is running
VITE_API_URL=http://localhost:8000/api
```

---

## 🚀 Getting Started

Follow these steps to run the full application (Frontend + Backend) on your local machine.

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+)
*   [Python](https://www.python.org/) (v3.10+)
*   [PostgreSQL](https://www.postgresql.org/) running locally. Create an empty database named `tripsync` (or match whatever is in your `DATABASE_URL`).

### 1. Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   # Windows
   python -m venv .venv
   .venv\Scripts\activate

   # macOS/Linux
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your `.env` file as shown above.
5. Initialize the Database and insert dummy data:
   ```bash
   python seed_trips.py
   ```
6. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The backend will now be running at `http://localhost:8000`*

### 2. Frontend Setup (React)

Open a **new terminal tab/window** and stay in the root project directory (`TripSync-1/`).

1. Install Node modules:
   ```bash
   npm install
   ```
2. Configure your frontend `.env` with the `VITE_API_URL`.
3. Start the Vite development server:
   ```bash
   npm run dev -- --port 5173
   ```
   *The frontend will now be running at `http://localhost:5173`*

---

## 🦸 Default Test Accounts
If you seeded the database using `seed_trips.py`, you can test the application using the following credentials:

*   **Admin Dashboard:** `admin@tripsync.com` / `adminpassword`
*   **Passenger Account:** `user@example.com` / `password123`

---

<div align="center">
  <p>Built with ❤️ by the TripSync Team</p>
  <p><i>Revolutionizing the way the world moves.</i></p>
</div>
