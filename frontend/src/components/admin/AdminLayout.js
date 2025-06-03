// frontend/src/components/admin/AdminLayout.js
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path as needed

// NEW: Import icons from lucide-react
import { 
  LayoutDashboard, 
  FileText,        // For Resumes
  Briefcase,       // For Projects
  GraduationCap,   // For Education
  LogOut, 
  ExternalLink 
} from 'lucide-react';

const AdminLayout = () => {
  const { currentUser, logout } = useAuth();
  // const navigate = useNavigate(); // useNavigate is available if needed, logout in context handles it

  const handleLogout = () => {
    logout();
  };

  const navLinkClasses = ({ isActive }) =>
    `flex items-center px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out ${ // ADDED: flex items-center
      isActive
        ? 'bg-indigo-700 text-white shadow-md'
        : 'text-gray-300 hover:bg-indigo-500 hover:text-white dark:text-gray-300 dark:hover:bg-indigo-600 dark:hover:text-white'
    }`;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-900"> {/* Added dark mode for main bg */}
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 dark:bg-slate-800 text-gray-100 flex flex-col space-y-2 p-4 shadow-lg transition-colors duration-300">
        <div className="text-center py-4 border-b border-gray-700 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-white">Admin Portal</h2>
          {currentUser && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Welcome, {currentUser.name}</p>
          )}
        </div>
        <nav className="flex-grow mt-4 space-y-1"> {/* Added margin-top and adjusted spacing */}
          <NavLink to="/admin/dashboard" className={navLinkClasses}>
            <LayoutDashboard className="mr-3 h-5 w-5" /> {/* Icon Added */}
            Dashboard
          </NavLink>
          <NavLink to="/admin/resumes" className={navLinkClasses}>
            <FileText className="mr-3 h-5 w-5" /> {/* Icon Added */}
            Manage Resumes
          </NavLink>
          <NavLink to="/admin/projects" className={navLinkClasses}>
            <Briefcase className="mr-3 h-5 w-5" /> {/* Icon Added */}
            Manage Projects
          </NavLink>
          <NavLink to="/admin/education" className={navLinkClasses}>
            <GraduationCap className="mr-3 h-5 w-5" /> {/* Icon Added */}
            Manage Education
          </NavLink>
          {/* Add more admin links here as needed, with their icons */}
        </nav>
        <div className="pt-4 border-t border-gray-700 dark:border-slate-700 space-y-2">
          <NavLink 
            to="/" 
            className={`${navLinkClasses({isActive:false})} text-center bg-gray-700 dark:bg-slate-700 hover:bg-gray-600 dark:hover:bg-slate-600`}
          >
            <ExternalLink className="mr-3 h-5 w-5 inline-block" /> {/* Icon Added */}
            Go to Public Site
          </NavLink>
          <button
            onClick={handleLogout}
            className={`${navLinkClasses({isActive:false})} w-full text-left bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800`}
          >
            <LogOut className="mr-3 h-5 w-5" /> {/* Icon Added */}
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-slate-900 p-6 md:p-8 transition-colors duration-300">
          <Outlet /> {/* Child routes (admin pages) will render here */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;