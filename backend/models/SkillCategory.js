// backend/models/SkillCategory.js
import mongoose from 'mongoose';

const skillCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    skills: {
      type: [String], // Array of strings
      default: [],
    },
    displayOrder: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

skillCategorySchema.index({ name: 1 });
skillCategorySchema.index({ displayOrder: 1, createdAt: -1 });

const SkillCategory = mongoose.model('SkillCategory', skillCategorySchema);
export default SkillCategory;