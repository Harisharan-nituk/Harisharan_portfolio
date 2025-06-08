// frontend/src/pages/ResumePage.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ResumeCard from '../components/resumes/ResumeCard';
import { useAuth } from '../contexts/AuthContext';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import ConfirmationModal from '../components/common/ConfirmationModal';

const AnimatedResumeCard = ({ children, index }) => {
  const controls = useAnimation();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5,
        delay: (index % 2) * 0.1
      } 
    },
  };

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={cardVariants}
    >
      {children}
    </motion.div>
  );
};


const ResumePage = () => {
  const { currentUser, isAdmin, isLoadingAuth } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [newResumeField, setNewResumeField] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingResume, setEditingResume] = useState(null);
  const [editResumeField, setEditResumeField] = useState('');
  const [editSelectedFile, setEditSelectedFile] = useState(null);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);

  const displayMessage = (message, type = 'success') => {
    setActionMessage({ text: message, type });
    setTimeout(() => setActionMessage(''), 3000);
  };

  const fetchResumes = async () => {
    setIsLoadingData(true);
    setError(null); 
    try {
      const response = await api.get('/resumes');
      setResumes(response.data);
    } catch (err) {
      console.error("Error fetching resumes:", err);
      setError(err.response?.data?.message || "Failed to load resumes. Is the backend running?");
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const openEditModal = (resume) => {
    if (!isAdmin) return;
    setEditingResume(resume);
    setEditResumeField(resume.field);
    setEditSelectedFile(null);
    const editFileInput = document.getElementById('editResumeFile');
    if (editFileInput) editFileInput.value = null;
    setShowEditModal(true);
    setShowAddForm(false);
    setActionMessage('');
  };

  const handleDelete = (resume) => {
    setResumeToDelete(resume);
    setShowConfirmModal(true);
  };
  
  const executeDelete = async () => {
    if (!resumeToDelete) return;
    setIsLoadingData(true);
    try {
      await api.delete(`/resumes/${resumeToDelete._id}`);
      displayMessage(`Resume "${resumeToDelete.field}" deleted successfully!`, 'success');
      fetchResumes();
    } catch (err) {
      displayMessage(err.response?.data?.message || 'Failed to delete resume.', 'error');
    } finally {
      setIsLoadingData(false);
      setShowConfirmModal(false);
      setResumeToDelete(null);
    }
  };
  
  // ... (other handler functions like closeEditModal, handleEditSubmit, handleAddNewResume remain the same)

  if (isLoadingAuth) { 
    return <div className="text-center py-20 text-gray-500 text-lg">Authenticating...</div>;
  }
  if (isLoadingData && resumes.length === 0) {
    return <div className="text-center py-10 text-gray-500">Loading resumes...</div>;
  }
  if (error && resumes.length === 0) {
    return <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-md">{error}</div>;
  }

  return (
    <>
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={executeDelete}
        title="Delete Resume"
        message={`Are you sure you want to permanently delete the resume for "${resumeToDelete?.field}"?`}
        isLoading={isLoadingData}
      />
      <div className="container mx-auto px-4 py-8 relative">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-10 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white text-center sm:text-left">
            {isAdmin ? 'Manage Resumes' : 'My Resumes'}
          </h1>
          {isAdmin && (
            <button
              onClick={() => { setShowAddForm(!showAddForm); setShowEditModal(false); setActionMessage('');}}
              className="w-full sm:w-auto bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300"
            >
              {showAddForm ? 'Cancel Add' : 'Add New Resume'}
            </button>
          )}
        </div>
        
        {/* The Add/Edit Modals and other UI elements would be here */}

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {resumes.length > 0 ? (
            resumes.map((resume, index) => (
              <AnimatedResumeCard key={resume._id} index={index}>
                <ResumeCard 
                  resume={resume} 
                  onUpdate={openEditModal} // <-- CORRECTED
                  onDelete={() => handleDelete(resume)}
                  isAdminView={isAdmin} 
                />
              </AnimatedResumeCard>
            ))
          ) : (
            !isLoadingData && (
              <p className="md:col-span-2 text-center text-gray-500 py-10 text-lg">
                No resumes currently available. 
                {isAdmin && ' Click "Add New Resume" to upload one.'}
              </p>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default ResumePage;