// frontend/src/pages/admin/AdminEducationPage.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api'; // Your Axios instance

// --- Modal Component for Add/Edit Education ---
const EducationFormModal = ({ show, onClose, onSave, currentEducation, isLoading }) => {
  const isEditing = !!currentEducation?._id;

  const [formData, setFormData] = useState({
    degree: '', institution: '', location: '', startDate: '',
    endDate: '', gpa: '', description: '',
  });

  useEffect(() => {
    if (show) {
      if (isEditing && currentEducation) {
        setFormData({
          degree: currentEducation.degree || '',
          institution: currentEducation.institution || '',
          location: currentEducation.location || '',
          startDate: currentEducation.startDate || '',
          endDate: currentEducation.endDate || '',
          gpa: currentEducation.gpa || '',
          description: currentEducation.description || '',
        });
      } else { // For Add mode, reset to ensure fresh form
        setFormData({
          degree: '', institution: '', location: '', startDate: '',
          endDate: '', gpa: '', description: '',
        });
      }
    }
  }, [currentEducation, isEditing, show]);

  if (!show) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, currentEducation?._id);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalFadeIn">
        <style jsx global>{` @keyframes modalFadeIn { to { opacity: 1; transform: scale(1); } } .animate-modalFadeIn { animation: modalFadeIn 0.2s ease-out forwards; } `}</style>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            {isEditing ? 'Edit Education Entry' : 'Add New Education Entry'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-2xl leading-none p-1">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label htmlFor="degreeEduModal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Degree <span className="text-red-500">*</span></label><input type="text" name="degree" id="degreeEduModal" value={formData.degree} onChange={handleChange} required className="mt-1 input-style w-full" /></div>
          <div><label htmlFor="institutionEduModal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Institution <span className="text-red-500">*</span></label><input type="text" name="institution" id="institutionEduModal" value={formData.institution} onChange={handleChange} required className="mt-1 input-style w-full" /></div>
          <div><label htmlFor="locationEduModal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label><input type="text" name="location" id="locationEduModal" value={formData.location} onChange={handleChange} className="mt-1 input-style w-full" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label htmlFor="startDateEduModal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date <span className="text-red-500">*</span></label><input type="text" name="startDate" id="startDateEduModal" value={formData.startDate} onChange={handleChange} required placeholder="e.g., Aug 2018" className="mt-1 input-style w-full" /></div>
            <div><label htmlFor="endDateEduModal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date <span className="text-red-500">*</span></label><input type="text" name="endDate" id="endDateEduModal" value={formData.endDate} onChange={handleChange} required placeholder="e.g., May 2022 or Present" className="mt-1 input-style w-full" /></div>
          </div>
          <div><label htmlFor="gpaEduModal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">GPA (Optional)</label><input type="text" name="gpa" id="gpaEduModal" value={formData.gpa} onChange={handleChange} className="mt-1 input-style w-full" /></div>
          <div><label htmlFor="descriptionEduModal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description/Key Courses (Optional)</label><textarea name="description" id="descriptionEduModal" value={formData.description} onChange={handleChange} rows="3" className="mt-1 input-style w-full"></textarea></div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-primary disabled:opacity-70">
              {isLoading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Entry')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminEducationPage = () => {
  const [educationHistory, setEducationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEducation, setEditingEducation] = useState(null);

  const displayMessage = (message, type = 'success') => {
    setActionMessage({ text: message, type });
    setTimeout(() => setActionMessage(''), 3500);
  };

  const fetchEducationHistory = async () => {
    setIsLoading(true); setError(null);
    try {
      const { data } = await api.get('/education');
      setEducationHistory(data);
    } catch (err) {
      console.error("Error fetching education history:", err);
      setError(err.response?.data?.message || "Failed to load education history.");
    } finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchEducationHistory();
  }, []);

  const openAddModal = () => {
    setEditingEducation(null); 
    setShowFormModal(true);
    setActionMessage('');
  };

  const openEditModal = (eduEntry) => {
    setEditingEducation(eduEntry);
    setShowFormModal(true);
    setActionMessage('');
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingEducation(null);
  };

  const handleSaveEducation = async (formData, idToUpdate) => {
    setIsLoading(true); setActionMessage('');
    const method = idToUpdate ? 'put' : 'post';
    const url = idToUpdate ? `/education/${idToUpdate}` : '/education';

    try {
      const { data } = await api[method](url, formData);
      displayMessage(`Education entry "${data.degree}" ${idToUpdate ? 'updated' : 'added'}!`, 'success');
      closeFormModal();
      fetchEducationHistory(); 
    } catch (err) {
      displayMessage(err.response?.data?.message || `Failed to ${idToUpdate ? 'update' : 'add'} entry.`, 'error');
    } finally { setIsLoading(false); }
  };

  const handleDeleteEducation = async (id, degree) => {
    const institution = educationHistory.find(edu => edu._id === id)?.institution || '';
    if (window.confirm(`Delete: "${degree}" at ${institution}?`)) {
      setIsLoading(true); setActionMessage('');
      try {
        await api.delete(`/education/${id}`);
        displayMessage(`Education "${degree}" deleted.`, 'success');
        fetchEducationHistory();
      } catch (err) {
        displayMessage(err.response?.data?.message || "Failed to delete.", 'error');
      } finally { setIsLoading(false); }
    }
  };
  
  if (isLoading && educationHistory.length === 0 && !error) {
    return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading education entries...</div>;
  }
  if (error && educationHistory.length === 0) {
    return <div className="p-6 text-center text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/20 rounded-md">{error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-slate-800 shadow-lg rounded-xl transition-colors duration-300">
      <div className="flex justify-between items-center mb-6 pb-4 border-b dark:border-slate-700">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Manage Education</h1>
        <button onClick={openAddModal} className="btn-primary py-2 px-4 text-sm">
          + Add Education Entry
        </button>
      </div>

      {actionMessage && <div className={`p-3 mb-4 rounded-md text-sm text-center ${actionMessage.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-800/30 dark:text-red-300'}`} role="alert">{actionMessage.text}</div>}
      {error && educationHistory.length > 0 && !actionMessage && <div className="mb-4 text-center text-red-500 bg-red-100 dark:bg-red-900/20 p-3 rounded">{error}</div>}
      {isLoading && educationHistory.length > 0 && <p className="text-sm text-center text-gray-500 dark:text-gray-400 my-4">Refreshing list...</p>}

      {educationHistory.length === 0 && !isLoading ? (
        <p className="text-gray-600 dark:text-gray-400 text-center py-6">No education entries found. Click "Add Education Entry" to get started.</p>
      ) : (
        <div className="space-y-4">
          {educationHistory.map((edu) => (
            <div key={edu._id} className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm bg-gray-50 dark:bg-slate-700/40 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start">
                <div className="flex-grow mb-3 sm:mb-0">
                  <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">{edu.degree}</h3>
                  <p className="text-md text-gray-700 dark:text-gray-300">{edu.institution}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {edu.startDate} - {edu.endDate} {edu.location && `| ${edu.location}`}
                  </p>
                  {edu.gpa && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">GPA: {edu.gpa}</p>}
                </div>
                <div className="flex space-x-2 flex-shrink-0 self-start sm:self-auto">
                  <button onClick={() => openEditModal(edu)} className="btn-secondary py-1.5 px-3 text-xs">Edit</button>
                  <button onClick={() => handleDeleteEducation(edu._id, edu.degree)} disabled={isLoading} className="bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 px-3 rounded-md text-xs shadow-sm dark:bg-red-600 dark:hover:bg-red-700 disabled:opacity-70">Delete</button>
                </div>
              </div>
              {edu.description && <p className="mt-3 pt-3 border-t dark:border-slate-600 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{edu.description}</p>}
            </div>
          ))}
        </div>
      )}

      <EducationFormModal 
        show={showFormModal}
        onClose={closeFormModal}
        onSave={handleSaveEducation}
        currentEducation={editingEducation}
        isLoading={isLoading} // This isLoading is the page-level one, good for disabling submit
      />
    </div>
  );
};

export default AdminEducationPage;