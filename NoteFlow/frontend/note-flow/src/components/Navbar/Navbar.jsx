import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const Navbar = ({ onLogout }) => {
  const location = useLocation();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-6 left-0 right-0 w-full z-50 px-4"
    >
      <div className="max-w-7xl mx-auto bg-white/20 backdrop-blur-3xl border border-white/30 rounded-full shadow-2xl z-50 px-8">
        <div className="flex justify-between items-center h-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to={location.pathname === "/" ? "/" : "/dashboard"}
              className="text-3xl font-bold text-[#ff5b04] drop-shadow-[0_0_8px_rgba(255,91,4,0.5)]"
            >
              NoteFlow
            </Link>
          </motion.div>

          {location.pathname !== "/" && (
            <>
              <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-8">
                <Link
                  to="/dashboard"
                  className={`font-medium transition-all duration-300 ${location.pathname === '/dashboard'
                    ? 'text-[#ff5b04] transform scale-105'
                    : 'text-[#16232a] hover:text-[#ff5b04]'
                    }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/flow-board"
                  className={`font-medium transition-all duration-300 ${location.pathname === '/flow-board'
                    ? 'text-[#ff5b04] transform scale-105'
                    : 'text-[#16232a] hover:text-[#ff5b04]'
                    }`}
                >
                  Flow Board
                </Link>
                <Link
                  to="/profile"
                  className={`font-medium transition-all duration-300 ${location.pathname === '/profile'
                    ? 'text-[#ff5b04] transform scale-105'
                    : 'text-[#16232a] hover:text-[#ff5b04]'
                    }`}
                >
                  Profile
                </Link>
              </div>

              <button
                onClick={onLogout}
                className="font-medium text-[#16232a] hover:text-[#ff5b04] transition-all duration-300"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;