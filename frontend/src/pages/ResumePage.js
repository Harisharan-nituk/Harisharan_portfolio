// frontend/src/pages/ResumePage.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ResumeCard from '../components/resumes/ResumeCard'; // Ensure this path is correct
import { useAuth } from '../contexts/AuthContext'; // <-- IMPORT useAuth

const ResumePage = () => {
  const { currentUser, isAdmin, isLoadingAuth } = useAuth(); // <-- GET REAL AUTH STATE

  const [resumes, setResumes] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  // State for Add Form (only shown if isAdmin)
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResumeField, setNewResumeField] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // State for Edit Modal (only shown if isAdmin)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingResume, setEditingResume] = useState(null);
  const [editResumeField, setEditResumeField] = useState('');
  const [editSelectedFile, setEditSelectedFile] = useState(null);

  const displayMessage = (message, type = 'success') => {
    setActionMessage({ text: message, type });
    setTimeout(() => setActionMessage(''), 3000);
  };

  const fetchResumes = async () => {
    setIsLoadingData(true);
    setError(null); 
    try {
      const response = await api.get('/resumes'); // This is a public GET request
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

  // Admin-only functions:
  const handleDelete = async (resumeId, resumeField) => {
    if (!isAdmin) return; // Extra safety, though button shouldn't be visible
    if (window.confirm(`Are you sure you want to delete the ${resumeField} resume? This is permanent.`)) {
      setIsLoadingData(true);
      try {
        await api.delete(`/resumes/${resumeId}`); // Will use token from AuthContext
        displayMessage(`Resume "${resumeField}" deleted successfully!`, 'success');
        fetchResumes();
      } catch (err) {
        displayMessage(err.response?.data?.message || 'Failed to delete resume.', 'error');
        setIsLoadingData(false);
      }
    }
  };

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

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingResume(null);
    setEditResumeField('');
    setEditSelectedFile(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!editingResume || !editResumeField.trim()) {
      displayMessage("Field/category cannot be empty.", 'error');
      return;
    }
    setIsLoadingData(true);
    const formData = new FormData();
    formData.append('field', editResumeField);
    if (editSelectedFile) {
      formData.append('resumeFile', editSelectedFile);
    }
    try {
      await api.put(`/resumes/${editingResume._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      displayMessage(`Resume "${editResumeField}" updated successfully!`, 'success');
      closeEditModal();
      fetchResumes();
    } catch (err) {
      displayMessage(err.response?.data?.message || "Failed to update resume.", 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleAddNewResume = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!newResumeField.trim()) {
      displayMessage("Please provide a field/category.", 'error');
      return;
    }
    if (!selectedFile) {
      displayMessage("Please select a PDF file.", 'error');
      return;
    }
    setIsLoadingData(true);
    const formData = new FormData();
    formData.append('field', newResumeField);
    formData.append('resumeFile', selectedFile);
    try {
      await api.post('/resumes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      displayMessage(`Resume "${newResumeField}" added successfully!`, 'success');
      setNewResumeField('');
      setSelectedFile(null);
      const addFileInput = document.getElementById('addResumeFile');
      if (addFileInput) addFileInput.value = null;
      setShowAddForm(false);
      fetchResumes();
    } catch (err) {
      displayMessage(err.response?.data?.message || "Failed to add resume.", 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  if (isLoadingAuth) { // Show a message while AuthContext is figuring out the user
    return <div className="text-center py-20 text-gray-500 text-lg">Authenticating...</div>;
  }

  if (isLoadingData && resumes.length === 0 && !error && !showAddForm && !showEditModal) {
    return <div className="text-center py-10 text-gray-500">Loading resumes...</div>;
  }
  if (error && resumes.length === 0 && !showAddForm && !showEditModal) {
    return <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-md">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-10 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center sm:text-left">
          {/* Title changes based on whether you're admin or not */}
          {isAdmin ? 'Manage Resumes' : 'My Resumes'}
        </h1>
        {/* "Add New Resume" button is only shown if isAdmin is true */}
        {isAdmin && (
          <button
            onClick={() => { setShowAddForm(!showAddForm); setShowEditModal(false); setActionMessage('');}}
            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300"
          >
            {showAddForm ? 'Cancel Add' : 'Add New Resume'}
          </button>
        )}
      </div>

      {actionMessage && (
        <div className={`p-4 mb-6 rounded-md text-sm text-center ${actionMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} role="alert">
          {actionMessage.text}
        </div>
      )}
      {error && (resumes.length > 0 || showAddForm || showEditModal) && !actionMessage && (
         <div className="mb-4 text-center text-red-500 bg-red-100 p-3 rounded">{error}</div>
      )}

      {/* Add Resume Form - only shown if isAdmin and showAddForm is true */}
      {isAdmin && showAddForm && (
        <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 mb-10 border border-gray-200">
          {/* ... Add form JSX from previous version ... */}
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Add New Resume</h2>
          <form onSubmit={handleAddNewResume} className="space-y-6">
            <div>
              <label htmlFor="newResumeField" className="block text-sm font-medium text-gray-700 mb-1">Field / Category Name <span className="text-red-500">*</span></label>
              <input type="text" id="newResumeField" value={newResumeField} onChange={(e) => setNewResumeField(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g., Data Scientist"/>
            </div>
            <div>
              <label htmlFor="addResumeFile" className="block text-sm font-medium text-gray-700 mb-1">Upload PDF File <span className="text-red-500">*</span></label>
              <input type="file" id="addResumeFile" accept=".pdf" onChange={(e) => setSelectedFile(e.target.files[0])} required className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"/>
            </div>
            <button type="submit" disabled={isLoadingData} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 disabled:opacity-70">
              {isLoadingData && !showEditModal ? 'Uploading...' : 'Upload Resume'}
            </button>
          </form>
        </div>
      )}

      {/* Edit Resume Modal - only shown if isAdmin and showEditModal is true */}
      {isAdmin && showEditModal && editingResume && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out">
          {/* ... Edit modal JSX from previous version ... */}
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalFadeIn">
            <style jsx global>{` @keyframes modalFadeIn { to { opacity: 1; transform: scale(1); } } .animate-modalFadeIn { animation: modalFadeIn 0.2s ease-out forwards; } `}</style>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-700">Update Resume: <span className="font-normal italic">{editingResume.field}</span></h2>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-6">
                <div>
                  <label htmlFor="editResumeField" className="block text-sm font-medium text-gray-700 mb-1"> Field / Category Name <span className="text-red-500">*</span></label>
                  <input type="text" id="editResumeField" value={editResumeField} onChange={(e) => setEditResumeField(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current File: {editingResume.originalFilename}</p>
                  <label htmlFor="editResumeFile" className="block text-sm font-medium text-gray-700 mb-1"> Upload New PDF (Optional - if replacing):</label>
                  <input type="file" id="editResumeFile" accept=".pdf" onChange={(e) => setEditSelectedFile(e.target.files[0])} className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"/>
                  {editSelectedFile && <p className="text-xs text-gray-500 mt-1">New file selected: {editSelectedFile.name}</p>}
                </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={closeEditModal} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-300">Cancel</button>
                <button type="submit" disabled={isLoadingData} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 disabled:opacity-70">
                  {isLoadingData && editingResume ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESUME LIST - Pass the real isAdmin status to ResumeCard */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {resumes.length > 0 ? resumes.map((resume) => (
          <ResumeCard 
            key={resume._id} 
            resume={resume} 
            onUpdate={openEditModal}
            onDelete={handleDelete}
            isAdminView={isAdmin} // <-- Pass the real isAdmin from context
          />
        )) : (
          !isLoadingData && !showAddForm && !showEditModal && 
          <p className="md:col-span-2 text-center text-gray-500 py-10 text-lg">
            No resumes currently available. 
            {/* Message changes slightly for admin view */}
            {isAdmin && ' Click "Add New Resume" to upload your first one!'}
          </p>
        )}
      </div>
      {isLoadingData && (resumes.length > 0 || showAddForm || showEditModal ) && (
        <div className="text-center py-5 text-sm text-gray-500">Processing...</div>
      )}
    </div>
  );
};

export default ResumePage;