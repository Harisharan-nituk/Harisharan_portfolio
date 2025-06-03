// backend/controllers/settingsController.js
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import GeneralSetting from '../models/GeneralSetting.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const profilePhotoUploadsDir = path.join(__dirname, '..', 'uploads/profile_photo');

try {
  if (!fs.existsSync(profilePhotoUploadsDir)) {
    fs.mkdirSync(profilePhotoUploadsDir, { recursive: true });
    console.log(`Created profile photo upload directory: ${profilePhotoUploadsDir}`);
  } else {
    console.log(`Multer will use existing profile photo upload directory: ${profilePhotoUploadsDir}`);
  }
} catch (err) {
  console.error(`Error accessing/creating profile photo upload directory: ${profilePhotoUploadsDir}`, err);
}

const profilePhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, profilePhotoUploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'profilePhoto - Not an image file!'), false);
  }
};

const uploadProfilePhotoMiddleware = multer({
  storage: profilePhotoStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
}).single('profilePhoto');

const getSettings = asyncHandler(async (req, res) => {
  const settings = await GeneralSetting.getSingleton();
  res.json(settings);
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await GeneralSetting.getSingleton();
  const { ownerName, jobTitle, specialization, homePageIntroParagraph } = req.body;

  settings.ownerName = ownerName !== undefined ? ownerName : settings.ownerName;
  settings.jobTitle = jobTitle !== undefined ? jobTitle : settings.jobTitle;
  settings.specialization = specialization !== undefined ? specialization : settings.specialization;
  settings.homePageIntroParagraph = homePageIntroParagraph !== undefined ? homePageIntroParagraph : settings.homePageIntroParagraph;

  const updatedSettings = await settings.save();
  res.json(updatedSettings);
});

const uploadOrUpdateProfilePhoto = (req, res) => {
  uploadProfilePhotoMiddleware(req, res, asyncHandler(async (err) => {
    if (err) { // Covers multer errors and our custom fileFilter error
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'Profile photo too large. Max 2MB.' });
      return res.status(400).json({ message: err.message || 'Profile photo upload error.' });
    }
    if (!req.file) return res.status(400).json({ message: 'No profile photo file uploaded.' });

    const settings = await GeneralSetting.getSingleton();
    if (settings.storedProfilePhotoFilename) {
      const oldPhotoPath = path.join(profilePhotoUploadsDir, settings.storedProfilePhotoFilename);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlink(oldPhotoPath, (unlinkErr) => {
          if (unlinkErr) console.error(`Error deleting old profile photo ${oldPhotoPath}:`, unlinkErr);
          else console.log(`Successfully deleted old profile photo: ${oldPhotoPath}`);
        });
      }
    }
    settings.profilePhotoUrl = `/uploads/profile_photo/${req.file.filename}`;
    settings.storedProfilePhotoFilename = req.file.filename;
    const updatedSettings = await settings.save();
    res.status(200).json({
      message: 'Profile photo updated successfully',
      profilePhotoUrl: updatedSettings.profilePhotoUrl,
      settings: updatedSettings,
    });
  }));
};

export { getSettings, updateSettings, uploadOrUpdateProfilePhoto };