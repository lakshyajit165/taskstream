import React, { useState, useEffect, useContext } from "react";
import { getProjects } from "../api/project/projects";
import { ToastContext } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";

const Projects = () => {
	const { showToast } = useContext(ToastContext);
	const navigate = useNavigate();
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [project, setProjects] = useState([]);
	const size = 10;
	useEffect(() => {
		const fetchProjects = async () => {
			setLoading(true);
			try {
				const response = await getProjects(page, size);
				setProjects(response.data.projects);
				console.log(response);
			} catch (error) {
				showToast(error.message || "Error fetching projects", "error");
			} finally {
				setLoading(false);
			}
		};
		fetchProjects();
	}, [page]);
	return loading ? <h1>Loading projects...</h1> : <h1>Projects page</h1>;
};

export default Projects;
