// frontend/src/pages/ProjectsPage.js
import React, { useState, useEffect } from 'react';
import api from '../services/api'; 
import { useAuth } from '../contexts/AuthContext'; 
import ProjectCard from '../components/projects/ProjectCard'; 
import { motion } from 'framer-motion';
import ConfirmationModal from '../components/common/ConfirmationModal';

const ProjectsPage = () => {
  const { isAdmin, isLoadingAuth } = useAuth(); 
  const [projects, setProjects] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', projectLink: '', githubUrl: '', technologies: '' });
  const [newProjectImage, setNewProjectImage] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null); 
  const [editProjectData, setEditProjectData] = useState({ title: '', description: '', projectLink: '', githubUrl: '', technologies: '' });
  const [editProjectImage, setEditProjectImage] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5 } } };

  const displayMessage = (message, type = 'success') => { setActionMessage({ text: message, type }); setTimeout(() => setActionMessage(''), 3000); };

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

  useEffect(() => { fetchProjects(); }, []);

  const handleNewProjectChange = (e) => setNewProject({ ...newProject, [e.target.name]: e.target.value });
  const handleNewProjectImageChange = (e) => setNewProjectImage(e.target.files[0]);

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
    formData.append('technologies', newProject.technologies); 
    if (newProjectImage) formData.append('projectImage', newProjectImage);

    try {
      await api.post('/projects', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      displayMessage(`Project "${newProject.title}" added successfully!`, 'success');
      setShowAddModal(false);
      setNewProject({ title: '', description: '', projectLink: '', githubUrl: '', technologies: '' });
      setNewProjectImage(null);
      fetchProjects();
    } catch (err) {
      displayMessage(err.response?.data?.message || "Failed to add project.", 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setEditProjectData({ title: project.title, description: project.description, projectLink: project.projectLink || '', githubUrl: project.githubUrl || '', technologies: project.technologies ? project.technologies.join(', ') : '' });
    setEditProjectImage(null);
    setShowEditModal(true);
    setShowAddModal(false);
    setActionMessage('');
  };
  const closeEditModal = () => { setShowEditModal(false); setEditingProject(null); };
  const handleEditProjectChange = (e) => setEditProjectData({ ...editProjectData, [e.target.name]: e.target.value });
  const handleEditProjectImageChange = (e) => setEditProjectImage(e.target.files[0]);

  const handleEditProjectSubmit = async (e) => {
    e.preventDefault();
    if (!editingProject) return;
    setIsLoadingData(true);
    const formData = new FormData();
    formData.append('title', editProjectData.title);
    formData.append('description', editProjectData.description);
    formData.append('projectLink', editProjectData.projectLink || '');
    formData.append('githubUrl', editProjectData.githubUrl || '');
    formData.append('technologies', editProjectData.technologies);
    if (editProjectImage) formData.append('projectImage', editProjectImage);

    try {
      await api.put(`/projects/${editingProject._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      displayMessage(`Project "${editProjectData.title}" updated successfully!`, 'success');
      closeEditModal();
      fetchProjects();
    } catch (err) {
      displayMessage(err.response?.data?.message || "Failed to update project.", 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleDeleteProject = (project) => {
    setProjectToDelete(project);
    setShowConfirmModal(true);
  };

  const executeDeleteProject = async () => {
    if (!projectToDelete) return;
    setIsLoadingData(true);
    try {
      await api.delete(`/projects/${projectToDelete._id}`);
      displayMessage(`Project "${projectToDelete.title}" deleted successfully!`, 'success');
      fetchProjects();
    } catch (err) {
      displayMessage(err.response?.data?.message || 'Failed to delete project.', 'error');
    } finally {
      setIsLoadingData(false);
      setShowConfirmModal(false);
      setProjectToDelete(null);
    }
  };
  
  if (isLoadingAuth) { return <div className="text-center py-20 text-gray-500 text-lg">Authenticating...</div>; }
  if (isLoadingData && projects.length === 0) { return <div className="text-center py-10 text-gray-500">Loading projects...</div>; }
  if (error && projects.length === 0) { return <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-md">{error}</div>; }

  return (
    <>
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={executeDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to permanently delete the project "${projectToDelete?.title}"? This action cannot be undone.`}
        isLoading={isLoadingData}
      />
      <div className="container mx-auto px-4 py-8 relative">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-10 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white text-center sm:text-left">
            {isAdmin ? 'Manage Projects' : 'My Projects'}
          </h1>
          {isAdmin && ( <button onClick={() => setShowAddModal(true)} className="btn-primary">Add New Project</button> )}
        </div>
        
        {/* ... Modals and other UI ... */}

        <motion.div
          className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {projects.length > 0 ? (
            projects.map((project) => (
              <motion.div key={project._id} variants={itemVariants}>
                <ProjectCard
                  project={project}
                  onUpdate={openEditModal}
                  onDelete={() => handleDeleteProject(project)}
                  isAdminView={isAdmin}
                />
              </motion.div>
            ))
          ) : (
            <p className="md:col-span-2 lg:col-span-3 text-center text-gray-500 py-10 text-lg">
              No projects currently available.
              {isAdmin && ' Click "Add New Project" to get started!'}
            </p>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default ProjectsPage;