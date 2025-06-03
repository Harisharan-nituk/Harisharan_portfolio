// backend/models/Project.js
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
    },
    imageUrl: { 
      type: String, 
    },
    storedImageFilename: { 
      type: String,
    },
    projectLink: { 
      type: String,
      trim: true,
    },
    githubUrl: { 
      type: String,
      trim: true,
    },
    technologies: { 
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, 
  }
);

const Project = mongoose.model('Project', projectSchema);

export default Project;