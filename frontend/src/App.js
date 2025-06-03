// frontend/src/App.js
import React from 'react';
import { Route, Routes } from 'react-router-dom'; // Only Route and Routes if Router is in index.js

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Public Page Components - Ensure correct paths
import HomePage from './pages/HomePage';
import AboutPage from './pages/admin/AboutPage/AboutPage';
import ProjectsPage from './pages/ProjectsPage';
import ContactPage from './pages/ContactPage';
import ResumePage from './pages/ResumePage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
// import ProjectDetail from './pages/ProjectDetailPage'; // Example if you have this

// Admin Components & Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminEducationPage from './pages/admin/AdminEducationPage'; // <-- NEW: Import AdminEducationPage

import ProtectedRoute from './components/routing/ProtectedRoute';

// Placeholder Admin Management Pages (you'll create these components later)
// const AdminResumesPage = () => <div className="p-4">Admin Resumes Management Page</div>;
// const AdminProjectsPage = () => <div className="p-4">Admin Projects Management Page</div>;

// This structure assumes Navbar and Footer are always present for public routes.
// Admin section uses AdminLayout which typically replaces the entire page content.
function App() {
  return (
    // NO <Router> here if it's in index.js
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-100 transition-colors duration-300"> {/* <-- MODIFIED LINE */}
      <Navbar />
      <div className="flex-grow"> {/* This div wraps the content between Navbar and Footer */}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/contact" element={<ContactPage />} />
          {/* <Route path="/projects/:id" element={<ProjectDetailPage />} /> */}
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute isAdminRoute={true} />}> {/* Parent for all admin routes */}
            <Route path="/admin/*" element={<AdminRoutes />} /> {/* Delegate all /admin/* to AdminRoutes */}
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
    // NO </Router> here
  );
}

// Helper component to structure admin routes within AdminLayout
const AdminRoutes = () => {
  return (
    <AdminLayout> {/* AdminLayout provides the sidebar and its own <Outlet/> for these nested routes */}
      <Routes>
        <Route index element={<AdminDashboardPage />} /> {/* Default for /admin shows dashboard */}
        <Route path="dashboard" element={<AdminDashboardPage />} />
           <Route path="education" element={<AdminEducationPage />} /> {/* <-- NEW: Route for managing education */}

        {/* Future Admin Management Pages:
          <Route path="resumes" element={<AdminResumesPage />} />
          <Route path="projects" element={<AdminProjectsPage />} /> 
        */}
        {/* Catch-all for any /admin/* sub-routes not explicitly defined within AdminLayout */}
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