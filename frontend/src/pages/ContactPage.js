// frontend/src/pages/ContactPage.js
import React from 'react';
import ContactForm from '../components/contact/ContactForm'; // Assuming you have this component

const ContactPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">Get In Touch</h1>
        <p className="text-gray-600 mb-8 text-center leading-relaxed">
          I'm always excited to discuss new projects, creative ideas, or opportunities to be part of something amazing.
          Feel free to reach out using the form below, or connect with me on social media.
        </p>
        <ContactForm />
        {/* You can add social media links here if you like */}
        {/* <div className="mt-10 text-center">
          <p className="text-gray-600 mb-2">Or find me on:</p>
          <a href="#" className="text-indigo-600 hover:underline mx-2">LinkedIn</a>
          <a href="#" className="text-indigo-600 hover:underline mx-2">GitHub</a>
        </div> */}
      </div>
    </div>
  );
};

export default ContactPage;