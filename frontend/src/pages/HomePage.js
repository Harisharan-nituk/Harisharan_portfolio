// frontend/src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// --- Edit Modals (defined at the TOP LEVEL of the module, outside HomePage component) ---
const EditTextModal = ({ show, onClose, currentSettings, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    ownerName: '', jobTitle: '', specialization: '', homePageIntroParagraph: '',
  });

  useEffect(() => {
    if (show && currentSettings) {
      setFormData({
        ownerName: currentSettings.ownerName || '',
        jobTitle: currentSettings.jobTitle || '',
        specialization: currentSettings.specialization || '',
        homePageIntroParagraph: currentSettings.homePageIntroParagraph || '',
      });
    }
  }, [show, currentSettings]);

  if (!show) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-xl w-full max-w-lg animate-modalFadeIn"> {/* Added dark mode to modal card */}
        <style jsx global>{` @keyframes modalFadeIn { to { opacity: 1; transform: scale(1); } } .animate-modalFadeIn { animation: modalFadeIn 0.2s ease-out forwards; opacity:0; transform: scale(0.95); } `}</style>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Edit Homepage Content</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white text-2xl leading-none p-1">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label htmlFor="ownerNameModal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Name</label><input type="text" name="ownerName" id="ownerNameModal" value={formData.ownerName} onChange={handleChange} className="mt-1 input-style w-full" /></div>
          <div><label htmlFor="jobTitleModal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Profession/Title</label><input type="text" name="jobTitle" id="jobTitleModal" value={formData.jobTitle} onChange={handleChange} className="mt-1 input-style w-full" /></div>
          <div><label htmlFor="specializationModal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Specialization/Tagline</label><input type="text" name="specialization" id="specializationModal" value={formData.specialization} onChange={handleChange} className="mt-1 input-style w-full" /></div>
          <div><label htmlFor="homePageIntroParagraphModal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Introductory Paragraph</label><textarea name="homePageIntroParagraph" id="homePageIntroParagraphModal" rows="4" value={formData.homePageIntroParagraph} onChange={handleChange} className="mt-1 input-style w-full"></textarea></div>
          <div className="flex justify-end space-x-3 pt-2"><button type="button" onClick={onClose} className="btn-secondary">Cancel</button><button type="submit" disabled={isLoading} className="btn-primary disabled:opacity-70">{isLoading ? 'Saving...' : 'Save Changes'}</button></div>
        </form>
      </div>
    </div>
  );
};

const EditPhotoModal = ({ show, onClose, currentPhotoUrl, onSave, isLoading }) => {
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  useEffect(() => { if (!show) {setSelectedPhotoFile(null); const input = document.getElementById('profilePhotoFileModalInput'); if(input) input.value = null;} }, [show]);
  if (!show) return null; 
  const handleSubmit = (e) => { e.preventDefault(); if (!selectedPhotoFile) { alert("Please select a photo."); return; } onSave(selectedPhotoFile); };
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-xl w-full max-w-md animate-modalFadeIn"> {/* Added dark mode to modal card */}
        <style jsx global>{` @keyframes modalFadeIn { to { opacity: 1; transform: scale(1); } } .animate-modalFadeIn { animation: modalFadeIn 0.2s ease-out forwards; opacity:0; transform: scale(0.95); } `}</style>
        <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Update Profile Photo</h2><button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white text-2xl leading-none p-1">&times;</button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {currentPhotoUrl && <img src={currentPhotoUrl} alt="Current profile" className="mx-auto h-32 w-32 rounded-lg object-cover mb-4 shadow-md" />}
          <div><label htmlFor="profilePhotoFileModalInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Photo</label><input type="file" name="profilePhotoFileModalInput" id="profilePhotoFileModalInput" accept="image/*" onChange={(e) => setSelectedPhotoFile(e.target.files[0])} required className="mt-1 file-input-style w-full" /></div>
          {selectedPhotoFile && <p className="text-xs text-gray-500 dark:text-gray-300">Selected: {selectedPhotoFile.name}</p>}
          <div className="flex justify-end space-x-3 pt-2"><button type="button" onClick={onClose} className="btn-secondary">Cancel</button><button type="submit" disabled={isLoading} className="btn-primary disabled:opacity-70">{isLoading ? 'Uploading...' : 'Upload Photo'}</button></div>
        </form>
      </div>
    </div>
  );
};
// --- End Edit Modals ---

const HomePage = () => {
  const { currentUser, isAdmin, isLoadingAuth } = useAuth(); 
  const [siteSettings, setSiteSettings] = useState(null);
  const [isLoadingPageData, setIsLoadingPageData] = useState(true); 
  const [errorPageData, setErrorPageData] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [showEditIntroModal, setShowEditIntroModal] = useState(false);
  const [showEditPhotoModal, setShowEditPhotoModal] = useState(false);
  const location = useLocation(); 
  const navigate = useNavigate();
  const defaultProfileImageUrl = "/images/default-profile.png";

  const fetchSiteSettings = async () => { /* ... same as before ... */ };
  useEffect(() => { if (!isLoadingAuth) fetchSiteSettings(); }, [isLoadingAuth]); 
  const displayMessage = (message, type = 'success') => { /* ... same as before ... */ };
  const handleUpdateTextSettings = async (formData) => { /* ... same as before ... */ };
  const handleProfilePhotoUpload = async (photoFile) => { /* ... same as before ... */ };
  const handleEditClick = (modalSetterCallback) => { /* ... same as before ... */ };

  // --- Start: Ensure these functions are complete from the previous full version ---
  // (Re-pasting them here for completeness in this file generation request)
  const _fetchSiteSettings = async () => {
    setIsLoadingPageData(true);
    try {
      const { data } = await api.get('/settings');
      setSiteSettings(data);
    } catch (err) {
      console.error("Error fetching site settings:", err);
      setErrorPageData(err.response?.data?.message || "Could not load site settings.");
      setSiteSettings({ 
        ownerName: 'Your Name', jobTitle: 'Your Title', specialization: 'Your Specialization', 
        homePageIntroParagraph: 'Welcome! Content is loading or not yet configured.',
        profilePhotoUrl: defaultProfileImageUrl
      });
    } finally { setIsLoadingPageData(false); }
  };
  useEffect(() => { if (!isLoadingAuth) _fetchSiteSettings(); }, [isLoadingAuth]); // Changed to _fetchSiteSettings

  const _displayMessage = (message, type = 'success') => {
    setActionMessage({ text: message, type });
    setTimeout(() => setActionMessage(''), 3500);
  };

  const _handleUpdateTextSettings = async (formData) => {
    setIsLoadingPageData(true); setActionMessage('');
    try {
      const { data } = await api.put('/settings', formData); 
      setSiteSettings(data); setShowEditIntroModal(false);
      _displayMessage('Homepage content updated successfully!', 'success');
    } catch (err) { _displayMessage(err.response?.data?.message || 'Failed to update content.', 'error');
    } finally { setIsLoadingPageData(false); }
  };

  const _handleProfilePhotoUpload = async (photoFile) => {
    setIsLoadingPageData(true); setActionMessage('');
    const formData = new FormData();
    formData.append('profilePhoto', photoFile); 
    try {
      const { data } = await api.post('/settings/profile-photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSiteSettings(data.settings); setShowEditPhotoModal(false);
      _displayMessage(data.message || 'Profile photo updated successfully!', 'success');
    } catch (err) { _displayMessage(err.response?.data?.message || 'Failed to upload photo.', 'error');
    } finally { setIsLoadingPageData(false); }
  };
 
  const _handleEditClick = (modalSetterCallback) => {
    if (currentUser && isAdmin) { 
      modalSetterCallback(); 
    } else {
      navigate('/login', { state: { message: "Admin login required to edit this content.", from: location } });
    }
  };
  // --- End: Ensure these functions are complete ---


  if (isLoadingAuth || (isLoadingPageData && !siteSettings)) {
    return <div className="text-center py-20 text-lg text-gray-500 dark:text-gray-400">Loading Page Content...</div>;
  }

  const settings = siteSettings || { ownerName: 'Your Name', jobTitle: 'Your Title', specialization: 'Your Specialization', homePageIntroParagraph: 'Content is loading or not yet configured.', profilePhotoUrl: defaultProfileImageUrl };
  
  if (errorPageData && settings.ownerName === 'Your Name' && (!siteSettings?.ownerName || !siteSettings.ownerName.includes('Your Name')) ) { 
    return <div className="text-center py-20 text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300 p-4 rounded-md">{errorPageData}</div>;
  }

  const profilePhotoToDisplay = settings.profilePhotoUrl && settings.profilePhotoUrl !== defaultProfileImageUrl && !settings.profilePhotoUrl.includes('/images/default-profile.png')
                                ? `${process.env.REACT_APP_API_URL_WITHOUT_API_PREFIX || 'http://localhost:5001'}${settings.profilePhotoUrl}`
                                : defaultProfileImageUrl;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      {actionMessage && <div className={`p-4 mb-6 rounded-md text-sm text-center ${actionMessage.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`} role="alert">{actionMessage.text}</div>}
      
      <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-10 md:gap-16">
        <div className="md:w-3/5 lg:w-2/3 text-center md:text-left order-2 md:order-1">
          <div className="relative inline-block">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-800 dark:text-gray-50 leading-tight mb-4">Hello, I'm <span className="text-indigo-600 dark:text-indigo-400">{settings.ownerName}!</span></h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">A passionate {settings.jobTitle} specializing in {settings.specialization}.</p>
            <button onClick={() => _handleEditClick(() => setShowEditIntroModal(true))} className="absolute top-0 right-0 -mt-1 -mr-1 p-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-300 rounded-full text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-opacity text-xs" title="Edit Text Content">✏️</button>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row justify-center md:justify-start gap-4">
            <Link to="/projects" className="btn-primary text-lg px-8 py-3">View My Work</Link>
            <Link to="/contact" className="btn-secondary text-lg px-8 py-3">Get In Touch</Link>
          </div>
        </div>
        <div className="md:w-2/5 lg:w-1/3 flex flex-col items-center order-1 md:order-2">
          <div className="relative w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-xl shadow-2xl overflow-hidden border-4 border-white dark:border-slate-700">
            <img src={profilePhotoToDisplay} alt={settings.ownerName} className="w-full h-full object-cover" onError={(e) => { if (e.target.src !== defaultProfileImageUrl) { e.target.onerror = null; e.target.src = defaultProfileImageUrl; }}} />
          </div>
          <button onClick={() => _handleEditClick(() => setShowEditPhotoModal(true))} className="mt-4 py-2 px-5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-indigo-300 rounded-md shadow-sm text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400 flex items-center gap-2" title="Change Profile Photo">
            ✏️ Change Photo
          </button>
        </div>
      </div>

      <section className="my-16 md:my-24 w-full max-w-3xl mx-auto">
         <div className="relative bg-white dark:bg-slate-800 p-6 sm:p-10 rounded-lg shadow-xl dark:shadow-slate-700/60">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-700 dark:text-gray-100 mb-6 text-center md:text-left">
              A Little About Me
            </h2>
            {/* UPDATED paragraph text color for dark mode */}
            <p className="text-md sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {settings.homePageIntroParagraph}
            </p>
            <button onClick={() => _handleEditClick(() => setShowEditIntroModal(true))} className="absolute top-2 right-2 p-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-300 rounded-full text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-opacity text-xs" title="Edit Introduction">✏️</button>
          </div>
      </section>

      {/* Modals are only rendered if isAdmin is true AND their specific show state is true */}
      {isAdmin && (
        <>
          <EditTextModal show={showEditIntroModal} onClose={() => setShowEditIntroModal(false)} currentSettings={settings} onSave={_handleUpdateTextSettings} isLoading={isLoadingPageData} />
          <EditPhotoModal show={showEditPhotoModal} onClose={() => setShowEditPhotoModal(false)} currentPhotoUrl={profilePhotoToDisplay} onSave={_handleProfilePhotoUpload} isLoading={isLoadingPageData} />
        </>
      )}
    </div>
  );
};

export default HomePage;