import React, { useState, useEffect, useContext } from "react";
import { getProjects } from "../../api/project/projects";
import { ToastContext } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { Container, Box, Typography, CircularProgress, Pagination, Grid, Card, CardContent, IconButton, Button, Stack, Chip } from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import ReactMarkdown from "react-markdown";
import noDataImg from "../../assets/no_data.png";
import AddIcon from "@mui/icons-material/Add";
import { Link as RouterLink } from "react-router-dom";
import Link from "@mui/material/Link";
import { Divider } from "@mui/material";

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
				{/* Heading + Add Project Button */}
				<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
					<Typography variant="h5" component="h5">
						Projects
					</Typography>
					<Link component={RouterLink} to="/projects/new" underline="none" color="primary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
						Add <AddIcon fontSize="small" />
					</Link>
				</Box>
				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
						<CircularProgress />
					</Box>
				) : (
					<>
						{projects.length === 0 ? (
							<Box sx={{ my: 4, textAlign: "center" }}>
								<img src={noDataImg} alt="No projects illustration" style={{ maxWidth: "300px", marginBottom: "16px" }} />
								<Typography variant="body1" color="text.secondary">
									No projects found. Please create one to get started.
								</Typography>
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
												<Typography variant="h6" component="h2" sx={{ mb: 1 }}>
													{project.title}
												</Typography>

												<Box
													sx={{
														color: "text.secondary",
														typography: "body2",
														overflow: "hidden",
														textOverflow: "ellipsis",
														display: "-webkit-box",
														WebkitLineClamp: 4,
														WebkitBoxOrient: "vertical",
														mb: 1,
														"& p": { m: 0 }, // remove default paragraph margins
														"& h1, & h2, & h3, & h4, & h5, & h6": { m: 0, fontSize: "inherit" }, // flatten markdown headings
													}}
												>
													<ReactMarkdown>{project.description}</ReactMarkdown>
												</Box>

												<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
													Due Date: {new Date(project.dueDate).toLocaleDateString()}
												</Typography>

												{/* ✅ Stacked Chips */}
												{project.tags && project.tags.length > 0 && (
													<Stack
														direction="row"
														spacing={1}
														sx={{
															flexWrap: "wrap",
															rowGap: 1,
															columnGap: 1,
															mt: 1,
														}}
													>
														{project.tags.map((tag, index) => (
															<Chip key={index} label={tag} size="small" color="info" variant="outlined" />
														))}
													</Stack>
												)}
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
