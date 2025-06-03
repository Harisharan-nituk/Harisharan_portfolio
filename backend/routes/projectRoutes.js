// backend/routes/projectRoutes.js
import express from 'express';
import {
  addProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';
import { protect, admin } from '../middleware/authMiddleware.js'; // <-- IMPORT MIDDLEWARE

const router = express.Router();

router.route('/')
  .post(protect, admin, addProject) // SECURED: Only admin can add projects
  .get(getProjects);                // Public: Anyone can get all projects

router.route('/:id')
  .get(getProjectById)              // Public: Anyone can get a single project by ID
  .put(protect, admin, updateProject)    // SECURED: Only admin can update projects
  .delete(protect, admin, deleteProject); // SECURED: Only admin can delete projects

export default router;