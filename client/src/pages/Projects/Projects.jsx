import React, { useState, useEffect, useContext } from "react";
import { getProjects } from "../../api/project/projects";
import { ToastContext } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { Container, Box, Typography, CircularProgress, Pagination, Stack, Chip, List, ListItem, ListItemText, Grid, TextField, IconButton } from "@mui/material";
import ReactMarkdown from "react-markdown";
import noDataImg from "../../assets/no_data.png";
import AddIcon from "@mui/icons-material/Add";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { Link as RouterLink } from "react-router-dom";
import { Divider } from "@mui/material";

const Projects = () => {
	const { showToast } = useContext(ToastContext);
	const navigate = useNavigate();
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [projects, setProjects] = useState([]);
	const [totalPages, setTotalPages] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const [isFiltering, setIsFiltering] = useState(false);
	const size = 3;

	useEffect(() => {
		fetchProjects();
	}, [page]);

	const fetchProjects = async () => {
		setLoading(true);
		try {
			// NOTE: Add search/filter parameters to getProjects here when implemented
			const response = await getProjects(page, size);
			setProjects(response.data.projects);
			setTotalPages(response.data.totalPages);
		} catch (error) {
			showToast(error.message || "Error fetching projects", "error");
		} finally {
			setLoading(false);
		}
	};

	const handlePageChange = (event, value) => {
		setPage(value);
	};

	// Component for rendering the project description in a clean way
	const ProjectDescription = ({ description }) => (
		<Box
			sx={{
				typography: "body1",
				overflow: "hidden",
				textOverflow: "ellipsis",
				display: "-webkit-box",
				WebkitLineClamp: 2,
				WebkitBoxOrient: "vertical",
				mt: 0.5,
				"& p": { m: 0 },
				"& h1, & h2, & h3, & h4, & h5, & h6": { m: 0, fontSize: "inherit" },
			}}
		>
			<ReactMarkdown>{description}</ReactMarkdown>
		</Box>
	);

	return (
		// Container set to 'sm' as requested
		<Container maxWidth="sm">
			<Box sx={{ my: 4 }}>
				{/* --- HEADER: Search Field (Full Width) + Icon Buttons --- */}
				<Box sx={{ mb: 3 }}>
					{/* Flex layout for search + buttons */}
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						{/* Search Field expands to fill available space */}
						<TextField
							fullWidth
							variant="outlined"
							size="small"
							placeholder="Search projects..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							slotProps={{
								SearchIcon: {
									marginRight: 1,
									color: "action",
								},
							}}
							sx={{ flexGrow: 1 }}
						/>

						{/* Add Button */}
						<IconButton
							component={RouterLink}
							to="/projects/new"
							color="primary"
							aria-label="Create new project"
							size="small"
							sx={{
								borderRadius: 1,
								border: "1px solid",
								borderColor: "primary.main",
								p: "6px",
								flexShrink: 0, // prevents shrinking
							}}
						>
							<AddIcon />
						</IconButton>

						{/* Filter Button */}
						<IconButton
							color=""
							aria-label="Toggle filters"
							onClick={() => setIsFiltering(!isFiltering)}
							size="small"
							sx={{
								borderRadius: 1,
								border: "1px solid",
								borderColor: "divider",
								p: "6px",
								flexShrink: 0,
							}}
						>
							<FilterAltOutlinedIcon />
						</IconButton>
					</Box>
				</Box>

				{/* --- END HEADER --- */}

				{/* Content */}
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
							<List disablePadding>
								{projects.map((project, index) => (
									<React.Fragment key={project.id}>
										<ListItem
											button
											alignItems="flex-start"
											onClick={() => navigate(`/projects/${project.id}`)}
											sx={{
												px: 2,
												py: 2,
												"&:hover": {
													backgroundColor: (theme) => theme.palette.action.hover,
												},
											}}
										>
											<ListItemText
												primary={
													<Typography variant="h6" component="h2" sx={{ mb: 0 }}>
														{project.title}
													</Typography>
												}
												// FIX: Use secondaryTypographyProps to change the wrapper from <p> to <span>
												secondaryTypographyProps={{
													component: "span",
												}}
												secondary={
													<Box>
														{/* Description */}
														<ProjectDescription description={project.description} />

														{/* Due Date */}
														<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
															Due: {new Date(project.dueDate).toLocaleDateString()}
														</Typography>

														{/* Tags */}
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
																{project.tags.map((tag, tagIndex) => (
																	<Chip key={tagIndex} label={tag} size="small" color="info" variant="outlined" />
																))}
															</Stack>
														)}
													</Box>
												}
											/>
										</ListItem>
										{/* Add a divider between list items for better separation */}
										{index < projects.length - 1 && <Divider component="li" variant="fullWidth" />}
									</React.Fragment>
								))}
							</List>
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
