// frontend/src/components/resumes/ResumeCard.js
import React from 'react';

// Simple placeholder for icons (replace with actual SVG icons later)
// const DownloadIcon = () => <span className="mr-2">⬇️</span>;
// const UpdateIcon = () => <span className="mr-2">✏️</span>;
// const DeleteIcon = () => <span className="mr-2">🗑️</span>;

const ResumeCard = ({ resume, onUpdate, onDelete, isAdminView }) => { // Added isAdminView prop
  const downloadUrl = `${process.env.REACT_APP_API_URL_WITHOUT_API_PREFIX || 'http://localhost:5001'}/uploads/resumes/${resume.storedFilename}`;
  const previewUrl = `${downloadUrl}#view=fitH&toolbar=0&navpanes=0&scrollbar=0&t=${new Date().getTime()}`;

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-3xl">
      {/* Header Section with Gradient Example */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <h2 className="text-xl sm:text-2xl font-bold truncate" title={resume.field}>
          {resume.field}
        </h2>
        <p className="text-xs sm:text-sm text-indigo-100 mt-1 truncate" title={resume.originalFilename}>
          File: {resume.originalFilename}
        </p>
      </div>

      {/* PDF Preview Area */}
      <div className="flex-grow h-80 sm:h-96 md:h-[450px] border-y border-gray-200 bg-gray-200">
        <iframe
          src={previewUrl}
          title={`Preview of ${resume.field} resume`}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          allowFullScreen
        >
          <div className="p-4 text-center text-gray-700">
            <p>PDF preview not available or browser does not support embedding.</p>
            <a href={downloadUrl} download={resume.originalFilename} className="text-indigo-500 hover:underline font-semibold mt-2 inline-block">
              Download PDF instead
            </a>
          </div>
        </iframe>
      </div>

      {/* Action Buttons Area */}
      <div className="p-4 sm:p-5 bg-gray-50">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
          <a
            href={downloadUrl}
            download={resume.originalFilename}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center text-center bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg text-sm shadow-md hover:shadow-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
          >
            {/* <DownloadIcon /> */} Download
          </a>
          {/* Conditionally render Update and Delete buttons based on isAdminView */}
          {isAdminView && (
            <>
              <button
                onClick={() => onUpdate(resume)}
                className="w-full sm:w-auto flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold py-2.5 px-5 rounded-lg text-sm shadow-md hover:shadow-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-75"
              >
                {/* <UpdateIcon /> */} Update
              </button>
              <button
                onClick={() => onDelete(resume._id, resume.field)}
                className="w-full sm:w-auto flex items-center justify-center bg-red-500 hover:bg-red-700 text-white font-semibold py-2.5 px-5 rounded-lg text-sm shadow-md hover:shadow-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
              >
                {/* <DeleteIcon /> */} Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeCard;