// frontend/src/components/common/Navbar.js
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggleButton from './ThemeToggleButton';
import { useSettings } from '../../contexts/SettingsContext';
import { Mail } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const { siteSettings } = useSettings();

  const navLinkClasses = ({ isActive }) =>
    `relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'text-gray-900 dark:text-white'
        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
    }`;
    
  const mobileNavLinkClasses = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-base font-medium ${
      isActive
        ? 'bg-gray-900 text-white dark:bg-gray-700'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  const handleMobileLinkClick = () => setIsOpen(false);
  const handleLogoutClick = () => {
    logout();
    setIsOpen(false); 
  };

  return (
    <nav className="bg-gradient-to-r from-gray-100/90 to-gray-200/90 dark:from-slate-900/90 dark:to-black/90 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-gray-200/50 dark:border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <NavLink 
              to="/" 
              className="text-gray-800 dark:text-white font-bold text-xl hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-150 ease-in-out"
              onClick={handleMobileLinkClick}
            >
              {siteSettings.ownerName || 'Your Name'}
            </NavLink>
          </div>

          <div className="hidden md:flex md:items-center">
            <div className="flex items-baseline space-x-1">
              <NavLink to="/" className={navLinkClasses}>Home</NavLink>
              <NavLink to="/about" className={navLinkClasses}>About</NavLink>
              <NavLink to="/projects" className={navLinkClasses}>Projects</NavLink>
              <NavLink to="/resume" className={navLinkClasses}>Resume</NavLink>
              <NavLink to="/contact" className={navLinkClasses}>Contact</NavLink>
            </div>
            <div className="ml-5 flex items-center gap-4">
                <a href="mailto:bt21cse016@nituk.ac.in" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    <Mail size={16} />
                    bt21cse016@nituk.ac.in
                </a>
                <ThemeToggleButton />
                {currentUser ? (
                    <button
                    onClick={logout}
                    className="px-3 py-1.5 rounded-md text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors duration-150 ease-in-out"
                    >
                    Logout
                    </button>
                ) : (
                    <NavLink to="/login" className="px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                    Login
                    </NavLink>
                )}
            </div>
          </div>

          <div className="-mr-2 flex items-center md:hidden">
            <ThemeToggleButton />
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="ml-2 bg-gray-100 dark:bg-slate-800 inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-300 hover:text-white hover:bg-gray-700 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-white"
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

      {isOpen && (
        <div className="md:hidden bg-white/95 dark:bg-slate-800/95" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/" className={mobileNavLinkClasses} onClick={handleMobileLinkClick}>Home</NavLink>
            <NavLink to="/about" className={mobileNavLinkClasses} onClick={handleMobileLinkClick}>About</NavLink>
            <NavLink to="/projects" className={mobileNavLinkClasses} onClick={handleMobileLinkClick}>Projects</NavLink>
            <NavLink to="/resume" className={mobileNavLinkClasses} onClick={handleMobileLinkClick}>Resume</NavLink>
            <NavLink to="/contact" className={mobileNavLinkClasses} onClick={handleMobileLinkClick}>Contact</NavLink>
            <div className="border-t border-gray-200 dark:border-slate-700 my-2"></div>
            {currentUser ? (
              <button
                onClick={handleLogoutClick}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-300"
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