# 🚌 TripSync: Modern Bus Travel Ecosystem

TripSync is a high-performance, synchronized bus ticket booking platform designed for seamless travel management. It bridges the gap between passengers and transport operators through an intelligent, secure, and visually stunning digital experience.

---

## ✨ Key Features

### 🛒 Seamless Booking
- **High-Contrast Interface**: A premium, glassmorphic design system focused on clarity and conversion.
- **Realistic Seat Selection**: Interactive bus cabin visualization with live availability tracking.
- **Smart Search**: Fast, filtered trip discovery based on destination, operator, and departure time.

### 🤖 Intelligent Assistance
- **AI-Powered Chatbot**: 24/7 automated support to guide passengers through the booking process.
- **Real-time Notifications**: Instant updates on booking status and trip schedules.

### 🔐 Security & Reliability
- **Verified Operators**: Only certified transport providers are onboarded to ensure passenger safety.
- **Secure Payments**: Encrypted transaction processing (PCI-DSS compliant approach).
- **Automated E-Tickets**: Secure QR-based tickets sent directly via email upon successful payment.

### 📊 Operator Management
- **Centralized Dashboard**: Advanced tools for operators to manage fleets, trips, and refund requests.
- **Data Analytics**: Insightful visualizations of sales trends and seat occupancy.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS 4, Framer Motion, Lucide React, Recharts |
| **Backend** | Python, FastAPI, SQLAlchemy (PostgreSQL) |
| **Infrastructure** | EmailJS (Communication), Axios (API Connectivity) |
| **Tooling** | ESLint, Git |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.10+)
- [PostgreSQL](https://www.postgresql.org/) (Local or Cloud instance)

### Frontend Setup
1. Navigate to the project directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the `backend` directory.
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

---

## 📂 Project Architecture

```text
TripSync/
├── src/                # React Frontend
│   ├── components/     # Reusable UI elements (Header, Footer, SeatMap)
│   ├── pages/          # Main application views (Home, Checkout, SeatSelection)
│   ├── services/       # API abstraction layer
│   └── assets/         # Global styles and branding
├── backend/            # FastAPI Backend
│   ├── app/            # Core application logic
│   │   ├── api/        # Endpoint definitions (Tickets, Refunds, Users)
│   │   └── models/     # Database schema definitions
│   └── seed_trips.py   # Development data provisioning
└── public/             # Static assets
```

---

## 🛡️ License
Distributed under the ISC License. See `LICENSE` for more information.

---

<div align="center">
  <p>Built with ❤️ by the TripSync Team</p>
  <p><i>Revolutionizing the way the world moves.</i></p>
</div>
