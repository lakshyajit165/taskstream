import React, { useState, useEffect, useContext } from "react";
import { getProjects } from "../../api/project/projects";
import { ToastContext } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { Container, Box, Typography, CircularProgress, Pagination, Stack, Chip, List, ListItem, ListItemText, Grid, TextField, IconButton } from "@mui/material";
import ReactMarkdown from "react-markdown";
import noDataImg from "../../assets/no_data.png";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { Link as RouterLink } from "react-router-dom";
import { Divider } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import TuneIcon from "@mui/icons-material/Tune";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { DatePicker } from "@mui/x-date-pickers";
import { buildQueryParams } from "../../api/utils/apiUtils";
import Badge from "@mui/material/Badge";

const Projects = () => {
	const { showToast } = useContext(ToastContext);
	const navigate = useNavigate();
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(true);
	const [projects, setProjects] = useState([]);
	const [totalPages, setTotalPages] = useState(1);
	const size = 3;
	const [openFilterDialog, setOpenFilterDialog] = useState(false);
	const [searchFilters, setSearchFilters] = useState({
		searchText: "",
		dueDateRangeStart: "",
		dueDateRangeEnd: "",
		createdDateRangeStart: "",
		createdDateRangeEnd: "",
		tags: [],
	});
	const [tagInput, setTagInput] = useState("");
	const [dialogFilterCount, setDialogFilterCount] = useState(0);

	useEffect(() => {
		fetchProjects();
	}, [page]);

	const handleSearchTextChange = async (event) => {
		setSearchFilters((filters) => {
			return { ...filters, searchText: event.target.value };
		});
		if (!searchFilters.searchText) {
			return;
		}
		await fetchProjects();
	};

	const handleFilterDialogOpen = () => {
		setOpenFilterDialog(true);
	};
	const handleFilterDialogClose = () => {
		setOpenFilterDialog(false);
		// clear search filters here
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		console.log(searchFilters);
		handleFilterDialogClose();
	};

	const fetchProjects = async () => {
		setLoading(true);
		try {
			// NOTE: Add search/filter parameters to getProjects here when implemented
			const queryParams = buildQueryParams(searchFilters, page, size);
			const response = await getProjects(queryParams);
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

	// Handle adding tags
	const handleAddTag = (e) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			const newTag = tagInput.trim();
			if (!newTag) {
				setTagInput("");
				return;
			}

			// Use functional update and avoid duplicates
			setSearchFilters((prev) => {
				const existingTags = prev.tags || [];
				if (existingTags.includes(newTag)) {
					return prev;
				}
				const newTags = [...existingTags, newTag];
				return { ...prev, tags: newTags };
			});

			setTagInput("");
		}
	};

	const handleDeleteTag = (tagToDelete) => {
		setSearchFilters((prev) => {
			const newTags = (prev.tags || []).filter((t) => t !== tagToDelete);
			return { ...prev, tags: newTags };
		});
	};

	// Component for rendering the project description in a clean way
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

				// --- FIX: Prevent Horizontal Scroll for all content ---
				"& *": {
					// General rule for all descendants to help with wrapping
					wordBreak: "break-word",
					overflowWrap: "break-word",
				},
				"& ul, & ol": {
					// Specifically for lists to ensure they don't overflow
					ml: 0,
					paddingLeft: "20px",
				},
				"& img": {
					// Make images responsive within the container
					maxWidth: "100%",
					height: "auto",
					display: "block",
				},
				// Increased specificity to ensure link styling applies
				"& a": {
					// Ensure text decoration is removed across all states
					textDecoration: "none",
					// Set the link color
					color: (theme) => theme.palette.text.primary,
					cursor: "pointer",
				},
				// Explicitly cover hover, focus, and visited states to ensure no underline appears
				"& a:hover, & a:focus, & a:visited, & a:active": {
					textDecoration: "none",
					color: (theme) => theme.palette.text.primary,
				},
				// --- END FIX ---
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
							value={searchFilters.searchText}
							onChange={handleSearchTextChange}
							slotProps={{
								input: {
									startAdornment: (
										<InputAdornment position="start">
											<SearchIcon />
										</InputAdornment>
									),
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
						<Badge badgeContent={dialogFilterCount} color="primary">
							<IconButton
								color=""
								aria-label="Toggle filters"
								onClick={handleFilterDialogOpen}
								size="small"
								sx={{
									borderRadius: 1,
									border: "1px solid",
									borderColor: "divider",
									p: "6px",
									flexShrink: 0,
								}}
							>
								<TuneIcon />
							</IconButton>
						</Badge>
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
			<Dialog open={openFilterDialog} onClose={handleFilterDialogClose} maxWidth="sm" fullWidth>
				<DialogTitle>Filter Projects</DialogTitle>
				<DialogContent>
					<form onSubmit={handleSubmit} id="filters-form">
						{/* --- Due Date Range --- */}
						<Typography variant="subtitle1" component="div" sx={{ mt: 1, mb: 1, fontWeight: "bold" }}>
							Due Date Range
						</Typography>
						{/* --- Due Date Range --- */}
						<Box sx={{ display: "flex", gap: 2, mb: 2 }}>
							<DatePicker
								label="From"
								format="dd/MM/yyyy"
								// Note: The 'name' prop on DatePicker doesn't work for state updates like on TextField
								sx={{ flexGrow: 1 }}
								value={searchFilters.dueDateRangeStart ? new Date(searchFilters.dueDateRangeStart) : null}
								onChange={(newValue) => {
									const newDueDateRangeStart = newValue ? newValue.toISOString() : "";
									if (newDueDateRangeStart && searchFilters.dueDateRangeStart === "") {
										setDialogFilterCount(dialogFilterCount + 1);
									}
									if (newDueDateRangeStart === "") {
										setDialogFilterCount(dialogFilterCount - 1);
									}
									setSearchFilters((prev) => ({
										...prev,
										dueDateRangeStart: newDueDateRangeStart,
									}));
								}}
							/>
							<DatePicker
								label="To"
								format="dd/MM/yyyy"
								sx={{ flexGrow: 1 }}
								value={searchFilters.dueDateRangeEnd ? new Date(searchFilters.dueDateRangeEnd) : null}
								onChange={(newValue) => {
									const newDueDateRangeEnd = newValue ? newValue.toISOString() : "";
									if (newDueDateRangeEnd && searchFilters.dueDateRangeEnd === "") {
										setDialogFilterCount(dialogFilterCount + 1);
									}
									if (newDueDateRangeEnd === "") {
										setDialogFilterCount(dialogFilterCount - 1);
									}
									setSearchFilters((prev) => ({
										...prev,
										dueDateRangeEnd: newDueDateRangeEnd,
									}));
								}}
							/>
						</Box>

						{/* --- Created Date Range --- */}
						<Typography variant="subtitle1" component="div" sx={{ mb: 1, fontWeight: "bold" }}>
							Created Date Range
						</Typography>
						<Box sx={{ display: "flex", gap: 2, mb: 2 }}>
							<DatePicker
								label="From"
								format="dd/MM/yyyy"
								sx={{ flexGrow: 1 }}
								value={searchFilters.createdDateRangeStart ? new Date(searchFilters.createdDateRangeStart) : null}
								onChange={(newValue) => {
									const newCreatedDateRangeStart = newValue ? newValue.toISOString() : "";
									if (newCreatedDateRangeStart && searchFilters.createdDateRangeStart === "") {
										setDialogFilterCount(dialogFilterCount + 1);
									}
									if (newCreatedDateRangeStart === "") {
										setDialogFilterCount(dialogFilterCount - 1);
									}
									setSearchFilters((prev) => ({
										...prev,
										createdDateRangeStart: newCreatedDateRangeStart,
									}));
								}}
							/>
							<DatePicker
								label="To"
								format="dd/MM/yyyy"
								sx={{ flexGrow: 1 }}
								value={searchFilters.createdDateRangeEnd ? new Date(searchFilters.createdDateRangeEnd) : null}
								onChange={(newValue) => {
									const newCreatedDateRangeEnd = newValue ? newValue.toISOString() : "";
									if (newCreatedDateRangeEnd && searchFilters.createdDateRangeEnd === "") {
										setDialogFilterCount(dialogFilterCount + 1);
									}
									if (newCreatedDateRangeEnd === "") {
										setDialogFilterCount(dialogFilterCount - 1);
									}
									setSearchFilters((prev) => ({
										...prev,
										createdDateRangeEnd: newCreatedDateRangeEnd,
									}));
								}}
							/>
						</Box>

						{/* --- Tags Field --- */}
						<TextField
							label="Tags"
							placeholder="Type a tag and press Enter or Comma"
							fullWidth
							value={tagInput}
							onChange={(e) => setTagInput(e.target.value)}
							onKeyDown={handleAddTag}
							margin="normal"
						/>
						<Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1.5, columnGap: 1.5 }}>
							{searchFilters.tags.map((tag, index) => (
								<Chip key={index} label={tag} onDelete={() => handleDeleteTag(tag)} color="info" variant="outlined" />
							))}
						</Stack>
					</form>
				</DialogContent>

				<DialogActions
					sx={{
						justifyContent: "flex-start",
						padding: "16px 24px", // Standard MUI padding (slightly cleaner than 25px)
					}}
				>
					<Button variant="contained" type="submit" form="filters-form">
						Apply
					</Button>
					<Button variant="outlined" onClick={handleFilterDialogClose}>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
};

export default Projects;
