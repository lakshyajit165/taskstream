// src/pages/ProjectDetails.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Box, Typography, CircularProgress, Button, Chip, Stack, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { ToastContext } from "../../context/ToastContext";
import { deleteProject, getProjectById } from "../../api/project/projects";
import resourceNotFoundLightTheme from "../../assets/resource_not_found_light_theme.png";
import resourceNotFoundDarkTheme from "../../assets/resource_not_foun_dark_theme.png";
import { CustomThemeContext } from "../../context/CustomThemeContext";

const ProjectDetails = () => {
	const { mode } = useContext(CustomThemeContext);
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
			<Box
				sx={{
					// 1. Enable Flexbox for alignment
					display: "flex",
					// 2. Set direction to column so items stack vertically
					flexDirection: "column",
					// 3. Vertically center the content
					justifyContent: "center",
					// 4. Horizontally center the content (for the Typography and image)
					alignItems: "center",
					// 5. Ensure the box takes up the full viewport height minus any header/footer
					//    (or 100% of its parent container, e.g., the DrawerMenu content area)
					minHeight: "50vh", // Adjust this value (e.g., 100vh, 80vh) based on your layout needs

					// Remove the redundant my: 4 style as centering handles the placement
				}}
			>
				<img
					src={mode === "light" ? resourceNotFoundLightTheme : resourceNotFoundDarkTheme}
					alt="Page not found illustration" // Improved alt text
					style={{
						maxWidth: "300px",
						marginBottom: "5px",
					}}
				/>
				<Typography variant="body1" color="text.secondary" sx={{ textAlign: "center" }}>
					Project not found
				</Typography>
			</Box>
		);
	}

	return (
		<Container sx={{ maxWidth: { xs: 400, sm: 800 } }}>
			<Box sx={{ my: 4 }}>
				{/* Title */}
				<Typography variant="h5" component="h1" gutterBottom>
					{project.title}
				</Typography>

				{/* Description (Markdown, no border) */}
				<Box
					sx={{
						mb: 3,
						// --- General Markdown Styling Fixes ---
						"& *": {
							// Ensure all content wraps properly
							wordBreak: "break-word",
							overflowWrap: "break-word",
						},
						"& ul, & ol": {
							ml: 0,
							paddingLeft: "20px",
						},
						"& img": {
							// Make images responsive
							maxWidth: "100%",
							height: "auto",
							display: "block",
						},
						// --- FIX FOR LINKS (<a> tags) ---
						"& a": {
							textDecoration: "none",
							// Use primary color for visibility on a detail page
							color: (theme) => theme.palette.primary.main,
							cursor: "pointer",
						},
						// Ensure no underline appears on hover/focus/visited/active
						"& a:hover, & a:focus, & a:visited, & a:active": {
							textDecoration: "none",
							color: (theme) => theme.palette.primary.main, // Slightly darker on hover
						},
						// --- END FIX ---
					}}
				>
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
					maxWidth="sm"
				>
					<DialogTitle id="delete-project-dialog-title">{"Delete Project"}</DialogTitle>
					<DialogContent>
						<DialogContentText id="delete-project-dialog-description">
							Deleting this project will permanently delete all linked tasks. Are you sure you wish to delete this project?
						</DialogContentText>
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
