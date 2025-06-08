// portfolio_py/frontend/src/App.js
import React from 'react';
import { Route, Routes } from 'react-router-dom'; // Added Navigate

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Public Page Components
import HomePage from './pages/HomePage';
// Ensure this AboutPage import points to the one intended for /admin/about
// If you have a separate public AboutPage, that would be a different import.
import AboutPage from './pages/admin/AboutPage/AboutPage'; 
import ProjectsPage from './pages/ProjectsPage';
import ContactPage from './pages/ContactPage';
import ResumePage from './pages/ResumePage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Admin Components & Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
// AdminEducationPage import will be removed as the component is being deleted.
// import AdminEducationPage from './pages/admin/AdminEducationPage'; 
import AdminSocialLinksPage from './pages/admin/AdminSocialLinksPage'; // <-- THIS IS THE FIX: Import the component

import ProtectedRoute from './components/routing/ProtectedRoute';

// Placeholder or actual components for Admin Resume and Project Management
// You'll need to create these if they don't exist or are placeholders.
const AdminResumesPage = () => <div className="p-4 text-gray-700 dark:text-gray-200">Admin Resumes Management Page - Placeholder</div>;
const AdminProjectsPage = () => <div className="p-4 text-gray-700 dark:text-gray-200">Admin Projects Management Page - Placeholder</div>;

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <div className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* This public /about route currently points to the admin AboutPage.
              Consider if you need a separate public-facing About page without admin controls.
              If so, you'd create a new component for it and route to that here.
              For now, it uses the admin one as per current structure.
          */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/contact" element={<ContactPage />} />
           
            <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
          <Route path="/resetpassword/:resettoken" element={<ResetPasswordPage />} />
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute isAdminRoute={true} />}>
            <Route path="/admin/*" element={<AdminRoutes />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

// Helper component to structure admin routes within AdminLayout
const AdminRoutes = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboardPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        
        {/* Route for the About page where Skills and Education are managed by admin */}
        <Route path="about" element={<AboutPage />} /> 

        {/* Routes for managing resumes and projects */}
        <Route path="resumes" element={<AdminResumesPage />} /> 
        <Route path="projects" element={<AdminProjectsPage />} /> 
         <Route path="social-links" element={<AdminSocialLinksPage />} /> {/* <-- THIS IS THE FIX */}


        {/* The dedicated /admin/education route is removed */}

        <Route path="*" element={
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-500">Admin Section Not Found</h2>
            <p className="text-gray-600">The specific admin page you're looking for doesn't exist here.</p>
          </div>
        } />
      </Routes>
    </AdminLayout>
  );
};

export default App;