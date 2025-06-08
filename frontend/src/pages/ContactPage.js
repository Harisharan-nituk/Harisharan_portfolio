// portfolio_py/frontend/src/pages/ContactPage.js
import React, { useState, useEffect } from 'react';
import ContactForm from '../components/contact/ContactForm';
import { useAuth } from '../contexts/AuthContext';
import * as socialLinkService from '../services/socialLinkService';
import { motion } from 'framer-motion';
import { 
  PlusCircle, Edit3, Trash2, Smartphone, Github, Linkedin, Twitter as TwitterIconLucide, 
  Code, ExternalLink, Globe, Link as LinkIcon, Mail, Info, Phone, MapPin 
} from 'lucide-react';
import ConfirmationModal from '../components/common/ConfirmationModal';

// --- Reusable Icon Map ---
const iconComponents = {
  github: Github,
  linkedin: Linkedin,
  twitter: TwitterIconLucide,
  leetcode: Code,
  whatsapp: Smartphone,
  website: Globe,
  email: Mail,
  externallink: ExternalLink,
  info: Info,
  link: LinkIcon,
  default: LinkIcon,
};

// A color map for brand-specific styling
const colorMap = {
    github: 'bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600',
    linkedin: 'bg-blue-600 text-white hover:bg-blue-700',
    twitter: 'bg-sky-500 text-white hover:bg-sky-600',
    email: 'bg-red-600 text-white hover:bg-red-700',
    default: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600'
};

// --- Reusable Add/Edit Modal (with restored form fields) ---
const SocialLinkFormModal = ({ show, onClose, onSave, currentLink, isLoading }) => {
    const isEditing = !!currentLink?._id;
    const [formData, setFormData] = useState({ name: '', url: '', iconName: 'default', isEnabled: true });
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (show) {
            setModalError('');
            setFormData(isEditing && currentLink ?
                { name: currentLink.name || '', url: currentLink.url || '', iconName: currentLink.iconName || 'default', isEnabled: currentLink.isEnabled } :
                { name: '', url: '', iconName: 'default', isEnabled: true }
            );
        }
    }, [currentLink, isEditing, show]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setModalError('');
        if (!formData.name.trim() || !formData.url.trim()) { 
            setModalError('Platform Name and URL are required.');
            return; 
        }
        onSave(formData, currentLink?._id);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">{isEditing ? 'Edit Link' : 'Add New Link'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {modalError && <p className="text-sm text-red-500">{modalError}</p>}
                    <div>
                        <label htmlFor="modal-link-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Platform Name</label>
                        <input id="modal-link-name" type="text" name="name" value={formData.name} onChange={handleChange} required className="input-style w-full mt-1" />
                    </div>
                    <div>
                        <label htmlFor="modal-link-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL</label>
                        <input id="modal-link-url" type="url" name="url" value={formData.url} onChange={handleChange} required className="input-style w-full mt-1" />
                    </div>
                    <div>
                        <label htmlFor="modal-link-icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Icon</label>
                        <select name="iconName" id="modal-link-icon" value={formData.iconName} onChange={handleChange} required className="input-style w-full mt-1">
                            {Object.keys(iconComponents).map(iconKey => (
                                <option key={iconKey} value={iconKey}>{iconKey.charAt(0).toUpperCase() + iconKey.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                     <div className="flex items-center">
                        <input id="modal-link-enabled" type="checkbox" name="isEnabled" checked={formData.isEnabled} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <label htmlFor="modal-link-enabled" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Enabled</label>
                    </div>
                    <div className="flex justify-end gap-3 pt-3">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={isLoading} className="btn-primary">{isLoading ? 'Saving...' : 'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main Contact Page Component ---
const ContactPage = () => {
    const { isAdmin } = useAuth();
    const [socialLinks, setSocialLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [linkToDelete, setLinkToDelete] = useState(null);

    const fetchLinks = async () => {
        setIsLoading(true);
        try {
            const data = isAdmin ? await socialLinkService.getAdminSocialLinks() : await socialLinkService.getPublicSocialLinks();
            setSocialLinks(data || []);
        } catch (error) {
            console.error("Failed to fetch social links:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLinks();
    }, [isAdmin]);

    const handleSave = async (formData, id) => {
        setIsSubmitting(true);
        try {
            if (id) {
                await socialLinkService.updateSocialLink(id, formData);
            } else {
                await socialLinkService.addSocialLink(formData);
            }
            setIsModalOpen(false);
            fetchLinks();
        } catch (err) {
            // Using an alert here temporarily as there's no page-level message component setup
            alert(`Error: ${err.response?.data?.message || err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (link) => {
        setLinkToDelete(link);
        setShowConfirmModal(true);
    };

    const executeDelete = async () => {
        if (!linkToDelete) return;
        setIsSubmitting(true);
        try {
            await socialLinkService.deleteSocialLink(linkToDelete._id);
            fetchLinks();
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || err.message}`);
        } finally {
            setShowConfirmModal(false);
            setLinkToDelete(null);
            setIsSubmitting(false);
        }
    };
    
    const openEditModal = (link) => { setEditingLink(link); setIsModalOpen(true); };
    const openNewModal = () => { setEditingLink(null); setIsModalOpen(true); };

    return (
        <>
            <SocialLinkFormModal show={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} currentLink={editingLink} isLoading={isSubmitting} />
            <ConfirmationModal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={executeDelete} title="Delete Social Link" message={`Are you sure you want to delete the link for "${linkToDelete?.name}"?`} isLoading={isSubmitting} />
            
            <div className="bg-slate-50 dark:bg-slate-900 overflow-hidden">
              <div className="container mx-auto px-4 py-16 sm:py-24">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                  >
                      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white">Get In Touch</h1>
                      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Have a project in mind or just want to say hello? I’d love to hear from you.</p>
                  </motion.div>

                  <div className="grid lg:grid-cols-2 lg:gap-16 items-start">
                      <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg mb-10 lg:mb-0"
                      >
                          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Contact Information</h2>
                          <div className="space-y-6">
                              <div className="flex items-start gap-4">
                                  <div className="mt-1 flex-shrink-0 text-indigo-500 dark:text-indigo-400"><Mail size={22} /></div>
                                  <div>
                                      <h3 className="font-semibold text-gray-700 dark:text-gray-200">Email</h3>
                                      <a href="mailto:bt21cse016@nituk.ac.in" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">bt21cse016@nituk.ac.in</a>
                                  </div>
                              </div>
                              <div className="flex items-start gap-4">
                                  <div className="mt-1 flex-shrink-0 text-indigo-500 dark:text-indigo-400"><Phone size={22} /></div>
                                  <div>
                                      <h3 className="font-semibold text-gray-700 dark:text-gray-200">Phone</h3>
                                      <p className="text-gray-600 dark:text-gray-300">+91 8447173197</p>
                                  </div>
                              </div>
                               <div className="flex items-start gap-4">
                                  <div className="mt-1 flex-shrink-0 text-indigo-500 dark:text-indigo-400"><MapPin size={22} /></div>
                                  <div>
                                      <h3 className="font-semibold text-gray-700 dark:text-gray-200">Location</h3>
                                      <p className="text-gray-600 dark:text-gray-300">Ghaziabad, India</p>
                                  </div>
                              </div>
                          </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                        className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg"
                      >
                          <ContactForm />
                      </motion.div>
                  </div>

                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="pt-16 mt-16 border-t border-gray-200 dark:border-slate-700"
                  >
                      <div className="flex justify-center items-center gap-4 mb-8">
                          <h2 className="text-xl font-semibold text-center">Or Connect Via Socials</h2>
                          {isAdmin && (
                              <button onClick={openNewModal} className="btn-primary py-1 px-3 text-sm flex items-center">
                                  <PlusCircle size={16} className="mr-1.5" /> Add
                              </button>
                          )}
                      </div>
                      {isLoading ? <p className="text-center">Loading...</p> : (
                          <div className="flex flex-wrap justify-center items-center gap-5">
                              {socialLinks.map((link) => {
                                  const IconComponent = iconComponents[link.iconName.toLowerCase()] || iconComponents.default;
                                  const colors = colorMap[link.iconName.toLowerCase()] || colorMap.default;
                                  return (
                                      <motion.div key={link._id} className="relative group" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                          <a 
                                            href={link.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            title={link.name}
                                            className={`flex items-center justify-center h-14 w-14 rounded-full shadow-md transition-all duration-300 ${colors} ${!link.isEnabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                                          >
                                              <IconComponent size={24} />
                                          </a>
                                          {isAdmin && (
                                              <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                  <button onClick={() => openEditModal(link)} className="p-1.5 bg-yellow-400 text-black rounded-full shadow-lg"><Edit3 size={12} /></button>
                                                  <button onClick={() => handleDelete(link)} className="p-1.5 bg-red-600 text-white rounded-full shadow-lg"><Trash2 size={12} /></button>
                                              </div>
                                          )}
                                      </motion.div>
                                  );
                              })}
                          </div>
                      )}
                  </motion.div>
              </div>
            </div>
        </>
    );
};

export default ContactPage;