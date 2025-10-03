// src/pages/ProjectDetails.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Box, Typography, CircularProgress, Button, Chip, Stack, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { ToastContext } from "../../context/ToastContext";
import { deleteProject, getProjectById } from "../../api/project/projects";

const ProjectDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { showToast } = useContext(ToastContext);

	const [projectDetailsLoading, setProjectDetailsLoading] = useState(false);
	const [deleteProjectLoading, setDeleteProjectLoading] = useState(false);
	const [project, setProject] = useState(null);

	const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);

	const handleDeleteProject = async () => {
		setDeleteProjectLoading(true);
		try {
			const response = await deleteProject(id);
			showToast(response.message, "info");
		} catch (error) {
			showToast(error.message || "Error deleting project", "error");
		} finally {
			setDeleteProjectLoading(false);
			setDeleteProjectDialogOpen(false);
			navigate("/projects");
		}
	};

	useEffect(() => {
		const fetchProject = async () => {
			setProjectDetailsLoading(true);
			try {
				const response = await getProjectById(id);
				setProject(response.data);
			} catch (error) {
				showToast(error.message || "Error fetching project", "error");
			} finally {
				setProjectDetailsLoading(false);
			}
		};

		fetchProject();
	}, [id]);

	if (projectDetailsLoading) {
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
				{project && project.additionalParams && project.additionalParams.isEditable ? (
					<Box sx={{ display: "flex", gap: 2 }}>
						<Button variant="contained" color="primary" onClick={() => navigate(`/projects/edit/${project.id}`)}>
							Update
						</Button>
						<Button variant="outlined" color="error" onClick={() => setDeleteProjectDialogOpen(true)}>
							Delete
						</Button>{" "}
					</Box>
				) : (
					<></>
				)}

				<Dialog
					open={deleteProjectDialogOpen}
					onClose={() => setDeleteProjectDialogOpen(false)}
					aria-labelledby="delete-project-dialog-title"
					aria-describedby="delete-project-dialog-description"
					sx={{
						"& .MuiPaper-root": {
							minWidth: "350px",
						},
					}}
				>
					<DialogTitle id="delete-project-dialog-title">{"Delete Project"}</DialogTitle>
					<DialogContent>
						<DialogContentText id="delete-project-dialog-description">Are you sure you want to delete this project?</DialogContentText>
					</DialogContent>
					<DialogActions
						sx={{
							justifyContent: "flex-start",
							padding: "22px",
						}}
					>
						<Button variant="contained" onClick={handleDeleteProject} loading={deleteProjectLoading} loadingIndicator="Deleting project...">
							Yes
						</Button>
						<Button variant="outlined" onClick={() => setDeleteProjectDialogOpen(false)} autoFocus>
							Cancel
						</Button>
					</DialogActions>
				</Dialog>
			</Box>
		</Container>
	);
};

export default ProjectDetails;
