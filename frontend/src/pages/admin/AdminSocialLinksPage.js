import React, { useState, useEffect } from 'react';
import * as socialLinkService from '../../services/socialLinkService';
import { useAuth } from '../../contexts/AuthContext';
import { PlusCircle, Edit3, Trash2, Smartphone, Github, Linkedin, Twitter as TwitterIconLucide, Code, ExternalLink, Globe, Link as LinkIcon, Mail, Info } from 'lucide-react';

// This maps the icon name stored in the DB to the actual icon component
export const iconComponents = {
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

// This is the Add/Edit Modal Component
const SocialLinkFormModal = ({ show, onClose, onSave, currentLink, isLoading }) => {
    const isEditing = !!currentLink?._id;
    const [formData, setFormData] = useState({ name: '', url: '', label: '', iconName: 'default', isEnabled: true, displayOrder: 0 });

    useEffect(() => {
        if (show) {
            if (isEditing && currentLink) {
                setFormData({
                    name: currentLink.name || '',
                    url: currentLink.url || '',
                    label: currentLink.label || '',
                    iconName: currentLink.iconName || 'default',
                    isEnabled: currentLink.isEnabled !== undefined ? currentLink.isEnabled : true,
                    displayOrder: currentLink.displayOrder || 0,
                });
            } else {
                setFormData({ name: '', url: '', label: '', iconName: 'default', isEnabled: true, displayOrder: 0 });
            }
        }
    }, [currentLink, isEditing, show]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value, 10) || 0 : value) }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.url.trim() || !formData.iconName.trim()) {
            alert('Platform Name, URL, and Icon Name are required.');
            return;
        }
        onSave(formData, currentLink?._id);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-start p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg my-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">{isEditing ? 'Edit Social Link' : 'Add New Social Link'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="link-name-modal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform Name*</label>
                        <input type="text" name="name" id="link-name-modal" value={formData.name} onChange={handleChange} required className="input-style w-full" placeholder="e.g., GitHub, LinkedIn"/>
                    </div>
                    <div>
                        <label htmlFor="link-url-modal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL*</label>
                        <input type="url" name="url" id="link-url-modal" value={formData.url} onChange={handleChange} required className="input-style w-full" placeholder="https://github.com/your-username"/>
                    </div>
                    <div>
                        <label htmlFor="link-iconName-modal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon*</label>
                        <select name="iconName" id="link-iconName-modal" value={formData.iconName} onChange={handleChange} required className="input-style w-full">
                            {Object.keys(iconComponents).map(iconKey => (
                                <option key={iconKey} value={iconKey}>{iconKey.charAt(0).toUpperCase() + iconKey.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={isLoading} className="btn-primary">{isLoading ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// This is the main page component
const AdminSocialLinksPage = () => {
    const { isAdmin } = useAuth();
    const [links, setLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchLinks = async () => { /* ... handler logic from previous steps ... */ };
    useEffect(() => { if (isAdmin) fetchLinks(); }, [isAdmin]);
    const handleSaveLink = async (formData, id) => { /* ... handler logic from previous steps ... */ };
    const handleDeleteLink = async (id, name) => { /* ... handler logic from previous steps ... */ };
    const openModalForNew = () => { setEditingLink(null); setIsModalOpen(true); };
    const openModalForEdit = (link) => { setEditingLink(link); setIsModalOpen(true); };

    if (!isAdmin) {
        return <div className="p-6 text-center text-red-500">You are not authorized to view this page.</div>;
    }
    if (isLoading) return <div className="p-6 text-center text-gray-500">Loading...</div>;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

    return (
        <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 shadow-xl rounded-xl">
            {isModalOpen && <SocialLinkFormModal show={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveLink} currentLink={editingLink} isLoading={isProcessing} />}

            <div className="flex justify-between items-center mb-6 pb-4 border-b dark:border-slate-700">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Manage Social Links</h1>
                <button onClick={openModalForNew} className="btn-primary flex items-center">
                    <PlusCircle size={18} className="mr-2" /> Add Link
                </button>
            </div>

            <div className="space-y-4">
                {links.length > 0 ? (
                    links.map(link => {
                        const IconComp = iconComponents[link.iconName?.toLowerCase()] || iconComponents.default;
                        return (
                            <div key={link._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <IconComp className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{link.name}</p>
                                        <a href={link.url} className="text-sm text-blue-500 hover:underline">{link.url}</a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => openModalForEdit(link)} className="btn-secondary py-2 px-4 text-sm">Update</button>
                                    <button onClick={() => handleDeleteLink(link._id, link.name)} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg text-sm">Delete</button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center text-gray-500 py-8">No social links yet. Click "Add Link" to get started.</p>
                )}
            </div>
        </div>
    );
};

export default AdminSocialLinksPage;