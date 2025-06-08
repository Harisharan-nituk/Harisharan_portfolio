// portfolio_py/backend/controllers/certificateController.js
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Certificate from '../models/Certificate.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads/certificate_images');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const newFilename = `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
    cb(null, newFilename);
  }
});

const allowedFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'certificateImage - Invalid file type.'), false);
  }
};

export const uploadCertificateImageMiddleware = multer({
  storage: storage,
  fileFilter: allowedFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('certificateImage');

export const addCertificate = asyncHandler(async (req, res) => {
  const { name, issuingOrganization, description, credentialId, credentialUrl, dateIssued } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error('Certificate file (image or PDF) is required.');
  }
  if (!name || !issuingOrganization) {
    if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => { if (err) console.error("Error deleting orphaned file:", err); });
    }
    res.status(400);
    throw new Error('Certificate name and issuing organization are required.');
  }

  const certificate = new Certificate({
    name,
    issuingOrganization,
    description,
    credentialId,
    credentialUrl,
    dateIssued,
    imageUrl: `/uploads/certificate_images/${req.file.filename}`,
    storedImageFilename: req.file.filename,
    mimetype: req.file.mimetype,
  });

  const createdCertificate = await certificate.save();
  res.status(201).json(createdCertificate);
});

export const getCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({}).sort({ dateIssued: -1, createdAt: -1 });
  res.json(certificates);
});

export const updateCertificate = asyncHandler(async (req, res) => {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
        res.status(404);
        throw new Error('Certificate not found');
    }

    const { name, issuingOrganization, description, credentialId, credentialUrl, dateIssued } = req.body;
    certificate.name = name || certificate.name;
    certificate.issuingOrganization = issuingOrganization || certificate.issuingOrganization;
    certificate.description = description !== undefined ? description : certificate.description;
    certificate.credentialId = credentialId !== undefined ? credentialId : certificate.credentialId;
    certificate.credentialUrl = credentialUrl !== undefined ? credentialUrl : certificate.credentialUrl;
    certificate.dateIssued = dateIssued !== undefined ? dateIssued : certificate.dateIssued;

    if (req.file) {
        const oldImagePath = path.join(uploadsDir, certificate.storedImageFilename);
        if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
        }
        certificate.imageUrl = `/uploads/certificate_images/${req.file.filename}`;
        certificate.storedImageFilename = req.file.filename;
        certificate.mimetype = req.file.mimetype;
    }

    const updatedCertificate = await certificate.save();
    res.json(updatedCertificate);
});

export const deleteCertificate = asyncHandler(async (req, res) => {
    const certificate = await Certificate.findById(req.params.id);
    if (certificate) {
        const imagePath = path.join(uploadsDir, certificate.storedImageFilename);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        await Certificate.deleteOne({ _id: req.params.id });
        res.json({ message: 'Certificate removed' });
    } else {
        res.status(404);
        throw new Error('Certificate not found');
    }
});