// portfolio_py/frontend/src/pages/admin/AboutPage/CertificationsSection.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import * as certificateService from '../../../services/certificateService';
// FIX: Removed unused 'api' import as all calls go through the service.

// --- Add/Edit Certificate Modal ---
const AddEditCertificateModal = ({ show, onClose, onSave, currentCertificate, isLoading }) => {
  // ... (rest of the modal component code remains the same)
  const isEditing = !!currentCertificate?._id;
  const [name, setName] = useState('');
  const [issuingOrganization, setIssuingOrganization] = useState('');
  const [description, setDescription] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [dateIssued, setDateIssued] = useState('');
  const [certificateImage, setCertificateImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (show) {
      if (isEditing && currentCertificate) {
        setName(currentCertificate.name || '');
        setIssuingOrganization(currentCertificate.issuingOrganization || '');
        setDescription(currentCertificate.description || '');
        setCredentialId(currentCertificate.credentialId || '');
        setCredentialUrl(currentCertificate.credentialUrl || '');
        setDateIssued(currentCertificate.dateIssued || '');
        const imageBase = process.env.REACT_APP_API_URL_WITHOUT_API_PREFIX || 'http://localhost:5001';
        setImagePreview(currentCertificate.imageUrl ? `${imageBase}${currentCertificate.imageUrl}` : '');
        setCertificateImage(null);
      } else {
        setName(''); setIssuingOrganization(''); setDescription('');
        setCredentialId(''); setCredentialUrl(''); setDateIssued('');
        setCertificateImage(null); setImagePreview('');
      }
    }
  }, [currentCertificate, isEditing, show]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCertificateImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setCertificateImage(null);
      const imageBase = process.env.REACT_APP_API_URL_WITHOUT_API_PREFIX || 'http://localhost:5001';
      setImagePreview(isEditing && currentCertificate?.imageUrl ? `${imageBase}${currentCertificate.imageUrl}` : '');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !issuingOrganization || (!isEditing && !certificateImage)) {
      alert('Name, Issuing Organization, and Certificate Image (for new) are required.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('name', name);
    formDataToSend.append('issuingOrganization', issuingOrganization);
    if (description) formDataToSend.append('description', description);
    if (credentialId) formDataToSend.append('credentialId', credentialId);
    if (credentialUrl) formDataToSend.append('credentialUrl', credentialUrl);
    if (dateIssued) formDataToSend.append('dateIssued', dateIssued);
    if (certificateImage) formDataToSend.append('certificateImage', certificateImage);
    
    onSave(formDataToSend, currentCertificate?._id);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg my-8">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">{isEditing ? 'Edit' : 'Add'} Certificate</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cert-name" className="block text-sm font-medium dark:text-gray-300">Name*</label>
            <input id="cert-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="input-style w-full"/>
          </div>
          <div>
            <label htmlFor="cert-org" className="block text-sm font-medium dark:text-gray-300">Issuing Organization*</label>
            <input id="cert-org" type="text" value={issuingOrganization} onChange={(e) => setIssuingOrganization(e.target.value)} required className="input-style w-full"/>
          </div>
          <div>
            <label htmlFor="cert-desc" className="block text-sm font-medium dark:text-gray-300">Description</label>
            <textarea id="cert-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="input-style w-full" rows="3"></textarea>
          </div>
          <div>
            <label htmlFor="cert-date" className="block text-sm font-medium dark:text-gray-300">Date Issued (e.g., Month Year)</label>
            <input id="cert-date" type="text" value={dateIssued} onChange={(e) => setDateIssued(e.target.value)} className="input-style w-full"/>
          </div>
          <div>
            <label htmlFor="cert-credId" className="block text-sm font-medium dark:text-gray-300">Credential ID</label>
            <input id="cert-credId" type="text" value={credentialId} onChange={(e) => setCredentialId(e.target.value)} className="input-style w-full"/>
          </div>
          <div>
            <label htmlFor="cert-credUrl" className="block text-sm font-medium dark:text-gray-300">Credential URL</label>
            <input id="cert-credUrl" type="url" value={credentialUrl} onChange={(e) => setCredentialUrl(e.target.value)} className="input-style w-full"/>
          </div>
          <div>
            <label htmlFor="cert-image" className="block text-sm font-medium dark:text-gray-300">Certificate Image {isEditing ? '(Optional: to replace current)' : '*'}</label>
            <input id="cert-image" type="file" accept="image/*,application/pdf" onChange={handleImageChange} className="file-input-style w-full" />
            {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 max-h-40 rounded object-contain"/>}
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-primary">{isLoading ? 'Saving...' : 'Save Certificate'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
// --- End Add/Edit Certificate Modal ---


const CertificationsSection = () => {
  const { isAdmin } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoadingState] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  const [showModal, setShowModal] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayFeedback = (message, type = 'success') => {
    setActionMessage({ text: message, type });
    setTimeout(() => setActionMessage({ text: '', type: '' }), 3500);
  };

  const fetchCertificates = async () => {
    setIsLoadingState(true);
    setError(null);
    try {
      const data = await certificateService.getCertificates();
      setCertificates(data || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch certificates.';
      setError(errorMessage);
      setCertificates([]);
    } finally {
      setIsLoadingState(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCertificate(null);
    setShowModal(true);
    setActionMessage({ text: '', type: '' });
  };
  
  const handleOpenEditModal = (cert) => {
    setEditingCertificate(cert);
    setShowModal(true);
    setActionMessage({ text: '', type: '' });
  };

  const handleSaveCertificate = async (formData, idToUpdate) => {
    setIsSubmitting(true);
    try {
      if (idToUpdate) {
        // FIX: The call to updateCertificate will now work
        await certificateService.updateCertificate(idToUpdate, formData);
        displayFeedback('Certificate updated successfully!', 'success');
      } else {
        await certificateService.addCertificate(formData);
        displayFeedback('Certificate added successfully!', 'success');
      }
      fetchCertificates();
      setShowModal(false);
    } catch (err) {
      displayFeedback(err.message || 'Failed to save certificate.', 'error');
    } finally { 
      setIsSubmitting(false);
    }
  };

  const handleDeleteCertificate = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the certificate "${name}"?`)) {
      setIsSubmitting(true); 
      try {
        await certificateService.deleteCertificate(id);
        displayFeedback(`Certificate "${name}" deleted.`, 'success');
        fetchCertificates();
      } catch (err) {
        displayFeedback(err.message || 'Failed to delete certificate.', 'error');
      } finally { 
        setIsSubmitting(false);
      }
    }
  };
  
  // ... (rest of the component render logic remains the same)
  return (
    <section id="certifications" className="bg-white dark:bg-slate-800 p-6 sm:p-10 rounded-xl shadow-xl transition-colors duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-4 sm:mb-0">
          Certifications
        </h2>
        {isAdmin && (
          <button onClick={handleOpenAddModal} className="btn-primary text-sm py-2 px-4">
            + Add Certification
          </button>
        )}
      </div>

      {actionMessage.text && (
        <div className={`p-3 mb-4 rounded-md text-sm text-center ${actionMessage.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300'}`}>
          {actionMessage.text}
        </div>
      )}

      {isLoading && <p className="dark:text-gray-300 text-center py-4">Loading certifications...</p>}
      {error && !isLoading && <p className="text-red-500 bg-red-100 dark:bg-red-700/20 dark:text-red-300 p-3 rounded-md text-center py-4">Error: {error}</p>}
      
      {!isLoading && !error && certificates.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-6">
          No certifications listed yet.
          {isAdmin && ' Click "Add Certification" to add one.'}
        </p>
      )}

      {!isLoading && !error && certificates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {certificates.map((cert) => {
            const imageBase = process.env.REACT_APP_API_URL_WITHOUT_API_PREFIX || 'http://localhost:5001';
            const finalImageUrl = cert.imageUrl ? `${imageBase}${cert.imageUrl}` : null;
            const isPdf = cert.mimetype === 'application/pdf';

            return (
              <div key={cert._id} className="border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden group relative flex flex-col">
                {finalImageUrl ? (
                    isPdf ? (
                        <div className="w-full h-56 bg-gray-100 dark:bg-slate-700 flex items-center justify-center p-2 text-center">
                            <a href={finalImageUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                <p className="font-semibold">{cert.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">(PDF - Click to view)</p>
                            </a>
                        </div>
                    ) : (
                        <div className="w-full h-56 bg-gray-100 dark:bg-slate-700 flex items-center justify-center p-2">
                        <img 
                            src={finalImageUrl} 
                            alt={cert.name} 
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => { 
                                e.target.onerror = null; 
                                e.target.alt = 'Image not found';
                            }}
                        />
                        </div>
                    )
                ) : (
                  <div className="w-full h-56 flex items-center justify-center bg-gray-200 dark:bg-slate-700 p-2">
                    <p className="text-xs text-gray-400">No image provided</p>
                  </div>
                )}
                <div className="p-4 flex-grow flex flex-col">
                  <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{cert.name}</h3>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{cert.issuingOrganization}</p>
                  {cert.dateIssued && <p className="text-xs text-gray-500 dark:text-gray-400">Issued: {cert.dateIssued}</p>}
                  {cert.description && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 flex-grow">{cert.description}</p>}
                  <div className="mt-2">
                    {cert.credentialId && <p className="text-xs text-gray-500 dark:text-gray-400">ID: {cert.credentialId}</p>}
                    {cert.credentialUrl && <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">View Credential</a>}
                  </div>
                </div>
                {isAdmin && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 sm:flex-row">
                    <button onClick={() => handleOpenEditModal(cert)} className="btn-secondary text-xs py-1 px-2 whitespace-nowrap">Edit</button>
                    <button onClick={() => handleDeleteCertificate(cert._id, cert.name)} disabled={isSubmitting} className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded-md whitespace-nowrap disabled:opacity-50">Delete</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isAdmin && showModal && (
        <AddEditCertificateModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveCertificate}
          currentCertificate={editingCertificate}
          isLoading={isSubmitting}
        />
      )}
    </section>
  );
};

export default CertificationsSection;