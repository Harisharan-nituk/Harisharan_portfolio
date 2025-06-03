// frontend/src/pages/ProjectsPage.js
import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Your Axios instance
import { useAuth } from '../contexts/AuthContext'; // To get admin status
import ProjectCard from '../components/projects/ProjectCard'; // The card component we just created
// import LoadingSpinner from '../components/common/LoadingSpinner'; // Assuming you have this

const ProjectsPage = () => {
  const { isAdmin, isLoadingAuth } = useAuth(); // Get admin status and auth loading state
  const [projects, setProjects] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  // State for Add Project Form/Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    projectLink: '',
    githubUrl: '',
    technologies: '', // Will be comma-separated string from input
  });
  const [newProjectImage, setNewProjectImage] = useState(null);

  // State for Edit Project Form/Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // Stores the full project object being edited
  const [editProjectData, setEditProjectData] = useState({
    title: '',
    description: '',
    projectLink: '',
    githubUrl: '',
    technologies: '',
  });
  const [editProjectImage, setEditProjectImage] = useState(null);

  const displayMessage = (message, type = 'success') => {
    setActionMessage({ text: message, type });
    setTimeout(() => setActionMessage(''), 3000);
  };

  const fetchProjects = async () => {
    setIsLoadingData(true);
    setError(null);
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err.response?.data?.message || "Failed to load projects.");
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // --- Add Project Handlers ---
  const handleNewProjectChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const handleNewProjectImageChange = (e) => {
    setNewProjectImage(e.target.files[0]);
  };

  const handleAddNewProjectSubmit = async (e) => {
    e.preventDefault();
    if (!newProject.title || !newProject.description) {
      displayMessage("Title and description are required.", 'error');
      return;
    }
    setIsLoadingData(true);
    const formData = new FormData();
    formData.append('title', newProject.title);
    formData.append('description', newProject.description);
    formData.append('projectLink', newProject.projectLink || '');
    formData.append('githubUrl', newProject.githubUrl || '');
    formData.append('technologies', newProject.technologies); // Backend controller splits comma-separated string
    if (newProjectImage) {
      formData.append('projectImage', newProjectImage);
    }

    try {
      await api.post('/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      displayMessage(`Project "${newProject.title}" added successfully!`, 'success');
      setShowAddModal(false);
      setNewProject({ title: '', description: '', projectLink: '', githubUrl: '', technologies: '' });
      setNewProjectImage(null);
      const addProjectImageInput = document.getElementById('addProjectImage');
      if (addProjectImageInput) addProjectImageInput.value = null;
      fetchProjects();
    } catch (err) {
      console.error("Error adding project:", err.response || err);
      displayMessage(err.response?.data?.message || "Failed to add project.", 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  // --- Edit Project Handlers ---
  const openEditModal = (project) => {
    setEditingProject(project);
    setEditProjectData({
      title: project.title,
      description: project.description,
      projectLink: project.projectLink || '',
      githubUrl: project.githubUrl || '',
      technologies: project.technologies ? project.technologies.join(', ') : '', // Join array to comma-separated string for input
    });
    setEditProjectImage(null);
    const editProjectImageInput = document.getElementById('editProjectImage');
    if (editProjectImageInput) editProjectImageInput.value = null;
    setShowEditModal(true);
    setShowAddModal(false);
    setActionMessage('');
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingProject(null);
  };

  const handleEditProjectChange = (e) => {
    setEditProjectData({ ...editProjectData, [e.target.name]: e.target.value });
  };

  const handleEditProjectImageChange = (e) => {
    setEditProjectImage(e.target.files[0]);
  };

  const handleEditProjectSubmit = async (e) => {
    e.preventDefault();
    if (!editingProject || !editProjectData.title || !editProjectData.description) {
      displayMessage("Title and description are required for update.", 'error');
      return;
    }
    setIsLoadingData(true);
    const formData = new FormData();
    formData.append('title', editProjectData.title);
    formData.append('description', editProjectData.description);
    formData.append('projectLink', editProjectData.projectLink || '');
    formData.append('githubUrl', editProjectData.githubUrl || '');
    formData.append('technologies', editProjectData.technologies);
    if (editProjectImage) {
      formData.append('projectImage', editProjectImage);
    }

    try {
      await api.put(`/projects/${editingProject._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      displayMessage(`Project "${editProjectData.title}" updated successfully!`, 'success');
      closeEditModal();
      fetchProjects();
    } catch (err) {
      console.error("Error updating project:", err.response || err);
      displayMessage(err.response?.data?.message || "Failed to update project.", 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  // --- Delete Project Handler ---
  const handleDeleteProject = async (projectId, projectTitle) => {
    if (!isAdmin) return;
    if (window.confirm(`Are you sure you want to delete the project "${projectTitle}"? This is permanent.`)) {
      setIsLoadingData(true);
      try {
        await api.delete(`/projects/${projectId}`);
        displayMessage(`Project "${projectTitle}" deleted successfully!`, 'success');
        fetchProjects();
      } catch (err) {
        displayMessage(err.response?.data?.message || 'Failed to delete project.', 'error');
        setIsLoadingData(false); 
      }
    }
  };


  if (isLoadingAuth) {
    return <div className="text-center py-20 text-gray-500 text-lg">Authenticating...</div>;
  }
  if (isLoadingData && projects.length === 0 && !error && !showAddModal && !showEditModal) {
    // return <LoadingSpinner />; // Use your spinner if available
    return <div className="text-center py-10 text-gray-500">Loading projects...</div>;
  }
  if (error && projects.length === 0 && !showAddModal && !showEditModal) {
    return <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-md">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-10 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center sm:text-left">
          {isAdmin ? 'Manage Projects' : 'My Projects'}
        </h1>
        {isAdmin && (
          <button
            onClick={() => { setShowAddModal(true); setShowEditModal(false); setActionMessage(''); }}
            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300"
          >
            Add New Project
          </button>
        )}
      </div>

      {actionMessage && (
        <div className={`p-4 mb-6 rounded-md text-sm text-center ${actionMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} role="alert">
          {actionMessage.text}
        </div>
      )}
      {error && (projects.length > 0 || showAddModal || showEditModal) && !actionMessage && (
         <div className="mb-4 text-center text-red-500 bg-red-100 p-3 rounded">{error}</div>
      )}

      {/* Add Project Modal/Form */}
      {isAdmin && showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-40 flex justify-center items-center p-4">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalFadeIn">
            <style jsx global>{` @keyframes modalFadeIn { to { opacity: 1; transform: scale(1); } } .animate-modalFadeIn { animation: modalFadeIn 0.2s ease-out forwards; } `}</style>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-700">Add New Project</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleAddNewProjectSubmit} className="space-y-4">
              <div><label htmlFor="title" className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label><input type="text" name="title" id="title" value={newProject.title} onChange={handleNewProjectChange} required className="mt-1 w-full input-style" /></div>
              <div><label htmlFor="description" className="block text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label><textarea name="description" id="description" rows="4" value={newProject.description} onChange={handleNewProjectChange} required className="mt-1 w-full input-style"></textarea></div>
              <div><label htmlFor="technologies" className="block text-sm font-medium text-gray-700">Technologies (comma-separated)</label><input type="text" name="technologies" id="technologies" value={newProject.technologies} onChange={handleNewProjectChange} className="mt-1 w-full input-style" /></div>
              <div><label htmlFor="projectLink" className="block text-sm font-medium text-gray-700">Project Link (Live URL)</label><input type="url" name="projectLink" id="projectLink" value={newProject.projectLink} onChange={handleNewProjectChange} className="mt-1 w-full input-style" /></div>
              <div><label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700">GitHub URL</label><input type="url" name="githubUrl" id="githubUrl" value={newProject.githubUrl} onChange={handleNewProjectChange} className="mt-1 w-full input-style" /></div>
              <div><label htmlFor="addProjectImage" className="block text-sm font-medium text-gray-700">Project Image</label><input type="file" id="addProjectImage" name="projectImage" accept="image/*" onChange={handleNewProjectImageChange} className="mt-1 file-input-style" /></div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isLoadingData} className="btn-primary disabled:opacity-70">{isLoadingData && showAddModal ? 'Adding...' : 'Add Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal/Form */}
      {isAdmin && showEditModal && editingProject && (
         <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-40 flex justify-center items-center p-4">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalFadeIn">
             <style jsx global>{` @keyframes modalFadeIn { to { opacity: 1; transform: scale(1); } } .animate-modalFadeIn { animation: modalFadeIn 0.2s ease-out forwards; } `}</style>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-700">Edit Project: <span className="font-normal italic">{editingProject.title}</span></h2>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 focus:outline-none">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleEditProjectSubmit} className="space-y-4">
              <div><label htmlFor="editTitle" className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label><input type="text" name="title" id="editTitle" value={editProjectData.title} onChange={handleEditProjectChange} required className="mt-1 w-full input-style" /></div>
              <div><label htmlFor="editDescription" className="block text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label><textarea name="description" id="editDescription" rows="4" value={editProjectData.description} onChange={handleEditProjectChange} required className="mt-1 w-full input-style"></textarea></div>
              <div><label htmlFor="editTechnologies" className="block text-sm font-medium text-gray-700">Technologies (comma-separated)</label><input type="text" name="technologies" id="editTechnologies" value={editProjectData.technologies} onChange={handleEditProjectChange} className="mt-1 w-full input-style" /></div>
              <div><label htmlFor="editProjectLink" className="block text-sm font-medium text-gray-700">Project Link (Live URL)</label><input type="url" name="projectLink" id="editProjectLink" value={editProjectData.projectLink} onChange={handleEditProjectChange} className="mt-1 w-full input-style" /></div>
              <div><label htmlFor="editGithubUrl" className="block text-sm font-medium text-gray-700">GitHub URL</label><input type="url" name="githubUrl" id="editGithubUrl" value={editProjectData.githubUrl} onChange={handleEditProjectChange} className="mt-1 w-full input-style" /></div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Image: {editingProject.storedImageFilename || 'None'}</p>
                <label htmlFor="editProjectImage" className="block text-sm font-medium text-gray-700">New Project Image (Optional)</label>
                <input type="file" id="editProjectImage" name="projectImage" accept="image/*" onChange={handleEditProjectImageChange} className="mt-1 file-input-style" />
                {editProjectImage && <p className="text-xs text-gray-500 mt-1">New image selected: {editProjectImage.name}</p>}
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={closeEditModal} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isLoadingData} className="btn-primary disabled:opacity-70">{isLoadingData && showEditModal ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {projects.length > 0 ? projects.map((project) => (
          <ProjectCard
            key={project._id}
            project={project}
            onUpdate={openEditModal}    // Pass function to open edit modal
            onDelete={handleDeleteProject} // Pass delete handler
            isAdminView={isAdmin}       // Pass admin status
          />
        )) : (
          !isLoadingData && !showAddModal && !showEditModal &&
          <p className="md:col-span-2 lg:col-span-3 text-center text-gray-500 py-10 text-lg">
            No projects currently available.
            {isAdmin && ' Click "Add New Project" to get started!'}
          </p>
        )}
      </div>
      {isLoadingData && (projects.length > 0 || showAddModal || showEditModal) && (
        <div className="text-center py-5 text-sm text-gray-500">Processing...</div>
      )}
    </div>
  );
};

// Helper for shared input styles (optional - or use Tailwind @apply in CSS)
// Define input-style and file-input-style in your global CSS or here
const inputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
const fileInputStyle = "mt-1 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer";
// For buttons, you might define btn-primary, btn-secondary in your index.css too

export default ProjectsPage;