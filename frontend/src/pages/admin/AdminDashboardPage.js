// frontend/src/pages/admin/AdminDashboardPage.js
import React from 'react';
import { Link } from 'react-router-dom'; // For navigation links
import { useAuth } from '../../contexts/AuthContext'; // To get current user info

const AdminDashboardPage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      
      {currentUser && (
        <p className="text-lg text-gray-700 mb-8">
          Welcome back, <span className="font-semibold">{currentUser.name}!</span>
        </p>
      )}

      <p className="text-gray-600 mb-6">
        This is your admin dashboard. From here, you will be able to manage various aspects of your portfolio website.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Manage Resumes</h2>
          <p className="text-sm text-gray-600 mb-4">
            Add, update, or delete your resume entries.
          </p>
          <Link 
            to="/admin/resumes" 
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
          >
            Go to Resumes
          </Link>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Manage Projects</h2>
          <p className="text-sm text-gray-600 mb-4">
            Add, update, or delete your project showcases.
          </p>
          <Link 
            to="/admin/projects" 
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
          >
            Go to Projects
          </Link>
        </div>
        {/* You can add more cards here for other admin sections as you build them */}
      </div>
    </div>
  );
};

export default AdminDashboardPage;