// backend/routes/skillCategoryRoutes.js
import express from 'express';
import {
  addSkillCategory,
  getSkillCategories,
  getSkillCategoryById,
  updateSkillCategory,
  deleteSkillCategory,
  addSkillToCategory, 
  deleteSkillFromCategory,// Uncomment if you implement this controller
  // removeSkillFromCategory, // Uncomment if you implement this controller
} from '../controllers/skillCategoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Public Routes ---
router.route('/')
  .get(getSkillCategories); // GET /api/skillcategories - Fetches all categories and their skills

router.route('/:id')
  .get(getSkillCategoryById); // GET /api/skillcategories/:id - Fetches a single category by ID

// --- Admin Routes (Secured) ---
router.route('/')
  .post(protect, admin, addSkillCategory); // POST /api/skillcategories - Adds a new skill category

router.route('/:id')
  .put(protect, admin, updateSkillCategory)    // PUT /api/skillcategories/:id - Updates a category (name, skills array, order)
  .delete(protect, admin, deleteSkillCategory); // DELETE /api/skillcategories/:id - Deletes a category

// Optional: Routes for managing individual skills within a category
router.route('/:categoryId/skills')
  .post(protect, admin, addSkillToCategory); 
  // POST /api/skillcategories/:id/skills - Adds a skill to this category
router.route('/:categoryId/skills/:skillId')
  .delete(protect, admin, deleteSkillFromCategory);
// router.route('/:id/skills/remove') // Or use DELETE /api/skillcategories/:id/skills/:skillname (more RESTful)
//   .delete(protect, admin, removeSkillFromCategory); // Example: DELETE /api/skillcategories/:id/skills - with skillName in body

export default router;