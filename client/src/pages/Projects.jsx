import React, { useState, useEffect, useContext } from "react";
import { getProjects } from "../api/project/projects";
import { ToastContext } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { Container, Box, Typography, CircularProgress, Pagination, Grid, Card, CardContent, IconButton, Alert, Button } from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import ReactMarkdown from "react-markdown";

const Projects = () => {
	const { showToast } = useContext(ToastContext);
	const navigate = useNavigate();
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [projects, setProjects] = useState([]);
	const [totalPages, setTotalPages] = useState(1);
	const size = 3;

	useEffect(() => {
		const fetchProjects = async () => {
			setLoading(true);
			try {
				const response = await getProjects(page, size);
				setProjects(response.data.projects);
				setTotalPages(response.data.totalPages);
			} catch (error) {
				showToast(error.message || "Error fetching projects", "error");
			} finally {
				setLoading(false);
			}
		};
		fetchProjects();
	}, [page]);

	const handlePageChange = (event, value) => {
		setPage(value);
	};

	return (
		<Container sx={{ maxWidth: { xs: 400, sm: 600 } }}>
			<Box sx={{ my: 4 }}>
				{/* Heading + Add Project Button (restored to original Button) */}
				<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
					<Typography variant="h4" component="h2">
						Projects
					</Typography>
					<Button variant="outlined" onClick={() => navigate("/projects/new")}>
						Add
					</Button>
				</Box>

				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
						<CircularProgress />
					</Box>
				) : (
					<>
						{projects.length === 0 ? (
							<Box sx={{ my: 4 }}>
								<Alert severity="info">No projects found. Please create one!</Alert>
							</Box>
						) : (
							<Grid container spacing={4}>
								{projects.map((project) => (
									<Grid item xs={12} sm={6} md={4} key={project.id}>
										<Card variant="outlined" elevation={0} sx={{ height: "100%", position: "relative" }}>
											{/* Arrow button top-right */}
											<IconButton
												size="small"
												sx={{ position: "absolute", top: 8, right: 8 }}
												onClick={() => navigate(`/projects/${project.id}`)}
												aria-label={`Open ${project.title}`}
											>
												<KeyboardArrowRightIcon fontSize="small" />
											</IconButton>

											<CardContent>
												<Typography variant="h6" component="h2" gutterBottom>
													{project.title}
												</Typography>

												<Box
													sx={{
														color: "text.secondary",
														typography: "body2",
														overflow: "hidden",
														textOverflow: "ellipsis",
														display: "-webkit-box",
														WebkitLineClamp: 5, // ✅ keep it 5 lines
														WebkitBoxOrient: "vertical",
													}}
												>
													<ReactMarkdown>{project.description}</ReactMarkdown>
												</Box>

												<Typography variant="body2" color="text.secondary">
													Due Date: {new Date(project.dueDate).toLocaleDateString()}
												</Typography>
											</CardContent>
										</Card>
									</Grid>
								))}
							</Grid>
						)}

						{totalPages > 1 && (
							<Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
								<Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
							</Box>
						)}
					</>
				)}
			</Box>
		</Container>
	);
};

export default Projects;
