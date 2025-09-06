import React, { useState, useEffect, useContext } from "react";
import { getProjects } from "../api/project/projects";
import { ToastContext } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { Container, Box, Typography, CircularProgress, Pagination, Grid, Card, CardContent, Chip, Stack, Alert } from "@mui/material";

const Projects = () => {
	const { showToast } = useContext(ToastContext);
	const navigate = useNavigate();
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [projects, setProjects] = useState([]);
	const [totalPages, setTotalPages] = useState(1);
	const size = 10;

	useEffect(() => {
		const fetchProjects = async () => {
			setLoading(true);
			try {
				const response = await getProjects(page, size);
				setProjects(response.data.projects);
				setTotalPages(response.data.totalPages);
				console.log(response);
			} catch (error) {
				showToast(error.message || "Error fetching projects", "error");
			} finally {
				setLoading(false);
			}
		};
		fetchProjects();
	}, [page, showToast]);

	const handlePageChange = (event, value) => {
		setPage(value);
	};

	return (
		<Container sx={{ maxWidth: { xs: 400, sm: 600 } }}>
			<Box sx={{ my: 4 }}>
				<Typography variant="h4" component="h1" gutterBottom>
					Projects
				</Typography>

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
										<Card variant="outlined" elevation={0} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
											<CardContent>
												<Typography variant="h6" component="h2" gutterBottom>
													{project.title}
												</Typography>
												<Typography variant="body2" color="text.secondary" noWrap>
													{project.description}
												</Typography>
												<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
													Due Date: {new Date(project.dueDate).toLocaleDateString()}
												</Typography>
												<Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}>
													{project.tags.map((tag, index) => (
														<Chip color="info" key={index} label={tag} size="small" variant="outlined" />
													))}
												</Stack>
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
