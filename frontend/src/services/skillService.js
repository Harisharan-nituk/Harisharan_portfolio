// frontend/src/services/skillService.js
import api from './api'; // This imports your configured Axios instance from api.js in the same folder

// Renamed and updated to fetch from the correct endpoint
export const getSkillCategories = async () => {
  try {
    // Calls GET http://localhost:5001/api/skillcategories
    const response = await api.get('/skillcategories');
    return response.data;
  } catch (error) {
    console.error('Error fetching skill categories:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to fetch skill categories');
  }
};

// This updateSkill function is for the OLD /api/skills structure.
// It will NOT work correctly with your /api/skillcategories backend for editing individual skills
// unless your backend has a specific /api/skills/:id route for that.
// We will need to redefine how skills are updated within categories later.
export const updateSkill = async (skillId, skillData) => {
  try {
    console.warn("Attempting to use updateSkill for a flat skill structure. This may not align with the category-based backend. Endpoint: /skills/:id");
    const response = await api.put(`/skills/${skillId}`, skillData); // This still points to /skills/:id
    return response.data;
  } catch (error) {
    console.error('Error updating skill (flat structure):', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to update skill (flat structure)');
  }
};

// TODO: Add new service functions for category and skill-in-category CRUD operations, e.g.:
// --- ADD THIS FUNCTION ---
export const addSkillCategory = async (categoryData) => {
  try {
    // categoryData should be an object like { name: "New Category Name" }
    // The backend should respond with the newly created category object
    const response = await api.post('/skillcategories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Error adding skill category:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to add skill category');
  }
};
export const updateSkillCategory = async (categoryId, categoryData) => {
  try {
    // categoryData should be an object like { name: "Updated Category Name" }
    // The backend should respond with the updated category object
    const response = await api.put(`/skillcategories/${categoryId}`, categoryData);
    return response.data;
  } catch (error) {
    console.error('Error updating skill category:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to update skill category');
  }
};
// --- ADD THIS FUNCTION ---
export const addSkillToCategory = async (categoryId, skillData) => {
  try {
    // skillData could be { name: "Skill Name", description: "Optional description" }
    // Backend should return the updated category with the new skill, or just the new skill object
    // For simplicity, we'll assume backend returns the updated category object or at least the new skill with an _id
    const response = await api.post(`/skillcategories/${categoryId}/skills`, skillData);
    return response.data; // This might be the new skill object or the whole updated category
  } catch (error) {
    console.error(`Error adding skill to category ${categoryId}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to add skill to category');
  }
};
 export const deleteSkillFromCategory = async (categoryId, skillId) => {
  try {
    // Assumes backend expects DELETE /api/skillcategories/:categoryId/skills/:skillId
    // And might return a success message or just a 200/204 status.
    const response = await api.delete(`/skillcategories/${categoryId}/skills/${skillId}`);
    return response.data; // Or handle based on what your backend returns (e.g., status code)
  } catch (error) {
    console.error(`Error deleting skill ${skillId} from category ${categoryId}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to delete skill from category');
  }
};
// --- END
// --- END OF ADDED FUNCTION ---
// etc.