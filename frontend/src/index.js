// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; // <-- IMPORT Router
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext'; // <-- NEW: Import ThemeProvider


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router> {/* <-- WRAP AuthProvider (and App) with Router HERE */}
           <ThemeProvider> 
      <AuthProvider>
        <App />
      </AuthProvider>
            </ThemeProvider> 
    </Router>
  </React.StrictMode>
);