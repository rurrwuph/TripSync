import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("currentUser"));
    if (loggedInUser) setUser(loggedInUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    setMenuOpen(false);
    setMobileMenu(false);
    navigate("/");
  };

  const handleSwitchAccount = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    setMenuOpen(false);
    setMobileMenu(false);
    navigate("/login");
  };

  const NavLinks = () => (
    <>
      {["/", "/explore", "/about", "/contact", "/profile"].map((path, i) => {
        const names = ["Home", "Explore", "About", "Contact", "Profile"];
        return (
          <Link
            key={path}
            to={path}
            onClick={() => setMobileMenu(false)}
            className="block py-2 hover:text-black"
          >
            {names[i]}
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-black tracking-tight hover:text-gray-700"
        >
          TripSync
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-8 text-lg font-medium">
          <NavLinks />
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <>
              <Link
                to="/login"
                className="px-5 py-2 rounded-full border hover:border-black"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 rounded-full bg-black text-white hover:bg-gray-800"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center"
              >
                {user.fullname?.[0]?.toUpperCase() || "U"}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                  <button
                    onClick={() => navigate("/profile")}
                    className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={handleSwitchAccount}
                    className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                  >
                    Switch Account
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 hover:bg-gray-100 w-full text-left text-red-500"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-3xl"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="md:hidden bg-white border-t px-6 py-4 space-y-4">
          <NavLinks />

          {!user ? (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenu(false)}
                className="block py-2"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenu(false)}
                className="block py-2 font-semibold"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/profile")}
                className="block py-2 w-full text-left"
              >
                View Profile
              </button>
              <button
                onClick={(handleSwitchAccount)}
                className="block py-2 w-full text-left"
              >
                Switch Account
              </button>
              <button
                onClick={handleLogout}
                className="block py-2 w-full text-left text-red-500"
              >
                Log Out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
