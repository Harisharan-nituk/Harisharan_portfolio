// backend/routes/settingsRoutes.js
import express from 'express';
import {
  getSettings,
  updateSettings,
  uploadOrUpdateProfilePhoto
} from '../controllers/settingsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getSettings); // Public to fetch settings
router.put('/', protect, admin, updateSettings); // Admin only to update text settings
router.post('/profile-photo', protect, admin, uploadOrUpdateProfilePhoto); // Admin only to update photo

export default router;