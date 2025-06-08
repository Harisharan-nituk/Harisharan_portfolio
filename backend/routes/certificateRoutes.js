// portfolio_py/backend/routes/certificateRoutes.js
import express from 'express';
import {
  addCertificate,
  getCertificates,
  deleteCertificate,
  updateCertificate, // Add if you implement it
  uploadCertificateImageMiddleware
} from '../controllers/certificateController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getCertificates)
  .post(protect, admin, uploadCertificateImageMiddleware, addCertificate); // Apply multer middleware for this route

router.route('/:id')
  // .get(getCertificateById) // If needed
  .put(protect, admin, uploadCertificateImageMiddleware, updateCertificate) // Also apply multer for updates if image can change
  .delete(protect, admin, deleteCertificate);

export default router;