// // backend/controllers/projectController.js
// import Project from '../models/Project.js';
// import asyncHandler from 'express-async-handler'; // Simple middleware for handling exceptions

// // @desc    Fetch all projects
// // @route   GET /api/projects
// // @access  Public
// const getProjects = asyncHandler(async (req, res) => {
//   const projects = await Project.find({});
//   res.json(projects);
// });

// // @desc    Fetch single project
// // @route   GET /api/projects/:id
// // @access  Public
// const getProjectById = asyncHandler(async (req, res) => {
//   const project = await Project.findById(req.params.id);
//   if (project) {
//     res.json(project);
//   } else {
//     res.status(404);
//     throw new Error('Project not found');
//   }
// });

// // @desc    Create a project
// // @route   POST /api/projects
// // @access  Private (would need auth middleware for a real app)
// const createProject = asyncHandler(async (req, res) => {
//   const { title, description, imageUrl, liveUrl, githubUrl, technologies, category } = req.body;

//   const project = new Project({
//     title,
//     description,
//     imageUrl,
//     liveUrl,
//     githubUrl,
//     technologies,
//     category,
//     // user: req.user._id // if you have user authentication
//   });

//   const createdProject = await project.save();
//   res.status(201).json(createdProject);
// });

// // Add updateProject and deleteProject functions similarly

// export { getProjects, getProjectById, createProject };

// backend/controllers/projectController.js
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Project from '../models/Project.js'; // Your Project model
import { fileURLToPath } from 'url';

// --- Multer Configuration for Project Images ---
const __filename = fileURLToPath(import.meta.url); // Path to this current file
const __dirname = path.dirname(__filename);         // Directory of this current file (e.g., .../backend/controllers)

// Navigate up from 'controllers' to 'backend', then into 'uploads/project_images'
const projectImagesUploadsDir = path.join(__dirname, '..', 'uploads/project_images');

// Ensure the uploads directory exists synchronously at startup
try {
  if (!fs.existsSync(projectImagesUploadsDir)) {
    fs.mkdirSync(projectImagesUploadsDir, { recursive: true });
  } else {
  }
} catch (err) {
}

// Multer disk storage configuration for project images
const projectImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, projectImagesUploadsDir); // Save files to backend/uploads/project_images/
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalNameSanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${path.parse(originalNameSanitized).name}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter for common image types
const projectImageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) { // Checks if the mimetype starts with 'image/'
    cb(null, true); // Accept the file
  } else {
    // Reject the file and provide an error message
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'projectImage - Not an image file! Please upload only images (jpg, png, gif, webp, etc.).'), false);
  }
};

// Multer upload instance for project images
// 'projectImage' is the name of the field in FormData that will contain the file
const uploadProjectImageMiddleware = multer({
  storage: projectImageStorage,
  fileFilter: projectImageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for images
}).single('projectImage'); // Expecting a single file with field name 'projectImage'

// --- Controller Functions ---

// @desc    Add a new project (with optional image upload)
// @route   POST /api/projects
// @access  Admin (to be secured later)
const addProject = (req, res) => {
  uploadProjectImageMiddleware(req, res, asyncHandler(async (err) => {
    // Handle Multer-specific or other upload processing errors
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') { return res.status(400).json({ message: 'Image file too large. Maximum size is 10MB.' }); }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') { return res.status(400).json({ message: err.message || 'Invalid image file type.' });}
      return res.status(400).json({ message: `Image upload error: ${err.message}` });
    } else if (err) { // Other errors (e.g., custom errors from fileFilter if not MulterError)
      return res.status(400).json({ message: `Processing error: ${err.message}` });
    }

    // At this point, if req.file exists, it means an image was uploaded successfully.
    // If req.file does not exist, it means no image was provided (which is allowed as per model).
    
    const { title, description, projectLink, githubUrl, technologies } = req.body;

    if (!title || !description) {
      // If a file was uploaded but required text fields are missing, delete the uploaded file
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
         fs.unlink(req.file.path, (unlinkErr) => { if (unlinkErr) console.error("Error deleting orphaned project image after validation fail:", unlinkErr); });
      }
      return res.status(400).json({ message: 'Project title and description are required.' });
    }

    const projectData = {
      title,
      description,
      projectLink: projectLink || '',
      githubUrl: githubUrl || '',
      technologies: technologies ? (Array.isArray(technologies) ? technologies : technologies.split(',').map(tech => tech.trim())) : [],
    };

    if (req.file) {
      projectData.imageUrl = `/uploads/project_images/${req.file.filename}`; // Web-accessible path
      projectData.storedImageFilename = req.file.filename; // Actual filename on disk
    } else {
      projectData.imageUrl = ''; // Or a default placeholder image URL
      projectData.storedImageFilename = '';
    }

    const newProject = new Project(projectData);

    try {
      const createdProject = await newProject.save();
      res.status(201).json(createdProject);
    } catch (saveError) {
      // If DB save fails and an image was uploaded, delete the uploaded image
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlink(req.file.path, (unlinkErr) => { if (unlinkErr) console.error("Error deleting project image after DB save failure:", unlinkErr); });
      }
      console.error("Error saving project to DB:", saveError);
      res.status(500).json({ message: "Error saving project data to database. " + saveError.message });
    }
  }));
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({}).sort({ createdAt: -1 }); // Get newest first
  res.json(projects);
});

// @desc    Get a single project by ID
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (project) {
    res.json(project);
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
});

// @desc    Update an existing project
// @route   PUT /api/projects/:id
// @access  Admin (to be secured later)
const updateProject = (req, res) => {
  uploadProjectImageMiddleware(req, res, asyncHandler(async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') { return res.status(400).json({ message: 'New image file too large. Max 10MB.' }); }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') { return res.status(400).json({ message: err.message || 'Invalid new image file type.' });}
      return res.status(400).json({ message: `Image upload error for update: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: `Processing error for update: ${err.message}` });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      if (req.file && req.file.path && fs.existsSync(req.file.path)) { // Delete newly uploaded file if project not found
          fs.unlink(req.file.path, (unlinkErr) => { if (unlinkErr) console.error("Error deleting temp project image for non-existent project:", unlinkErr); });
      }
      res.status(404);
      throw new Error('Project not found for update');
    }

    const { title, description, projectLink, githubUrl, technologies } = req.body;

    project.title = (title && title.trim() !== '') ? title.trim() : project.title;
    project.description = (description && description.trim() !== '') ? description.trim() : project.description;
    project.projectLink = projectLink !== undefined ? projectLink.trim() : project.projectLink;
    project.githubUrl = githubUrl !== undefined ? githubUrl.trim() : project.githubUrl;
    project.technologies = technologies ? (Array.isArray(technologies) ? technologies : technologies.split(',').map(tech => tech.trim())) : project.technologies;

    if (req.file) { // If a new image is uploaded
      const oldImageFilePath = project.storedImageFilename ? path.join(projectImagesUploadsDir, project.storedImageFilename) : null;
      
      project.imageUrl = `/uploads/project_images/${req.file.filename}`;
      project.storedImageFilename = req.file.filename;

      if (oldImageFilePath && fs.existsSync(oldImageFilePath)) {
        fs.unlink(oldImageFilePath, (unlinkErr) => {
          if (unlinkErr) console.error(`Error deleting old project image ${oldImageFilePath}:`, unlinkErr);
          else console.log(`Successfully deleted old project image: ${oldImageFilePath}`);
        });
      }
    }

    try {
      const updatedProject = await project.save();
      res.json(updatedProject);
    } catch (saveError) {
      if (req.file && req.file.path && fs.existsSync(req.file.path)) { // If DB save fails, delete newly uploaded image
        fs.unlink(req.file.path, (unlinkErr) => { if (unlinkErr) console.error("Error deleting new project image after DB update failure:", unlinkErr); });
      }
      console.error("Error updating project in DB:", saveError);
      res.status(500).json({ message: "Error updating project data. " + saveError.message });
    }
  }));
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Admin (to be secured later)
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (project) {
    const imageFilePath = project.storedImageFilename ? path.join(projectImagesUploadsDir, project.storedImageFilename) : null;

    if (imageFilePath && fs.existsSync(imageFilePath)) {
      fs.unlink(imageFilePath, async (unlinkErr) => {
        if (unlinkErr && unlinkErr.code !== 'ENOENT') {
          console.error(`Error deleting project image ${imageFilePath}:`, unlinkErr);
          // Continue to delete DB record even if file deletion fails for some reason other than not found
        }
        try {
          await Project.deleteOne({ _id: req.params.id });
          res.json({ message: 'Project (and image if found) removed successfully' });
        } catch (dbErr) {
          console.error('Error deleting project record from DB:', dbErr);
          res.status(500).json({ message: 'Error removing project record. ' + dbErr.message });
        }
      });
    } else { // No image file path stored or file doesn't exist
      if (imageFilePath) console.warn(`Project image not found for deletion: ${imageFilePath}. Deleting DB record.`);
      try {
        await Project.deleteOne({ _id: req.params.id });
        res.json({ message: 'Project record removed (image file not found or not specified)' });
      } catch (dbErr) {
        console.error('Error deleting project record from DB:', dbErr);
        res.status(500).json({ message: 'Error removing project record. ' + dbErr.message });
      }
    }
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
});

export { addProject, getProjects, getProjectById, updateProject, deleteProject };