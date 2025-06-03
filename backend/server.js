// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path'; // Import path module
import { fileURLToPath } from 'url'; // To get __dirname in ES modules

import connectDB from './config/db.js';
import GeneralSetting from './models/GeneralSetting.js'; // For initialization

// Import route files
import projectRoutes from './routes/projectRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js'; // Your new resume routes
import authRoutes from './routes/authRoutes.js'; 
import settingsRoutes from './routes/settingsRoutes.js';
import educationRoutes from './routes/educationRoutes.js'; // <-- NEW: Import Education Routes
import skillCategoryRoutes from './routes/skillCategoryRoutes.js'; // <-- NEW: Import SkillCategory Routes


// Import error handling middleware
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Ensure default general settings document exists
GeneralSetting.getSingleton().then(settingsDoc => {
  if (settingsDoc) {
    
    // You can log specific settings if needed, e.g., settingsDoc.ownerName
    console.log('General settings document successfully loaded or created.');
  }
}).catch(err => {
  console.error('CRITICAL: Error ensuring general settings document on startup:', err);
  // Depending on how critical these settings are, you might want to stop the server
  // process.exit(1); 
});


// For ES Modules, to get __dirname equivalent
const __filename = fileURLToPath(import.meta.url); // Gets the absolute path to the current file
const __dirname = path.dirname(__filename);       // Gets the directory name of the current file (e.g., /path/to/your/backend)

const app = express();

// CORS Policy - Enable Cross-Origin Resource Sharing
app.use(cors()); // Allows all origins by default. Configure more strictly for production if needed.

// Body parser middleware - to accept JSON data in req.body
app.use(express.json());

// Basic route to check if API is running
app.get('/', (req, res) => {
  res.send('API is running successfully...');
});

// ---- Serve Static Files (Uploaded Resumes) ----
// This makes files in 'backend/uploads/resumes/' accessible via the '/uploads/resumes' URL path
// For example, http://localhost:5001/uploads/resumes/yourfile.pdf
app.use('/uploads/profile_photo', express.static(path.join(__dirname, 'uploads/profile_photo'))); 

app.use('/uploads/resumes', express.static(path.join(__dirname, 'uploads/resumes')));
// For Project Images

app.use('/uploads/project_images', express.static(path.join(__dirname, 'uploads/project_images'))); 
// profile image 

app.use('/api/auth',authRoutes);
// ---------------------------------------------

// Mount API Routers
app.use('/api/settings', settingsRoutes); // <-- ADD THIS LINE
app.use('/api/education', educationRoutes); // <-- NEW: Mount Education Routes

app.use('/api/projects', projectRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/resumes', resumeRoutes); // Mount your resume routes
app.use('/api/skillcategories', skillCategoryRoutes); // <-- NEW: Mount SkillCategory Routes

// Custom Error Handling Middleware
app.use(notFound); // Handles 404 errors (routes not found)
app.use(errorHandler); // Handles other errors

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(
    `Backend server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});