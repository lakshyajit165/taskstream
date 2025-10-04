import React, { useState } from "react";
import { ProjectContext } from "../context/ProjectContext";

// 2. Create the Provider Component
export const ProjectProvider = ({ children }) => {
	// Initialize state to null. No sessionStorage dependency.
	const [selectedProject, setSelectedProject] = useState(null);

	// 3. Value provided to components
	const contextValue = {
		selectedProject, // The currently selected project object
		setSelectedProject, // Function to update the selected project globally
	};

	return <ProjectContext.Provider value={contextValue}>{children}</ProjectContext.Provider>;
};
