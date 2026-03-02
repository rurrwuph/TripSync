# 🚌 TripSync: Smart Transport Management System

TripSync is a high-performance, web-based ecosystem designed to bridge the gap between commuters and transport operators. By replacing fragmented manual booking processes with a centralized digital hub, TripSync streamlines seat reservations, schedule management, and real-time fleet coordination.

## 🚀 Key Features
* **Interactive Seat Mapping:** Visual grid for real-time selection of available, reserved, or selected seats.
* **Automated Ticketing:** Instant generation of E-tickets featuring QR codes for rapid boarding verification.
* **Operator Dashboard:** Comprehensive suite for fleet scheduling, revenue analytics, and refund processing.
* **Smart Search Engine:** Multi-parameter filtering by route, date, operator, and availability.
* **AI-Driven Support:** Integrated chatbot assistant to guide users through the booking flow.

## 🛠️ Tech Stack
| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion, Recharts |
| **Backend** | Python, FastAPI, SQLAlchemy ORM |
| **Database** | PostgreSQL |
| **Infrastructure** | Axios, EmailJS, RESTful API Architecture |

## 🏗️ System Architecture
The platform utilizes a modular, layered architecture to ensure scalability:
1.  **UI Layer:** Responsive interfaces built with reusable React components.
2.  **Logic Layer:** FastAPI-driven business rules and booking validation.
3.  **Data Layer:** Persistent storage with PostgreSQL and structured relational modeling.



## 🔧 Quick Start
### Frontend
```bash
cd TripSync
npm install
npm run dev