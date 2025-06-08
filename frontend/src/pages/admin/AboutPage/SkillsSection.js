// portfolio_py/frontend/src/pages/admin/AboutPage/SkillsSection.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext'; // Adjusted path
import * as skillService from '../../../services/skillService'; // Adjusted path

const SkillsSection = () => {
  const { isAdmin } = useAuth();
  const [skillCategories, setSkillCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  // Add Category Modal State
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState({ name: '' });

  // Edit Category Modal State
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [currentEditingCategory, setCurrentEditingCategory] = useState(null);
  const [editCategoryForm, setEditCategoryForm] = useState({ name: '' });

  // Add Skill to Category Modal State
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [categoryForNewSkill, setCategoryForNewSkill] = useState(null);
  const [newSkillName, setNewSkillName] = useState('');

  // --- CORRECTED: Added missing useState declarations ---
  const [showDeleteSkillConfirmation, setShowDeleteSkillConfirmation] = useState(false);
  const [skillToDeleteDetails, setSkillToDeleteDetails] = useState(null); // Will store { categoryId, categoryName, skillName }

  const displayFeedback = (message, type = 'success') => {
    setActionMessage({ text: message, type });
    setShowDeleteSkillConfirmation(false); // Hide confirmation when feedback is shown
    setSkillToDeleteDetails(null);
    setTimeout(() => setActionMessage({ text: '', type: '' }), 4000);
  };

  const fetchSkillCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await skillService.getSkillCategories();
      setSkillCategories(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch skill categories.');
      setSkillCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillCategories();
  }, []);

  // --- Category CRUD Handlers ---
  const handleOpenAddCategoryModal = () => {
    setNewCategoryForm({ name: '' });
    setIsAddCategoryModalOpen(true);
    setActionMessage({ text: '', type: '' });
  };
  const handleAddCategoryChange = (e) => {
    const { name, value } = e.target;
    setNewCategoryForm(prev => ({ ...prev, [name]: value }));
  };
  const handleAddCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategoryForm.name.trim()) {
      displayFeedback('Category name cannot be empty.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await skillService.addSkillCategory(newCategoryForm);
      displayFeedback('Category added successfully!', 'success');
      fetchSkillCategories();
      setIsAddCategoryModalOpen(false);
    } catch (err) {
      displayFeedback(err.message || 'Failed to add category.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditCategoryModal = (category) => {
    setCurrentEditingCategory(category);
    setEditCategoryForm({ name: category.name });
    setIsEditCategoryModalOpen(true);
    setActionMessage({ text: '', type: '' });
  };
  const handleEditCategoryChange = (e) => {
    const { name, value } = e.target;
    setEditCategoryForm(prev => ({ ...prev, [name]: value }));
  };
  const handleEditCategorySubmit = async (e) => {
    e.preventDefault();
    if (!editCategoryForm.name.trim() || !currentEditingCategory) {
      displayFeedback('Category name cannot be empty.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await skillService.updateSkillCategory(currentEditingCategory._id, editCategoryForm);
      displayFeedback('Category updated successfully!', 'success');
      fetchSkillCategories();
      setIsEditCategoryModalOpen(false);
      setCurrentEditingCategory(null);
    } catch (err) {
      displayFeedback(err.message || 'Failed to update category.', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteCategory = async (categoryId, categoryName) => {
    // For category deletion, window.confirm can still be used, or implement a similar custom modal.
    if (window.confirm(`Are you sure you want to delete the category "${categoryName}" and all its skills? This is permanent.`)) {
      setIsLoading(true);
      try {
        await skillService.deleteSkillCategory(categoryId);
        displayFeedback(`Category "${categoryName}" deleted successfully.`, 'success');
        fetchSkillCategories();
      } catch (err) {
        displayFeedback(err.message || `Failed to delete category "${categoryName}".`, 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // --- Skill (within Category) CRUD Handlers ---
  const handleOpenAddSkillModal = (category) => {
    setCategoryForNewSkill(category);
    setNewSkillName('');
    setIsAddSkillModalOpen(true);
    setActionMessage({ text: '', type: '' });
  };
  const handleAddSkillSubmit = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim() || !categoryForNewSkill) {
      displayFeedback('Skill name cannot be empty.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await skillService.addSkillToCategory(categoryForNewSkill._id, { name: newSkillName.trim() });
      displayFeedback(`Skill "${newSkillName.trim()}" added to "${categoryForNewSkill.name}".`, 'success');
      fetchSkillCategories();
      setIsAddSkillModalOpen(false);
      setCategoryForNewSkill(null);
    } catch (err) {
      displayFeedback(err.message || 'Failed to add skill.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSkill = (categoryId, categoryName, skillName) => {
    if (typeof skillName !== 'string' || !skillName.trim()) {
        displayFeedback('Cannot delete an invalid skill name.', 'error');
        console.error('Attempted to delete skill with invalid name:', skillName);
        return;
    }
    setActionMessage({text: '', type: ''}); // Clear previous feedback before showing confirmation
    setSkillToDeleteDetails({ categoryId, categoryName, skillName });
    setShowDeleteSkillConfirmation(true);
  };

  const executeDeleteSkill = async () => {
    if (!skillToDeleteDetails) return;
    const { categoryId, categoryName, skillName } = skillToDeleteDetails;

    setIsLoading(true);
    // setShowDeleteSkillConfirmation(false); // Hide confirmation immediately or wait for feedback
    try {
      await skillService.deleteSkillFromCategory(categoryId, skillName);
      displayFeedback(`Skill "${skillName}" deleted from "${categoryName}".`, 'success'); // This will also hide confirmation
      fetchSkillCategories();
    } catch (err) {
      displayFeedback(err.message || `Failed to delete skill "${skillName}".`, 'error'); // This will also hide confirmation
    } finally {
      setIsLoading(false);
      // setSkillToDeleteDetails(null); // Already handled in displayFeedback
    }
  };

  const cancelDeleteSkill = () => {
    setShowDeleteSkillConfirmation(false);
    setSkillToDeleteDetails(null);
  };

  // --- Render Logic ---
  // Conditional rendering for initial loading state, ensuring confirmation UI isn't hidden by it
  if (isLoading && skillCategories.length === 0 && !showDeleteSkillConfirmation && !actionMessage.text) {
    return <div className="p-6 text-center dark:text-gray-300">Loading skills...</div>;
  }
  // Conditional rendering for initial error state
  if (error && skillCategories.length === 0 && !actionMessage.text && !showDeleteSkillConfirmation) {
    return <div className="p-6 text-center text-red-500 bg-red-100 dark:bg-red-900/30 rounded-md">Error: {error}</div>;
  }

  return (
    <section id="skills">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left flex-grow mb-4 sm:mb-0">
          Skills
        </h2>
        {isAdmin && (
          <button onClick={handleOpenAddCategoryModal} className="btn-primary text-sm py-2 px-4">
            Add New Category
          </button>
        )}
      </div>

      {/* General error display if categories already loaded but a general error occurred (and no specific action/confirmation is active) */}
      {error && skillCategories.length > 0 && !actionMessage.text && !showDeleteSkillConfirmation && (
         <div className="mb-4 text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded">{error}</div>
      )}

      {!isLoading && skillCategories.length === 0 && !showDeleteSkillConfirmation && !actionMessage.text && (
        <div className="text-center py-10 text-gray-500 bg-gray-50 dark:bg-slate-800 p-6 rounded-xl shadow-md">
          <p>No skill categories have been added yet.</p>
          {isAdmin && (
            <button onClick={handleOpenAddCategoryModal} className="mt-4 btn-primary text-sm py-2 px-4">
              Add First Category
            </button>
          )}
        </div>
      )}

      <div className="space-y-10">
        {skillCategories.map((category) => (
          <div key={category._id} className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl sm:text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                {category.name}
              </h3>
              {isAdmin && (
                <div className="flex gap-2 items-center flex-wrap">
                  <button onClick={() => handleOpenAddSkillModal(category)} className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-xs p-1 font-medium">Add Skill</button>
                  <button onClick={() => handleOpenEditCategoryModal(category)} className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs p-1 font-medium">Edit Cat.</button>
                  <button onClick={() => handleDeleteCategory(category._id, category.name)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs p-1 font-medium">Del. Cat.</button>
                </div>
              )}
            </div>
            {(category.skills && category.skills.length > 0) ? (
              <div className="flex flex-wrap gap-3">
                {category.skills.map((skill, index) => (
                  <div key={`${skill}-${index}-cat-${category._id}`} className="group bg-indigo-100 dark:bg-slate-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm flex items-center gap-2">
                    <span className="text-indigo-800 dark:text-indigo-300">{skill}</span>
                    {isAdmin && (
                      <button 
                        onClick={() => handleDeleteSkill(category._id, category.name, skill)} 
                        title="Delete Skill" 
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-0.5 text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{ lineHeight: '1' }}
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : ( <p className="text-sm text-gray-500 dark:text-gray-400">No skills listed. {isAdmin && 'Click "Add Skill".'}</p> )}
          </div>
        ))}
      </div>

      <div className="mt-8 mb-4 text-center min-h-[60px]"> {/* Added min-h to prevent layout shift */}
        {showDeleteSkillConfirmation && skillToDeleteDetails && (
          <div className="p-4 mb-4 rounded-md bg-yellow-100 dark:bg-yellow-700/50 border border-yellow-300 dark:border-yellow-600">
            <p className="text-sm text-yellow-700 dark:text-yellow-200 mb-3">
              Are you sure you want to delete "<strong>{skillToDeleteDetails.skillName}</strong>" 
              from "<strong>{skillToDeleteDetails.categoryName}</strong>"?
            </p>
            <button onClick={executeDeleteSkill} className="btn-danger bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-3 rounded mr-2">
              Confirm Delete
            </button>
            <button onClick={cancelDeleteSkill} className="btn-secondary text-xs py-1 px-3 rounded">
              Cancel
            </button>
          </div>
        )}
        {actionMessage.text && !showDeleteSkillConfirmation && (
          <div className={`p-3 rounded-md text-sm ${actionMessage.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-800/30 dark:text-red-300'}`}>
            {actionMessage.text}
          </div>
        )}
      </div>

      {/* --- Modals --- */}
      {/* Add Category Modal */}
      {isAddCategoryModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md">
            <form onSubmit={handleAddCategorySubmit} className="space-y-4">
              <h2 className="text-xl font-semibold dark:text-white mb-4">Add New Skill Category</h2>
              <div>
                <label htmlFor="newCategoryName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category Name</label>
                <input type="text" name="name" id="newCategoryName" value={newCategoryForm.name} onChange={handleAddCategoryChange} required className="mt-1 input-style w-full" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsAddCategoryModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isLoading} className="btn-primary">{isLoading ? 'Adding...' : 'Add Category'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Category Modal */}
      {isEditCategoryModalOpen && isAdmin && currentEditingCategory && (
         <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
           <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md">
            <form onSubmit={handleEditCategorySubmit} className="space-y-4">
              <h2 className="text-xl font-semibold dark:text-white mb-4">Edit Skill Category: {currentEditingCategory.name}</h2>
              <div>
                <label htmlFor="editCategoryName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category Name</label>
                <input type="text" name="name" id="editCategoryName" value={editCategoryForm.name} onChange={handleEditCategoryChange} required className="mt-1 input-style w-full" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsEditCategoryModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isLoading} className="btn-primary">{isLoading ? 'Updating...' : 'Save Changes'}</button>
              </div>
            </form>
           </div>
         </div>
      )}
      {/* Add Skill Modal */}
      {isAddSkillModalOpen && isAdmin && categoryForNewSkill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md">
            <form onSubmit={handleAddSkillSubmit} className="space-y-4">
              <h2 className="text-xl font-semibold dark:text-white mb-4">Add Skill to "{categoryForNewSkill.name}"</h2>
              <div>
                <label htmlFor="newSkillNameInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Skill Name</label>
                <input type="text" id="newSkillNameInput" value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} required className="mt-1 input-style w-full" placeholder="e.g., React, Node.js"/>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsAddSkillModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isLoading} className="btn-primary">{isLoading ? 'Adding...' : 'Add Skill'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default SkillsSection;