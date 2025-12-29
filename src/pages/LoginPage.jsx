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

    setTimeout(() => {
      const users = accounts.users || [];
      const admins = accounts.admins || [];

        const admin = admins.find(a => a.email === email && a.password === password);
      if (admin) {
        setError('');
        localStorage.setItem('currentUser', JSON.stringify({ ...admin, role: 'admin' }));
        
        navigate("/profile"); 
        return;
      }

      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        setError('');
        localStorage.setItem('currentUser', JSON.stringify({ ...user, role: 'user' }));
        
        navigate("/profile");
        setLoading(false);
        return;
      }

      console.log('Logging in with:', { email, password });
      setError("Invalid email or password");
      setLoading(false);

    },500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col ">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-3 px-6 shadow-xl">
        <Link to="/" className="text-2xl font-bold text-black hover:text-gray-700">TripSync</Link>
      </header>

      {/* Login Form */}
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full">
          <h2 className="text-3xl font-bold text-center mb-8">Login to TripSync</h2>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black"
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
              />
            </div>

            <button type="submit" className="w-full py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition">
              Login
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