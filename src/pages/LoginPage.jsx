import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import accounts from "../assets/accounts.json";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      // 1. Prepare inputs (normalize email to lowercase for consistency)
      const inputEmail = email.trim().toLowerCase();
      const inputPassword = password;

      // ---------------------------------------------------------
      // CHECK 1: JSON ADMINS
      // ---------------------------------------------------------
      const jsonAdmins = accounts.admins || [];
      const foundAdmin = jsonAdmins.find(
        (a) => a.email.toLowerCase() === inputEmail && a.password === inputPassword
      );

      if (foundAdmin) {
        localStorage.setItem('currentUser', JSON.stringify({ ...foundAdmin, role: 'admin' }));
        navigate("/admin");
        return;
      }

      // ---------------------------------------------------------
      // CHECK 2: JSON USERS
      // ---------------------------------------------------------
      const jsonUsers = accounts.users || [];
      const foundJsonUser = jsonUsers.find(
        (u) => u.email.toLowerCase() === inputEmail && u.password === inputPassword
      );

      if (foundJsonUser) {
        localStorage.setItem('currentUser', JSON.stringify({ ...foundJsonUser, role: 'user' }));
        navigate("/profile");
        return;
      }

      // ---------------------------------------------------------
      // CHECK 3: LOCAL STORAGE USERS (Registered via App)
      // ---------------------------------------------------------
      const localUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const foundLocalUser = localUsers.find(
        (u) => (u.email || "").toLowerCase() === inputEmail && u.password === inputPassword
      );

      if (foundLocalUser) {
        // The register page already saves the 'role' inside the user object,
        // but we default to 'user' just in case.
        localStorage.setItem('currentUser', JSON.stringify({ role: 'user', ...foundLocalUser }));
        navigate("/profile");
        return;
      }

      // ---------------------------------------------------------
      // NO MATCH FOUND
      // ---------------------------------------------------------
      console.log('Login failed for:', inputEmail);
      setError("Invalid email or password");
      setLoading(false);

    }, 500); // Simulated network delay
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-3 px-6 shadow-xl">
        <Link to="/" className="text-2xl font-bold text-black hover:text-gray-700">TripSync</Link>
      </header>

      {/* Login Form */}
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full">
          <h2 className="text-3xl font-bold text-center mb-8">Login to TripSync</h2>

          {error && <p className="text-red-500 text-center mb-4 font-medium">{error}</p>}

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black"
                placeholder="Enter your email"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-500">
            Don't have an account? <Link to="/register" className="text-black font-semibold hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}