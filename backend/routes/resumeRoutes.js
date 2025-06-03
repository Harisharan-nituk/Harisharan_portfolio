// backend/routes/resumeRoutes.js
import express from 'express';
import asyncHandler from 'express-async-handler'; // Ensure asyncHandler is imported if used for GET /:id
import {
  addResume,
  getResumesList,
  deleteResume,
  updateResume
  // getResumeById, // You would need to create and import this controller if you use the GET /:id route
} from '../controllers/resumeController.js';
import Resume from '../models/Resume.js'; // Import Resume model if using it directly for GET /:id
import { protect, admin } from '../middleware/authMiddleware.js'; // <-- IMPORT MIDDLEWARE

const router = express.Router();

router.route('/')
  .post(protect, admin, addResume) // SECURED: Only admin can add resumes
  .get(getResumesList);             // Public: Anyone can get the list of resumes

router.route('/:id')
  .get(asyncHandler(async (req, res) => { // GET single resume by ID (Public)
    const resume = await Resume.findById(req.params.id); // Using Resume model directly here
    if (resume) {
      res.json(resume);
    } else {
      res.status(404);
      throw new Error('Resume not found');
    }
  }))
  .put(protect, admin, updateResume)    // SECURED: Only admin can update resumes
  .delete(protect, admin, deleteResume); // SECURED: Only admin can delete resumes

export default router;