// frontend/src/components/common/Footer.js
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-700 text-gray-300 text-center p-6 shadow-inner">
      <div className="container mx-auto">
        <p className="text-sm">
          &copy; {currentYear} Your Name. All Rights Reserved.
        </p>
        {/* Optional: Add links to social media or other relevant info */}
        {/* <div className="mt-2">
          <a href="https://linkedin.com/yourprofile" target="_blank" rel="noopener noreferrer" className="hover:text-white mx-2 text-sm">LinkedIn</a>
          <a href="https://github.com/yourprofile" target="_blank" rel="noopener noreferrer" className="hover:text-white mx-2 text-sm">GitHub</a>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;