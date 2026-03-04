import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, LayoutDashboard, Ticket, ChevronDown, Menu, X, Bell, Search } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("currentUser"));
    if (loggedInUser) setUser(loggedInUser);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    setMenuOpen(false);
    setMobileMenu(false);
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Explore", path: "/explore" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm py-3"
        : "bg-white/0 py-5"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 text-2xl font-black tracking-tighter"
        >
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-xl group-hover:bg-blue-600 transition-all duration-300 shadow-lg group-hover:shadow-blue-200 group-hover:scale-105">
            <span className="font-heading">T</span>
          </div>
          <span className="text-black font-heading transition-colors">TripSync</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center bg-gray-100/50 backdrop-blur-md p-1 rounded-full border border-gray-200/50">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${isActive(link.path)
                ? "bg-white text-black shadow-sm"
                : "text-gray-500 hover:text-black hover:bg-white/50"
                }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-5">
          {!user ? (
            <>
              <Link
                to="/login"
                className="text-sm font-bold text-gray-600 hover:text-black transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-extrabold hover:bg-gray-800 hover:shadow-xl hover:shadow-gray-200 transition-all active:scale-95"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <button className="p-2.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-all relative">
                <Bell size={20} strokeWidth={2.5} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-3 p-1.5 pr-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl transition-all shadow-sm active:scale-95"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 text-white flex items-center justify-center text-sm font-black shadow-inner">
                    {user.full_name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Account</span>
                    <ChevronDown size={14} className={`text-gray-500 transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.95 }}
                      transition={{ type: "spring", damping: 20, stiffness: 300 }}
                      className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-[24px] shadow-2xl overflow-hidden py-2.5 z-50"
                    >
                      <div className="px-5 py-4 border-b border-gray-50 mb-1.5">
                        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-1">Authenticated</p>
                        <p className="text-sm font-black text-gray-900 truncate">{user.full_name || 'Traveler'}</p>
                        <p className="text-[11px] text-gray-500 font-medium truncate">{user.email || ''}</p>
                      </div>

                      <div className="px-2 space-y-0.5">
                        <button
                          onClick={() => { navigate("/profile"); setMenuOpen(false); }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full text-left text-sm text-gray-700 font-bold rounded-xl transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                            <User size={16} strokeWidth={2.5} />
                          </div>
                          Profile Settings
                        </button>

                        {user.role === 'admin' ? (
                          <button
                            onClick={() => { navigate("/admin"); setMenuOpen(false); }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 w-full text-left text-sm text-blue-600 font-extrabold rounded-xl transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                              <LayoutDashboard size={16} strokeWidth={2.5} />
                            </div>
                            Management
                          </button>
                        ) : (
                          <button
                            onClick={() => { navigate("/profile"); setMenuOpen(false); }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full text-left text-sm text-gray-700 font-bold rounded-xl transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                              <Ticket size={16} strokeWidth={2.5} />
                            </div>
                            My Tickets
                          </button>
                        )}
                      </div>

                      <div className="px-2 pt-2.5 mt-2.5 border-t border-gray-50">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 w-full text-left text-sm text-red-500 font-extrabold rounded-xl transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                            <LogOut size={16} strokeWidth={2.5} />
                          </div>
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-3 bg-gray-100 text-black rounded-2xl active:scale-90 transition-transform"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          {mobileMenu ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 fixed inset-x-0 top-[72px] bottom-0 z-40 overflow-y-auto"
          >
            <div className="px-6 py-8 space-y-2">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[3px] mb-6">Navigation</p>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenu(false)}
                  className={`block py-4 px-6 rounded-2xl text-xl font-black transition-all ${isActive(link.path)
                    ? "bg-black text-white shadow-xl shadow-gray-200"
                    : "text-gray-900 active:bg-gray-100"
                    }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-10 space-y-4">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[3px] mb-6 pt-4 border-t border-gray-100">Membership</p>
                {!user ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenu(false)}
                      className="block w-full py-4 text-center rounded-2xl bg-gray-100 font-black text-gray-900"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenu(false)}
                      className="block w-full py-4 text-center rounded-2xl bg-blue-600 text-white font-black shadow-lg shadow-blue-100"
                    >
                      Join
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => { navigate("/profile"); setMobileMenu(false); }}
                      className="flex items-center gap-4 w-full p-5 rounded-2xl bg-gray-50 text-gray-900 font-black"
                    >
                      <User size={24} /> My Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-4 w-full p-5 rounded-2xl bg-red-50 text-red-500 font-black"
                    >
                      <LogOut size={24} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
