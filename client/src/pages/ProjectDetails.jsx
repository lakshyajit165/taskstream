// src/pages/ProjectDetails.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Box, Typography, CircularProgress, Button, Chip, Stack, Alert } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { ToastContext } from "../context/ToastContext";
import { getProjectById } from "../api/project/projects";

const ProjectDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { showToast } = useContext(ToastContext);

	const [loading, setLoading] = useState(false);
	const [project, setProject] = useState(null);

	useEffect(() => {
		const fetchProject = async () => {
			setLoading(true);
			try {
				const response = await getProjectById(id);
				setProject(response.data);
			} catch (error) {
				showToast(error.message || "Error fetching project", "error");
			} finally {
				setLoading(false);
			}
		};

		fetchProject();
	}, [id]);

	if (loading) {
		return (
			<Container sx={{ maxWidth: { xs: 400, sm: 600 } }}>
				<Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
					<CircularProgress />
				</Box>
			</Container>
		);
	}

	if (!project) {
		return (
			<Container sx={{ maxWidth: { xs: 400, sm: 600 } }}>
				<Box sx={{ my: 4 }}>
					<Alert severity="error">Project not found.</Alert>
				</Box>
			</Container>
		);
	}

	return (
		<Container sx={{ maxWidth: { xs: 400, sm: 600 } }}>
			<Box sx={{ my: 4 }}>
				{/* Title */}
				<Typography variant="h4" component="h1" gutterBottom>
					{project.title}
				</Typography>

				{/* Description (Markdown, no border) */}
				<Box sx={{ mb: 3 }}>
					<ReactMarkdown>{project.description}</ReactMarkdown>
				</Box>

				{/* Due Date */}
				<Typography variant="body1" sx={{ mb: 2 }}>
					<strong>Due Date:</strong> {new Date(project.dueDate).toLocaleDateString()}
				</Typography>

				{/* Tags */}
				{project.tags && project.tags.length > 0 && (
					<Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 3, gap: 1 }}>
						{project.tags.map((tag, index) => (
							<Chip key={index} label={tag} color="info" variant="outlined" />
						))}
					</Stack>
				)}

				{/* Buttons */}
				<Box sx={{ display: "flex", gap: 2 }}>
					<Button variant="contained" color="primary" onClick={() => navigate(`/projects/edit/${project.id}`)}>
						Update
					</Button>
					<Button variant="outlined" color="error" onClick={() => showToast("Delete functionality not implemented", "warning")}>
						Delete
					</Button>
				</Box>
			</Box>
		</Container>
	);
};

export default ProjectDetails;
