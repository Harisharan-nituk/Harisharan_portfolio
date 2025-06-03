// frontend/src/components/projects/ProjectCard.js
import React from 'react';
import { Link } from 'react-router-dom'; // If you want title to link to a detail page

const ProjectCard = ({ project, onUpdate, onDelete, isAdminView }) => {
  const placeholderImage = 'https://via.placeholder.com/600x400/E2E8F0/4A5568?text=Project+Image';
  const imageUrl = project.imageUrl 
    ? `${process.env.REACT_APP_API_URL_WITHOUT_API_PREFIX || 'http://localhost:5001'}${project.imageUrl}` 
    : placeholderImage;

  const ProjectContent = () => (
    <>
      <img 
        src={imageUrl} 
        alt={project.title || 'Project image'} 
        className="w-full h-48 sm:h-56 object-cover group-hover:opacity-80 transition-opacity duration-300"
        onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }}
      />
      <div className="p-5 sm:p-6">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
          {project.title || 'Untitled Project'}
        </h3>
        <p className="text-gray-600 text-sm mb-3 h-20 overflow-y-auto custom-scrollbar"> 
          {/* Simple custom scrollbar styling can be added in index.css if needed */}
          {project.description ? project.description.substring(0, 150) + (project.description.length > 150 ? '...' : '') : 'No description available.'}
        </p>
        {project.technologies && project.technologies.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs text-gray-500 uppercase font-semibold mb-1.5">Technologies:</h4>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="mt-auto pt-4 flex flex-wrap gap-3 items-center justify-start border-t border-gray-200">
          {project.projectLink && (
            <a
              href={project.projectLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              View Project {/* External Link Icon (optional) */}
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-md transition duration-300 shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-600"
            >
              GitHub Repo {/* GitHub Icon (optional) */}
            </a>
          )}
          {/* For internal project detail page link, if you have one */}
          {/* <Link 
            to={`/projects/${project._id}`} // Example, if you create detail pages
            className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 shadow hover:shadow-md"
          >
            Details
          </Link> */}
        </div>
      </div>
    </>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl">
      {/* If projectLink exists, make the image and title a link, otherwise just display content */}
      {project.projectLink ? (
        <a href={project.projectLink} target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
          <ProjectContent />
        </a>
      ) : (
        <ProjectContent />
      )}

      {/* Admin Buttons: Conditionally rendered */}
      {isAdminView && (
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end items-center gap-3">
          <button
            onClick={() => onUpdate(project)}
            className="w-full sm:w-auto text-sm bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold py-2 px-4 rounded-md transition duration-300 shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
          >
            Update {/* Update Icon (optional) */}
          </button>
          <button
            onClick={() => onDelete(project._id, project.title)}
            className="w-full sm:w-auto text-sm bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Delete {/* Delete Icon (optional) */}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;