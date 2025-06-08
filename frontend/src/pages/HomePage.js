// frontend/src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import api from '../services/api';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight } from 'lucide-react';

// --- Edit Modals can remain the same ---
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
      <div className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-xl w-full max-w-lg animate-modalFadeIn">
        <style jsx="true">{` @keyframes modalFadeIn { to { opacity: 1; transform: scale(1); } } .animate-modalFadeIn { animation: modalFadeIn 0.2s ease-out forwards; opacity:0; transform: scale(0.95); } `}</style>
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
      <div className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-xl w-full max-w-md animate-modalFadeIn">
        <style jsx="true">{` @keyframes modalFadeIn { to { opacity: 1; transform: scale(1); } } .animate-modalFadeIn { animation: modalFadeIn 0.2s ease-out forwards; opacity:0; transform: scale(0.95); } `}</style>
        <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Update Profile Photo</h2><button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white text-2xl leading-none p-1">&times;</button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {currentPhotoUrl && <img src={currentPhotoUrl} alt="Current profile" className="mx-auto h-32 w-32 rounded-full object-cover mb-4 shadow-md" />}
          <div><label htmlFor="profilePhotoFileModalInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Photo</label><input type="file" name="profilePhotoFileModalInput" id="profilePhotoFileModalInput" accept="image/*" onChange={(e) => setSelectedPhotoFile(e.target.files[0])} required className="mt-1 file-input-style w-full" /></div>
          {selectedPhotoFile && <p className="text-xs text-gray-500 dark:text-gray-300">Selected: {selectedPhotoFile.name}</p>}
          <div className="flex justify-end space-x-3 pt-2"><button type="button" onClick={onClose} className="btn-secondary">Cancel</button><button type="submit" disabled={isLoading} className="btn-primary disabled:opacity-70">{isLoading ? 'Uploading...' : 'Upload Photo'}</button></div>
        </form>
      </div>
    </div>
  );
};

const HomePage = () => {
  const { currentUser, isAdmin } = useAuth(); 
  const { siteSettings, isLoading: isLoadingSettings } = useSettings();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [showEditIntroModal, setShowEditIntroModal] = useState(false);
  const [showEditPhotoModal, setShowEditPhotoModal] = useState(false);
  
  const location = useLocation(); 
  const navigate = useNavigate();
  const defaultProfileImageUrl = "/images/default-profile.png";
  
  const controls = useAnimation();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const displayMessage = (message, type = 'success') => {
    setActionMessage({ text: message, type });
    setTimeout(() => setActionMessage(''), 3500);
  };
  
  const handleUpdateTextSettings = async (formData) => {
    setIsProcessing(true);
    try {
      await api.put('/settings', formData);
      displayMessage('Homepage content updated successfully!', 'success');
      setShowEditIntroModal(false);
      window.location.reload();
    } catch (err) {
      displayMessage(err.response?.data?.message || 'Failed to update content.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProfilePhotoUpload = async (photoFile) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('profilePhoto', photoFile); 
    try {
      await api.post('/settings/profile-photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      displayMessage('Profile photo updated successfully!', 'success');
      setShowEditPhotoModal(false);
      window.location.reload();
    } catch (err) {
      displayMessage(err.response?.data?.message || 'Failed to upload photo.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };
 
  const handleEditClick = (modalSetterCallback) => {
    if (currentUser && isAdmin) { 
      modalSetterCallback(true); 
    } else {
      navigate('/login', { state: { message: "Admin login required to edit this content.", from: location } });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };
  
  if (isLoadingSettings) {
    return <div className="text-center py-20 text-lg text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  const profilePhotoToDisplay = siteSettings.profilePhotoUrl && !siteSettings.profilePhotoUrl.includes('default-profile.png')
                                ? `${process.env.REACT_APP_API_URL_WITHOUT_API_PREFIX || 'http://localhost:5001'}${siteSettings.profilePhotoUrl}`
                                : defaultProfileImageUrl;
  
  const settings = siteSettings;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 overflow-x-hidden">
      {actionMessage && <div className={`p-4 mb-6 rounded-md text-sm text-center ${actionMessage.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`} role="alert">{actionMessage.text}</div>}
      
      <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-12 md:gap-16">
        <motion.div
          className="w-full md:w-3/5 lg:w-2/3 text-center md:text-left order-2 md:order-1"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="relative inline-block">
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-800 dark:text-gray-50 leading-tight mb-4"
              variants={itemVariants}
            >
              Hello, I'm <span className="text-indigo-600 dark:text-indigo-400">{settings.ownerName}!</span>
            </motion.h1>
            <motion.p
              className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
              variants={itemVariants}
            >
              A passionate {settings.jobTitle} specializing in {settings.specialization}.
            </motion.p>
            {isAdmin && <button onClick={() => handleEditClick(setShowEditIntroModal)} className="absolute top-0 right-0 -mt-1 -mr-1 p-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-300 rounded-full text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-opacity text-xs" title="Edit Text Content">✏️</button>}
          </div>
          <motion.div
            className="mt-12 flex flex-col sm:flex-row justify-center md:justify-start gap-4"
            variants={itemVariants}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/projects" className="group btn-primary text-lg w-full sm:w-auto justify-center px-6 md:px-8 py-3 flex items-center">
                View My Work <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/contact" className="btn-secondary text-lg w-full sm:w-auto justify-center px-6 md:px-8 py-3 flex items-center">Get In Touch</Link>
            </motion.div>
          </motion.div>
        </motion.div>
        
        <motion.div
            className="w-full md:w-2/5 lg:w-1/3 flex flex-col items-center order-1 md:order-2 md:mt-8"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="relative group">
            <div className="relative w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full shadow-2xl overflow-hidden border-4 border-white dark:border-slate-700 transition-all duration-300 group-hover:shadow-[0_0_25px_5px] group-hover:shadow-indigo-500/40">
              <img src={profilePhotoToDisplay} alt={settings.ownerName} className="w-full h-full object-cover" onError={(e) => { if (e.target.src !== defaultProfileImageUrl) { e.target.onerror = null; e.target.src = defaultProfileImageUrl; }}} />
            </div>
            {isAdmin && <button onClick={() => handleEditClick(setShowEditPhotoModal)} className="absolute bottom-2 right-2 py-2 px-3 bg-white/70 backdrop-blur-sm hover:bg-white text-gray-700 rounded-full shadow-md text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400 flex items-center gap-1.5" title="Change Profile Photo">
              ✏️ <span className="hidden sm:inline">Change</span>
            </button>}
          </div>
        </motion.div>
      </div>

      <motion.section
        ref={ref}
        animate={controls}
        initial="hidden"
        variants={{
          visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
          hidden: { opacity: 0, y: 50 },
        }}
        className="my-16 md:my-24 w-full"
      >
         <div className="relative bg-white dark:bg-slate-800 p-6 sm:p-10 rounded-lg shadow-xl dark:shadow-slate-700/60">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-700 dark:text-gray-100 mb-6 text-left">
              A Little About Me
            </h2>
            <p className="text-md sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-left">
              {settings.homePageIntroParagraph}
            </p>
            {isAdmin && <button onClick={() => handleEditClick(setShowEditIntroModal)} className="absolute top-2 right-2 p-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-300 rounded-full text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-opacity text-xs" title="Edit Introduction">✏️</button>}
          </div>
      </motion.section>

      {isAdmin && (
        <>
          <EditTextModal show={showEditIntroModal} onClose={() => setShowEditIntroModal(false)} currentSettings={settings} onSave={handleUpdateTextSettings} isLoading={isProcessing} />
          <EditPhotoModal show={showEditPhotoModal} onClose={() => setShowEditPhotoModal(false)} currentPhotoUrl={profilePhotoToDisplay} onSave={handleProfilePhotoUpload} isLoading={isProcessing} />
        </>
      )}
    </div>
  );
};

export default HomePage;