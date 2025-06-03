// backend/controllers/resumeController.js
import asyncHandler from 'express-async-handler';
import multer from 'multer'; // Should already be imported
import path from 'path';
import fs from 'fs';
import Resume from '../models/Resume.js'; // Your Resume model
import { fileURLToPath } from 'url';   // Ensure this is imported

// --- Ensure your Multer Configuration is here and correct ---
// (uploadsDir, storage, fileFilter, uploadMiddleware as previously defined and corrected)
// Example (this should be the corrected version from our previous discussions):
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads/resumes');

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created uploads directory: ${uploadsDir}`);
  } else {
    console.log(`Multer will use existing uploads directory: ${uploadsDir}`);
  }
} catch (err) {
  console.error(`Error accessing/creating uploads directory: ${uploadsDir}`, err);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadsDir); },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalNameSanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${path.parse(originalNameSanitized).name}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'resumeFile - Not a PDF file! Please upload only PDFs.'), false);
  }
};

const uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('resumeFile'); // Expects a single file with the field name 'resumeFile' from FormData
// --- End Multer Configuration ---


// Your existing addResume function should be here
const addResume = (req, res) => {
  uploadMiddleware(req, res, asyncHandler(async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') { return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' }); }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') { return res.status(400).json({ message: 'Not a PDF file! Please upload only PDFs.' });}
      return res.status(400).json({ message: `Multer error: ${err.message}` });
    } else if (err) { return res.status(400).json({ message: err.message }); }
    if (!req.file) { return res.status(400).json({ message: 'No resume file uploaded. Please select a PDF.' });}
    
    const { field, customFieldName } = req.body;
    if (!field || typeof field !== 'string' || field.trim() === '') {
      fs.unlink(req.file.path, (unlinkErr) => { if (unlinkErr) console.error("Error deleting orphaned file:", unlinkErr); });
      return res.status(400).json({ message: 'Resume field/category is required.' });
    }
    const resumeField = (field.trim().toLowerCase() === 'other' && customFieldName && typeof customFieldName === 'string' && customFieldName.trim() !== '') 
                        ? customFieldName.trim() : field.trim();
    const newResume = new Resume({
      field: resumeField, originalFilename: req.file.originalname, storedFilename: req.file.filename, 
      filePath: req.file.path, mimetype: req.file.mimetype, size: req.file.size,
    });
    try {
      const createdResume = await newResume.save();
      res.status(201).json(createdResume);
    } catch (saveError) {
      fs.unlink(req.file.path, (unlinkErr) => { if (unlinkErr) console.error("Error deleting orphaned file after DB save failure:", unlinkErr); });
      console.error("Error saving resume to DB:", saveError);
      res.status(500).json({ message: "Error saving resume data. " + saveError.message });
    }
  }));
};

// Your existing getResumesList function should be here
const getResumesList = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({}).sort({ createdAt: -1 });
  res.json(resumes);
});

// Your existing deleteResume function should be here
const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id);
  if (resume) {
    const filePathToDelete = resume.filePath; 
    fs.unlink(filePathToDelete, async (unlinkErr) => {
      if (unlinkErr && unlinkErr.code !== 'ENOENT') { 
        console.error(`Error deleting file ${filePathToDelete} from server:`, unlinkErr);
      }
      try {
        await Resume.deleteOne({ _id: req.params.id });
        if (unlinkErr && unlinkErr.code === 'ENOENT') {
            return res.json({ message: 'Resume record removed (file was not found on server)' });
        }
        res.json({ message: 'Resume (file and record) removed successfully' });
      } catch (dbErr) {
        console.error('Error during resume DB record deletion:', dbErr);
        res.status(500).json({ message: 'Error removing resume record. ' + dbErr.message });
      }
    });
  } else {
    res.status(404);
    throw new Error('Resume not found');
  }
});


// @desc    Update an existing resume
// @route   PUT /api/resumes/:id
// @access  Private (to be secured later)
const updateResume = (req, res) => {
  uploadMiddleware(req, res, asyncHandler(async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'New file too large. Maximum size is 5MB.' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
         return res.status(400).json({ message: 'Not a PDF file! Please upload only PDFs for replacement.' });
      }
      return res.status(400).json({ message: `File upload error for update: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: `Upload processing error: ${err.message}` });
    }

    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      res.status(404);
      // If a new file was uploaded for a non-existent resume, delete the new file
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting temporary uploaded file for non-existent resume:", unlinkErr);
        });
      }
      throw new Error('Resume not found');
    }

    // Update field if provided in the request body
    const { field, customFieldName } = req.body;
    if (field && typeof field === 'string' && field.trim() !== '') {
      const newField = (field.trim().toLowerCase() === 'other' && customFieldName && typeof customFieldName === 'string' && customFieldName.trim() !== '') 
                        ? customFieldName.trim() 
                        : field.trim();
      resume.field = newField;
    }

    // If a new file was uploaded, update file-related fields and delete the old file
    if (req.file) {
      const oldFilePath = resume.filePath; // Path of the current file to be replaced

      // Update resume document with new file info
      resume.originalFilename = req.file.originalname;
      resume.storedFilename = req.file.filename;
      resume.filePath = req.file.path; // Multer provides the full path where the new file is stored
      resume.mimetype = req.file.mimetype;
      resume.size = req.file.size;

      // Delete the old file from the server
      if (oldFilePath && fs.existsSync(oldFilePath)) {
        fs.unlink(oldFilePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error(`Error deleting old resume file ${oldFilePath}:`, unlinkErr);
          } else {
            console.log(`Successfully deleted old file: ${oldFilePath}`);
          }
        });
      } else if (oldFilePath) {
        console.warn(`Old resume file not found for deletion, but DB record was updated: ${oldFilePath}`);
      }
    }

    try {
      const updatedResumeData = await resume.save();
      res.json(updatedResumeData);
    } catch (saveError) {
      // If saving to DB fails AND a new file was uploaded, delete the newly uploaded file
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting newly uploaded file after DB update failure:", unlinkErr);
        });
      }
      console.error("Error updating resume in DB:", saveError);
      res.status(500).json({ message: "Error updating resume data. " + saveError.message });
    }
  }));
};

// Ensure all functions are exported
export { addResume, getResumesList, deleteResume, updateResume };