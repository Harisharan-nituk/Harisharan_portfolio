// backend/controllers/dashboardController.js
import asyncHandler from 'express-async-handler';
import Project from '../models/Project.js';
import Resume from '../models/Resume.js';
import Message from '../models/Message.js';
import SkillCategory from '../models/SkillCategory.js';

// @desc    Get dashboard summary data (counts and recent messages)
// @route   GET /api/admin/dashboard-summary
// @access  Private/Admin
const getDashboardSummary = asyncHandler(async (req, res) => {
  try {
    // Perform counting operations in parallel
    const [
      projectCount,
      resumeCount,
      messageCount,
      skillCategoryCount
    ] = await Promise.all([
      Project.countDocuments({}),
      Resume.countDocuments({}),
      Message.countDocuments({}),
      SkillCategory.countDocuments({})
    ]);

    // Get the 5 most recent contact messages
    const recentMessages = await Message.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate total number of individual skills
    const categories = await SkillCategory.find({}, 'skills');
    const totalSkills = categories.reduce((acc, category) => acc + category.skills.length, 0);

    res.json({
      stats: {
        projects: projectCount,
        resumes: resumeCount,
        messages: messageCount,
        skills: totalSkills
      },
      recentMessages
    });

  } catch (error) {
    res.status(500);
    throw new Error('Server error fetching dashboard summary: ' + error.message);
  }
});

export { getDashboardSummary };