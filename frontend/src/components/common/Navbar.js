// frontend/src/components/common/Navbar.js
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path if your contexts folder is elsewhere
import ThemeToggleButton from './ThemeToggleButton'; // Assuming ThemeToggleButton.js is in the same 'common' folder

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  const navLinkClasses = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive
        ? 'bg-gray-900 text-white dark:bg-gray-700' // Active link style
        : 'text-gray-300 hover:bg-gray-700 hover:text-white dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
    } md:ml-4 transition-colors duration-150 ease-in-out`;

  const mobileNavLinkClasses = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-base font-medium ${
      isActive
        ? 'bg-gray-900 text-white dark:bg-gray-700'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
    } transition-colors duration-150 ease-in-out`;

  const handleMobileLinkClick = () => {
    setIsOpen(false); 
  };

  const handleLogoutClick = () => {
    logout();
    setIsOpen(false); 
  };

  return (
    <nav className="bg-gray-800 dark:bg-slate-900 shadow-lg sticky top-0 z-50"> {/* Navbar background with dark mode variant */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand Name */}
          <div className="flex-shrink-0">
            <NavLink 
              to="/" 
              className="text-white font-bold text-xl hover:text-indigo-300 dark:hover:text-indigo-400 transition-colors duration-150 ease-in-out"
              onClick={handleMobileLinkClick} // Close mobile menu if logo is clicked
            >
              Harisharan {/* Your Name */}
            </NavLink>
          </div>

          {/* Desktop Navigation Links & Controls */}
          <div className="hidden md:flex md:items-center">
            <div className="ml-10 flex items-baseline space-x-1"> {/* Navigation Links */}
              <NavLink to="/" className={navLinkClasses}>Home</NavLink>
              <NavLink to="/about" className={navLinkClasses}>About</NavLink>
              <NavLink to="/projects" className={navLinkClasses}>Projects</NavLink>
              <NavLink to="/resume" className={navLinkClasses}>Resume</NavLink>
              <NavLink to="/contact" className={navLinkClasses}>Contact</NavLink>
              {currentUser ? (
                <button
                  onClick={logout} // Directly call logout from context for desktop
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-red-700 hover:text-white dark:hover:bg-red-600 transition-colors duration-150 ease-in-out md:ml-4"
                >
                  Logout
                </button>
              ) : (
                <NavLink to="/login" className={navLinkClasses}>
                  Login
                </NavLink>
              )}
            </div>
            {/* Theme Toggle Button for Desktop */}
            <div className="ml-3"> 
              <ThemeToggleButton />
            </div>
          </div>

          {/* Mobile Menu Controls (Theme Toggle + Hamburger Button) */}
          <div className="-mr-2 flex items-center md:hidden">
            <div className="mr-2"> {/* Theme toggle button before hamburger */}
              <ThemeToggleButton />
            </div>
            {/* Mobile menu button (Hamburger) */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-gray-800 dark:bg-slate-900 inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 dark:focus:ring-offset-slate-900 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isOpen ? 'true' : 'false'}
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/" className={mobileNavLinkClasses} onClick={handleMobileLinkClick}>Home</NavLink>
            <NavLink to="/about" className={mobileNavLinkClasses} onClick={handleMobileLinkClick}>About</NavLink>
            <NavLink to="/projects" className={mobileNavLinkClasses} onClick={handleMobileLinkClick}>Projects</NavLink>
            <NavLink to="/resume" className={mobileNavLinkClasses} onClick={handleMobileLinkClick}>Resume</NavLink>
            <NavLink to="/contact" className={mobileNavLinkClasses} onClick={handleMobileLinkClick}>Contact</NavLink>
            {currentUser ? (
              <button
                onClick={handleLogoutClick} // Use combined handler to also close menu
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-red-700 hover:text-white dark:text-gray-300 dark:hover:bg-red-600 dark:hover:text-white transition-colors duration-150 ease-in-out"
              >
                Logout
              </button>
            ) : (
              <NavLink to="/login" className={mobileNavLinkClasses} onClick={handleMobileLinkClick}>
                Login
              </NavLink>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;