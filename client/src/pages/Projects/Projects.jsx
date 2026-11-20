import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { getProjects } from "../../api/project/projects";
import { ToastContext } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { Container, Box, Typography, CircularProgress, Pagination, Stack, Chip, List, ListItemButton, Paper, TextField, IconButton } from "@mui/material";
import ReactMarkdown from "react-markdown";
import noDataImg from "../../assets/no_data.png";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { Link as RouterLink } from "react-router-dom";
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
	const defaultSearchFilters = {
		searchText: "",
		dueDateRangeStart: "",
		dueDateRangeEnd: "",
		createdDateRangeStart: "",
		createdDateRangeEnd: "",
		tags: [],
	};
	const [searchFilters, setSearchFilters] = useState(defaultSearchFilters);
	const [tagInput, setTagInput] = useState("");
	const [dialogFilterCount, setDialogFilterCount] = useState(0);
	const searchTimeoutRef = useRef(null);

	/**
	 *	Hook
       	- useCallback		 
	   		- Primary Purpose: Caches the provided function definition itself.	
			- When to Use: When passing a function to an optimized child component to 
				prevent unnecessary re-renders.
		- useMemo	
			- Primary Purpose: Caches the result of an expensive function call (a value).	
			- When to Use: When calculating a costly value that shouldn't be re-calculated on every render.
	 * 
	*/

	const fetchProjects = useCallback(
		async (filtersToUse = searchFilters) => {
			setLoading(true);
			try {
				// NOTE: Add search/filter parameters to getProjects here when implemented
				const queryParams = buildQueryParams(filtersToUse, page, size);
				const response = await getProjects(queryParams);
				setProjects(response.data.projects);
				setTotalPages(response.data.totalPages);
			} catch (error) {
				showToast(error.message || "Error fetching projects", "error");
			} finally {
				setLoading(false);
			}
		},
		[page, size],
	);

	useEffect(() => {
		fetchProjects();
	}, [page]);

	// --- Debounced Project Search Function ---

	const handleSearchTextChange = useCallback(
		async (event) => {
			const newSearchText = event.target.value;
			const searchFiltersForRequest = { ...searchFilters, searchText: newSearchText };

			// Immediately update the display state (the input field)
			setSearchFilters((filters) => {
				return { ...filters, searchText: newSearchText };
			});

			// Clear any existing timer
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}

			// Only start debouncing if the query is not empty
			if (!newSearchText.trim()) {
				// If query is cleared, fetch immediately to reset the list
				if (searchFilters.searchText.trim()) {
					await fetchProjects(searchFiltersForRequest);
				}
				return;
			}

			// Set a new timer
			searchTimeoutRef.current = setTimeout(() => {
				fetchProjects(searchFiltersForRequest);
			}, 500); // Debounce delay of 500ms
		},
		[searchFilters, fetchProjects],
	);

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
				if (existingTags.length === 0 && newTags.length > 0) {
					setDialogFilterCount(dialogFilterCount + 1);
				}
				return { ...prev, tags: newTags };
			});

			setTagInput("");
		}
	};

	const handleDeleteTag = (tagToDelete) => {
		setSearchFilters((prev) => {
			const existingTags = prev.tags || [];
			const newTags = (prev.tags || []).filter((t) => t !== tagToDelete);
			if (existingTags.length > 0 && newTags.length === 0) {
				setDialogFilterCount(dialogFilterCount - 1);
			}
			return { ...prev, tags: newTags };
		});
	};

	const applySearchFilters = async () => {
		await fetchProjects(searchFilters);
	};

	const handleClearFilters = async () => {
		// 1. Reset state to default values (This triggers UI updates)
		setSearchFilters(defaultSearchFilters);
		setTagInput("");

		// 2. Clear any running debounce timer
		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}

		// 3. Await the fetch, explicitly using the default filters
		await fetchProjects(defaultSearchFilters);

		setDialogFilterCount(0);
		handleFilterDialogClose();
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
		<Container maxWidth={false} sx={{ width: "100%", maxWidth: { xs: "100%", sm: "820px" }, py: { xs: 2.5, sm: 4 } }}>
			<Box sx={{ mb: { xs: 3, sm: 4 } }}>
				<Box sx={{ mb: 2.5 }}>
					<Typography variant="h4" component="h1" sx={{ fontWeight: 600, fontSize: { xs: "1.75rem", sm: "2rem" } }}>
						Projects
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
						Manage your project spaces and keep work organized.
					</Typography>
				</Box>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
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
							sx={{ flex: "1 1 260px", minWidth: { xs: "100%", sm: 240 } }}
						/>
						<IconButton
							component={RouterLink}
							to="/projects/new"
							color="primary"
							aria-label="Create new project"
						sx={{ width: 40, height: 40, flexShrink: 0, border: 1, borderColor: "divider", borderRadius: 1 }}
						>
							<AddIcon />
						</IconButton>
						<Badge badgeContent={dialogFilterCount} color="primary">
							<IconButton
								color="default"
								aria-label="Toggle filters"
								onClick={handleFilterDialogOpen}
								size="small"
								sx={{ minWidth: 40, minHeight: 40, border: 1, borderColor: "divider", borderRadius: 1 }}
							>
								<TuneIcon />
							</IconButton>
						</Badge>
					</Box>
				</Box>

				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
						<CircularProgress />
					</Box>
				) : (
					<>
						{projects.length === 0 ? (
							<Box sx={{ py: { xs: 4, sm: 6 }, px: 2, textAlign: "center" }}>
								<img src={noDataImg} alt="No projects illustration" style={{ maxWidth: "300px", marginBottom: "16px" }} />
								<Typography variant="h6" component="p" sx={{ fontWeight: 600, mb: 0.75 }}>
									No projects found
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Create a project to get started, or adjust your search and filters.
								</Typography>
							</Box>
						) : (
							<List disablePadding component="ul" sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
								{projects.map((project) => (
									<Paper key={project.id} component="li" variant="outlined" sx={{ listStyle: "none", overflow: "hidden", borderLeft: 3, borderLeftColor: "primary.main", transition: "box-shadow 150ms ease", "&:hover": { boxShadow: 1 } }}>
										<ListItemButton onClick={() => navigate(`/projects/${project.id}`)} sx={{ p: { xs: 1.75, sm: 2.25 }, alignItems: "flex-start", "&:hover": { bgcolor: "transparent" } }}>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5, flexWrap: "wrap" }}>
													<Typography variant="h6" component="h2" sx={{ fontWeight: 600, lineHeight: 1.35, overflowWrap: "anywhere" }}>
														{project.title}
													</Typography>
													<Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
														Due {new Date(project.dueDate).toLocaleDateString()}
													</Typography>
												</Box>
												<ProjectDescription description={project.description} />
												{project.tags && project.tags.length > 0 && (
													<Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.75, mt: 1.25 }}>
														{project.tags.map((tag, tagIndex) => (
															<Chip key={tagIndex} label={tag} size="small" variant="outlined" />
														))}
													</Stack>
												)}
											</Box>
										</ListItemButton>
									</Paper>
								))}
							</List>
						)}

						{totalPages > 1 && (
							<Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
								<Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
							</Box>
						)}
					</>
				)}
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
								value={searchFilters.createdAtRangeStart ? new Date(searchFilters.createdAtRangeStart) : null}
								onChange={(newValue) => {
									const newCreatedDateRangeStart = newValue ? newValue.toISOString() : "";
									if (newCreatedDateRangeStart && searchFilters.createdAtRangeStart === "") {
										setDialogFilterCount(dialogFilterCount + 1);
									}
									if (newCreatedDateRangeStart === "") {
										setDialogFilterCount(dialogFilterCount - 1);
									}
									setSearchFilters((prev) => ({
										...prev,
										createdAtRangeStart: newCreatedDateRangeStart,
									}));
								}}
							/>
							<DatePicker
								label="To"
								format="dd/MM/yyyy"
								sx={{ flexGrow: 1 }}
								value={searchFilters.createdAtRangeEnd ? new Date(searchFilters.createdAtRangeEnd) : null}
								onChange={(newValue) => {
									const newCreatedDateRangeEnd = newValue ? newValue.toISOString() : "";
									if (newCreatedDateRangeEnd && searchFilters.createdAtRangeEnd === "") {
										setDialogFilterCount(dialogFilterCount + 1);
									}
									if (newCreatedDateRangeEnd === "") {
										setDialogFilterCount(dialogFilterCount - 1);
									}
									setSearchFilters((prev) => ({
										...prev,
										createdAtRangeEnd: newCreatedDateRangeEnd,
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
					<Button variant="contained" type="submit" form="filters-form" onClick={applySearchFilters}>
						Apply
					</Button>
					<Button variant="outlined" onClick={handleFilterDialogClose}>
						Cancel
					</Button>
					<Button variant="text" color="error" onClick={handleClearFilters}>
						Clear Filters
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
};

export default Projects;
