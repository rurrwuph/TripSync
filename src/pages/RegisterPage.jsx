import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  // popup state
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState("exists"); // exists | success | error
  const [popupMessage, setPopupMessage] = useState("");

  const showErrorPopup = (message) => {
    setPopupType("error");
    setPopupMessage(message);
    setShowPopup(true);
  };

  const handleRegister = (e) => {
    e.preventDefault();

    // Empty field checks
    if (!fullname.trim()) {
      showErrorPopup("Full name can't be empty.");
      return;
    }
    if (!email.trim()) {
      showErrorPopup("Email can't be empty.");
      return;
    }
    if (!phone.trim()) {
      showErrorPopup("Phone number can't be empty.");
      return;
    }
    if (!password) {
      showErrorPopup("Password can't be empty.");
      return;
    }
    if (!confirmPassword) {
      showErrorPopup("Confirm password can't be empty.");
      return;
    }

    // Phone number validation (exactly 11 digits)
    if (!/^\d{11}$/.test(phone)) {
      showErrorPopup("Invalid phone number.");
      return;
    }

    // Password length validation
    if (password.length < 8) {
      showErrorPopup("Password must be at least 8 characters long.");
      return;
    }

    // Password match
    if (password !== confirmPassword) {
      showErrorPopup("Passwords do not match.");
      return;
    }

    const cleanedEmail = email.trim().toLowerCase();

    // Get existing users
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Check if user already exists
    const existingUser = users.find(
      (u) => (u.email || "").toLowerCase() === cleanedEmail
    );

    if (existingUser) {
      setPopupType("exists");
      setShowPopup(true);
      return;
    }

    // Create new user
    const newUser = {
      fullname: fullname.trim(),
      email: cleanedEmail,
      phone,
      password,
      role: "user",
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(newUser));

    // Success popup
    setPopupType("success");
    setShowPopup(true);
  };

  const closePopup = () => setShowPopup(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-3 px-6 shadow-xl">
        <Link to="/" className="text-2xl font-bold text-black hover:text-gray-700">
          TripSync
        </Link>
      </header>

      {/* Register Form */}
      <div className="flex-grow flex items-center justify-center mt-10">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full">
          <h2 className="text-3xl font-bold text-center mb-8">
            Register for TripSync
          </h2>

          <form onSubmit={handleRegister} className="flex flex-col gap-6">
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Full Name</label>
              <input
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-medium">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-medium">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition"
            >
              Register
            </button>
          </form>

          <p className="mt-6 text-center text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-black font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center pointer-events-auto">
            {popupType === "exists" ? (
              <>
                <h3 className="text-xl font-bold mb-4">Account Already Exists</h3>
                <p className="text-gray-600 mb-6">
                  An account with this email already exists. Please login instead.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={closePopup}
                    className="px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => {
                      closePopup();
                      navigate("/login");
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
                  >
                    Go to Login
                  </button>
                </div>
              </>
            ) : popupType === "success" ? (
              <>
                <h3 className="text-xl font-bold mb-4">Registration Successful</h3>
                <p className="text-gray-600 mb-6">
                  Your account has been created successfully.
                </p>
                <button
                  onClick={() => {
                    closePopup();
                    navigate("/");
                  }}
                  className="px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition"
                >
                  Back to Home Page
                </button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-4">Registration Error</h3>
                <p className="text-gray-600 mb-6">{popupMessage}</p>
                <button
                  onClick={closePopup}
                  className="px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition"
                >
                  OK
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
