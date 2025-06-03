// frontend/src/pages/AboutPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getSkillCategories,
  addSkillCategory,
  updateSkillCategory,
  addSkillToCategory,
  deleteSkillFromCategory,
} from '../../../services/skillService';

// --- Static Data (Will cause ESLint warnings until used or removed) ---
const aboutMeData = {
  introduction: ["Hello! I'm Harisharan, a passionate Full Stack Developer..."],
  philosophy: "I believe that the best solutions come from..."
};
const educationData = [/* Your static education data */];
const certificationsData = [/* Your static certifications data */];
const achievementsData = [/* Your static achievements data */];
// --- End Static Data ---

const AboutPage = () => {
  const { isAdmin } = useAuth();

  const [skillCategoriesData, setSkillCategoriesData] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [errorSkills, setErrorSkills] = useState(null);

  // --- Add Category Modal State ---
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addCategoryError, setAddCategoryError] = useState(null);

  // --- Edit Category Modal State ---
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [currentEditingCategory, setCurrentEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryError, setEditCategoryError] = useState(null);

  // --- Add Skill to Category Modal State ---
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [categoryForNewSkill, setCategoryForNewSkill] = useState(null);
  const [newSkillForm, setNewSkillForm] = useState({ name: '', description: '' });
  const [addSkillError, setAddSkillError] = useState(null);

  // REMOVED: State for Old Edit Skill Modal as per your request
  // const [isOldEditSkillModalOpen, setIsOldEditSkillModalOpen] = useState(false);
  // const [currentEditingSkill, setCurrentEditingSkill] = useState(null);
  // const [currentEditingCategoryId, setCurrentEditingCategoryId] = useState(null);


  useEffect(() => {
    const fetchSkillData = async () => {
      try {
        setLoadingSkills(true);
        const data = await getSkillCategories();
        setSkillCategoriesData(data || []);
        setErrorSkills(null);
      } catch (error) {
        setErrorSkills(error.message || 'Failed to fetch skill categories');
        setSkillCategoriesData([]);
      } finally {
        setLoadingSkills(false);
      }
    };
    fetchSkillData();
  }, []);

  // --- ADD CATEGORY Modal Handlers ---
  const openAddCategoryModal = () => {
    setNewCategoryName('');
    setAddCategoryError(null);
    setIsAddCategoryModalOpen(true);
  };
  const closeAddCategoryModal = () => {
    setIsAddCategoryModalOpen(false);
    setNewCategoryName('');
    setAddCategoryError(null);
  };
  const handleNewCategoryNameChange = (e) => setNewCategoryName(e.target.value);
  const handleAddNewCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setAddCategoryError('Category name cannot be empty.');
      return;
    }
    setAddCategoryError(null);
    try {
      const newCategory = await addSkillCategory({ name: newCategoryName });
      setSkillCategoriesData(prevCategories => [...prevCategories, newCategory]);
      closeAddCategoryModal();
    } catch (error) {
      setAddCategoryError(error.message || 'Failed to add category. Please try again.');
    }
  };
  // --- END ADD CATEGORY Modal Handlers ---

  // --- EDIT CATEGORY Modal Handlers ---
  const openEditCategoryModal = (category) => {
    setCurrentEditingCategory(category);
    setEditCategoryName(category.name);
    setEditCategoryError(null);
    setIsEditCategoryModalOpen(true);
  };
  const closeEditCategoryModal = () => {
    setIsEditCategoryModalOpen(false);
    setCurrentEditingCategory(null);
    setEditCategoryName('');
    setEditCategoryError(null);
  };
  const handleEditCategoryNameChange = (e) => {
    setEditCategoryName(e.target.value);
  };
  const handleUpdateCategorySubmit = async (e) => {
    e.preventDefault();
    if (!currentEditingCategory || !editCategoryName.trim()) {
      setEditCategoryError('Category name cannot be empty.');
      return;
    }
    setEditCategoryError(null);
    try {
      const updatedCategory = await updateSkillCategory(currentEditingCategory._id, { name: editCategoryName });
      setSkillCategoriesData(prevCategories =>
        prevCategories.map(cat => cat._id === updatedCategory._id ? updatedCategory : cat)
      );
      closeEditCategoryModal();
    } catch (error) {
      setEditCategoryError(error.message || 'Failed to update category. Please try again.');
    }
  };
  // --- END EDIT CATEGORY Modal Handlers ---

  // --- ADD SKILL TO CATEGORY MODAL Handlers ---
  const openAddSkillModal = (category) => {
    setCategoryForNewSkill(category);
    setNewSkillForm({ name: '', description: '' });
    setAddSkillError(null);
    setIsAddSkillModalOpen(true);
  };
  const closeAddSkillModal = () => {
    setIsAddSkillModalOpen(false);
    setCategoryForNewSkill(null);
    setNewSkillForm({ name: '', description: '' });
    setAddSkillError(null);
  };
  const handleNewSkillFormChange = (e) => {
    const { name, value } = e.target;
    setNewSkillForm(prevState => ({ ...prevState, [name]: value }));
  };
  const handleAddSkillSubmit = async (e) => {
    e.preventDefault();
    if (!categoryForNewSkill || !newSkillForm.name.trim()) {
      setAddSkillError('Skill name cannot be empty.');
      return;
    }
    setAddSkillError(null);
    try {
      const addedSkill = await addSkillToCategory(categoryForNewSkill._id, newSkillForm);
      setSkillCategoriesData(prevCategories =>
        prevCategories.map(cat => {
          if (cat._id === categoryForNewSkill._id) {
            return {
              ...cat,
              skills: [...(cat.skills || []), addedSkill]
            };
          }
          return cat;
        })
      );
      closeAddSkillModal();
    } catch (error) {
      console.error("Error in handleAddSkillSubmit:", error);
      setAddSkillError(error.message || 'Failed to add skill. Please try again.');
    }
  };
  // --- END ADD SKILL TO CATEGORY MODAL Handlers ---

  // --- DELETE SKILL FROM CATEGORY Handler ---
  const handleDeleteSkillFromCategory = async (skillToDelete, categoryId) => {
    if (!skillToDelete || !skillToDelete._id || !categoryId) {
      console.error("Missing skill ID or category ID for deletion");
      return;
    }
    if (window.confirm(`Are you sure you want to delete the skill "${skillToDelete.name}"?`)) {
      try {
        await deleteSkillFromCategory(categoryId, skillToDelete._id);
        setSkillCategoriesData(prevCategories =>
          prevCategories.map(cat => {
            if (cat._id === categoryId) {
              return {
                ...cat,
                skills: cat.skills.filter(skill => skill._id !== skillToDelete._id)
              };
            }
            return cat;
          })
        );
      } catch (error) {
        console.error("Failed to delete skill:", error);
        alert(`Error deleting skill: ${error.message || 'Please try again.'}`);
      }
    }
  };
  // --- END DELETE SKILL FROM CATEGORY ---

  // --- Other Placeholder Handlers ---
  const handleDeleteCategory = (category) => console.log('TODO: Delete Category:', category);
  // REMOVED: openOldEditSkillModal and closeOldEditSkillModal as per your request

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-16 md:space-y-20">
        {/* Who I Am Section */}
        <section id="who-i-am" className="bg-white dark:bg-slate-800 p-6 sm:p-10 rounded-xl shadow-xl transition-colors duration-300">
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Who I Am</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed text-base sm:text-lg">
              {aboutMeData.introduction.map((paragraph, index) => ( <p key={index}>{paragraph}</p> ))}
              {aboutMeData.philosophy && ( <p className="mt-6 italic border-l-4 border-indigo-500 dark:border-indigo-400 pl-4 py-3 bg-indigo-50 dark:bg-slate-700/60 rounded-r-md"> "{aboutMeData.philosophy}" </p> )}
            </div>
        </section>

        {/* Skills Section */}
        <section id="skills">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left flex-grow mb-4 sm:mb-0">
                  Technical Skills
              </h2>
              {isAdmin && ( <button onClick={openAddCategoryModal} className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md text-sm transition-colors duration-150"> Add New Category </button> )}
          </div>

          {loadingSkills && ( <div className="text-center py-10 dark:text-gray-300"><p>Loading skills...</p></div> )}
          {errorSkills && ( <div className="text-center py-10 text-red-500 bg-red-100 dark:bg-red-900/30 p-4 rounded-md"><p>Error: {errorSkills}</p></div> )}

          {!loadingSkills && !errorSkills && skillCategoriesData.length === 0 && (
              <div className="text-center py-10 text-gray-500 bg-gray-50 dark:bg-slate-800 p-6 rounded-xl shadow-md">
                  <p>No skill categories have been added yet.</p>
                  {isAdmin && ( <button onClick={openAddCategoryModal} className="mt-4 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md text-sm transition-colors duration-150"> Add First Category </button> )}
              </div>
          )}

          {!loadingSkills && !errorSkills && skillCategoriesData.length > 0 && (
            <div className="space-y-10">
              {skillCategoriesData.map((category) => (
                <div key={category._id} className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl sm:text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                      {category.name}
                    </h3>
                    {isAdmin && (
                      <div className="flex gap-2 items-center">
                        <button onClick={() => openAddSkillModal(category)} title="Add Skill to this Category" className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-xs p-1 font-medium transition-colors duration-150">Add Skill</button>
                        <button onClick={() => openEditCategoryModal(category)} title="Edit Category Name" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs p-1 font-medium transition-colors duration-150">Edit Cat.</button>
                        <button onClick={() => handleDeleteCategory(category)} title="Delete Category" className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs p-1 font-medium transition-colors duration-150">Del. Cat.</button>
                      </div>
                    )}
                  </div>
                  {(category.skills && category.skills.length > 0) ? (
                    <div className="flex flex-wrap gap-3">
                      {category.skills.map((skill) => (
                        <div key={skill._id} className="group bg-indigo-100 dark:bg-slate-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm flex items-center gap-2">
                          <span className="text-indigo-800 dark:text-indigo-300">{skill.name}</span>
                          {isAdmin && (
                            <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              {/* REMOVED: "E" (Edit Skill) button as per your request */}
                              <button onClick={() => handleDeleteSkillFromCategory(skill, category._id)} title="Delete Skill" className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 text-xs transition-colors duration-150"> X </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : ( <p className="text-sm text-gray-500 dark:text-gray-400">No skills listed in this category. Click "Add Skill" to add some!</p> )}
                </div>
              ))}
            </div>
          )}
        </section>
        {/* TODO: Add JSX for Education, Certifications, Achievements sections to use the static data and remove ESLint warnings */}
      </div>

      {/* --- ADD SKILL CATEGORY MODAL --- */}
      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Add New Skill Category</h2>
              <button onClick={closeAddCategoryModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl transition-colors duration-150">&times;</button>
            </div>
            <form onSubmit={handleAddNewCategorySubmit} className="space-y-6">
              <div>
                <label htmlFor="newCategoryNameInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category Name</label>
                <input type="text" id="newCategoryNameInput" value={newCategoryName} onChange={handleNewCategoryNameChange} required className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white sm:text-sm" placeholder="e.g., Languages, Frameworks"/>
              </div>
              {addCategoryError && ( <p className="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{addCategoryError}</p> )}
              <div className="flex justify-end gap-4 pt-2">
                <button type="button" onClick={closeAddCategoryModal} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg shadow-sm transition-colors duration-150">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 rounded-lg shadow-sm transition-colors duration-150">Add Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- END ADD SKILL CATEGORY MODAL --- */}

      {/* --- EDIT SKILL CATEGORY MODAL --- */}
      {isEditCategoryModalOpen && currentEditingCategory && (
         <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Edit Skill Category</h2>
              <button onClick={closeEditCategoryModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl transition-colors duration-150">&times;</button>
            </div>
            <form onSubmit={handleUpdateCategorySubmit} className="space-y-6">
              <div>
                <label htmlFor="editCategoryNameInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category Name</label>
                <input type="text" id="editCategoryNameInput" value={editCategoryName} onChange={handleEditCategoryNameChange} required className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white sm:text-sm" />
              </div>
              {editCategoryError && ( <p className="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{editCategoryError}</p> )}
              <div className="flex justify-end gap-4 pt-2">
                <button type="button" onClick={closeEditCategoryModal} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg shadow-sm transition-colors duration-150">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 rounded-lg shadow-sm transition-colors duration-150">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- END EDIT SKILL CATEGORY MODAL --- */}

      {/* --- ADD SKILL TO CATEGORY MODAL --- */}
      {isAddSkillModalOpen && categoryForNewSkill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Add Skill to "{categoryForNewSkill.name}"</h2>
              <button onClick={closeAddSkillModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl transition-colors duration-150">&times;</button>
            </div>
            <form onSubmit={handleAddSkillSubmit} className="space-y-6">
              <div>
                <label htmlFor="newSkillNameInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skill Name</label>
                <input
                  type="text"
                  id="newSkillNameInput"
                  name="name"
                  value={newSkillForm.name}
                  onChange={handleNewSkillFormChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white sm:text-sm"
                  placeholder="e.g., React, Node.js"
                />
              </div>
              <div>
                <label htmlFor="newSkillDescriptionInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                <textarea
                  id="newSkillDescriptionInput"
                  name="description"
                  value={newSkillForm.description}
                  onChange={handleNewSkillFormChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white sm:text-sm"
                  placeholder="Briefly describe the skill or your experience with it."
                />
              </div>
              {addSkillError && ( <p className="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{addSkillError}</p> )}
              <div className="flex justify-end gap-4 pt-2">
                <button type="button" onClick={closeAddSkillModal} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg shadow-sm transition-colors duration-150">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:hover:bg-green-500 rounded-lg shadow-sm transition-colors duration-150">Add Skill</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- END ADD SKILL TO CATEGORY MODAL --- */}

      {/* REMOVED: Old Edit Skill Modal JSX as per your request */}

    </>
  );
};

export default AboutPage;