// src/pages/TaskDetails.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	Container,
	Box,
	Typography,
	CircularProgress,
	Button,
	Chip,
	Stack,
	Alert,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Divider, // Added Divider for visual separation
	Grid, // Added Grid for layout
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { ToastContext } from "../../context/ToastContext";
import { deleteTask, getTaskById } from "../../api/task/tasks";
import CreateAndUpdateTask from "../../components/CreateAndUpdateTask";
import resourceNotFoundLightTheme from "../../assets/resource_not_found_light_theme.png";
import resourceNotFoundDarkTheme from "../../assets/resource_not_foun_dark_theme.png";
import { CustomThemeContext } from "../../context/CustomThemeContext";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";

// Helper function to capitalize and format enums
const formatEnum = (value) => {
	return value ? value.toLowerCase().replace(/_/g, " ") : "";
};

// Helper function to determine Chip color based on Priority/State
const getPriorityColor = (priority) => {
	switch (priority) {
		case "HIGH":
			return "error";
		case "MEDIUM":
			return "warning";
		case "LOW":
			return "success";
		default:
			return "default";
	}
};

// Helper function to format ISO date string to readable local date
const formatDate = (dateString) => {
	if (!dateString) return "N/A";
	try {
		// Use a date object to handle the ISO string and format it
		return new Date(dateString).toLocaleDateString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch (e) {
		return dateString; // Fallback if formatting fails
	}
};

const TaskDetails = () => {
	const { mode } = useContext(CustomThemeContext);
	const { id } = useParams();
	const navigate = useNavigate();
	const { showToast } = useContext(ToastContext);

	const [taskDetailsLoading, setTaskDetailsLoading] = useState(true);
	const [deleteTaskLoading, setDeleteTaskLoading] = useState(false);
	const [task, setTask] = useState(null);
	const [taskUpdatedFlag, setTaskUpdatedFlag] = useState(0);

	const [deleteTaskDialogOpen, setDeleteTaskDialogOpen] = useState(false);
	const [openCreateAndUpdateTaskDialog, setOpenCreateAndUpdateTaskDialog] = useState(false);

	const onTaskUpdateSuccess = () => {
		setTaskUpdatedFlag(taskUpdatedFlag + 1);
		setOpenCreateAndUpdateTaskDialog(false);
	};

	const createAndUpdateTaskProps = {
		open: openCreateAndUpdateTaskDialog,
		onClose: () => setOpenCreateAndUpdateTaskDialog(false),
		onTaskSave: onTaskUpdateSuccess,
		mode: "update",
		task: task, // Now uses the state set by the useEffect
		projectId: task?.projectId || "",
		projectName: task?.projectName || "",
		projectDueDate: task?.projectDueDate || "",
		taskState: task?.state || "",
	};
	// --- API Handlers ---

	const handleDeleteTask = async () => {
		setDeleteTaskLoading(true);
		try {
			const response = await deleteTask(id);
			showToast(response.message || "Task deleted successfully.", "info");
			navigate(-1);
		} catch (error) {
			showToast(error.message || "Error deleting task", "error");
		} finally {
			setDeleteTaskLoading(false);
			setDeleteTaskDialogOpen(false);
		}
	};

	useEffect(() => {
		const fetchTask = async () => {
			setTaskDetailsLoading(true);
			try {
				const response = await getTaskById(id);
				setTask(response.data);
			} catch (error) {
				showToast(error.message || "Error fetching task details", "error");
				setTask(null);
			} finally {
				setTaskDetailsLoading(false);
			}
		};

		if (id) {
			fetchTask();
		}
	}, [id, taskUpdatedFlag]);

	// --- Rendering Logic ---

	if (taskDetailsLoading) {
		// 1. Correct the condition
		return (
			<Container sx={{ maxWidth: { xs: 400, sm: 600 } }}>
				<Box
					sx={{
						display: "flex",
						flexDirection: "row", // Keep for explicit clarity, though default
						alignItems: "center", // Vertically center the items
						justifyContent: "center", // Center the whole box in the container
						gap: 2, // Add some space between spinner and text
						mt: 4,
					}}
				>
					<CircularProgress size={24} />
					<Typography variant="body1" color="text.secondary" display="block">
						Loading task...
					</Typography>
				</Box>
			</Container>
		);
	}

	if (!taskDetailsLoading && !task) {
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
					Task not found
				</Typography>
			</Box>
		);
	}

	// A small helper component for displaying labeled data
	const DetailItem = ({ label, value }) => (
		<Box sx={{ mb: 1.5 }}>
			<Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: "bold" }}>
				{label}
			</Typography>
			<Typography variant="body1" sx={{ maxWidth: "150px" }}>
				{value}
			</Typography>
		</Box>
	);

	return (
		<Container sx={{ maxWidth: { xs: 400, sm: 800 } }}>
			<Box sx={{ my: 2 }}>
				{/* Header and Title */}
				<Typography variant="h5" component="h1" gutterBottom>
					{task.title}
				</Typography>

				{/* Status Chips */}
				<Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mt: 2, mb: 2, gap: 1 }}>
					<Chip label={formatEnum(task.state)} color="primary" variant="filled" sx={{ textTransform: "capitalize", borderRadius: "5px" }} />
					<Chip label={`Priority: ${formatEnum(task.priority)}`} color={getPriorityColor(task.priority)} variant="outlined" sx={{ textTransform: "capitalize", borderRadius: "5px" }} />
					<Chip label={`Type: ${formatEnum(task.type)}`} color="info" variant="outlined" sx={{ textTransform: "capitalize", borderRadius: "5px" }} />
					{task.targetVersion && <Chip label={`Version: ${task.targetVersion}`} color="default" variant="outlined" sx={{ borderRadius: "5px" }} />}
				</Stack>

				<Divider sx={{ my: 1 }} />

				{/* Task Description */}
				<Box sx={{ mb: 2 }}>
					<Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 500 }}>
						Description
					</Typography>
					<ReactMarkdown>{task.description}</ReactMarkdown>
				</Box>

				<Divider sx={{ my: 1 }} />

				<Grid container spacing={4} sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
					{/* Column 1: Core Dates & Assignment */}
					<Grid item size={{ xs: 12, sm: 4 }}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, color: "primary.main" }}>
							<AssignmentOutlinedIcon fontSize="small" />
							<Typography variant="h6" component="h2" sx={{ fontWeight: 400, color: "inherit" }}>
								Audit Trail
							</Typography>
						</Box>
						<DetailItem label="Created By" value={task.createdByName || "N/A"} />
						<DetailItem label="Last Updated By" value={task.updatedByName || "N/A"} />
						<DetailItem label="Created At" value={task.createdAt ? formatDate(task.createdAt) : "N/A"} />
						<DetailItem label="Last Updated At" value={task.updatedAt ? formatDate(task.updatedAt) : "N/A"} />
					</Grid>
					{/* Column 2: Project Context */}
					<Grid item size={{ xs: 12, sm: 4 }}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, color: "primary.main" }}>
							<ArticleOutlinedIcon fontSize="small" />
							<Typography variant="h6" component="h2" sx={{ fontWeight: 400, color: "inherit" }}>
								Project Context
							</Typography>
						</Box>
						<DetailItem label="Project Name" value={task.projectName || "N/A"} />
						<DetailItem label="Project Due Date" value={task.projectDueDate ? formatDate(task.projectDueDate) : "Not Set"} />
					</Grid>

					{/* Column 3: Audit Trail */}

					<Grid item size={{ xs: 12, sm: 4 }}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, color: "primary.main" }}>
							<CalendarTodayOutlinedIcon fontSize="small" />
							<Typography variant="h6" component="h2" sx={{ fontWeight: 400, color: "inherit" }}>
								Dates & Assignment
							</Typography>
						</Box>
						<DetailItem label="Task Due Date" value={task.dueDate ? formatDate(task.dueDate) : "Not Set"} />
						<DetailItem label="Assigned To" value={task.assignedToName || "Unassigned"} />
						<DetailItem label="Restricted Edit" value={task.restrictedEdit ? "Yes" : "No"} />
					</Grid>
				</Grid>

				{/* <Divider sx={{ my: 2 }} /> */}

				{/* Action Buttons */}
				<Box sx={{ display: "flex", gap: 2 }}>
					<Button variant="contained" color="primary" onClick={() => setOpenCreateAndUpdateTaskDialog(true)}>
						Update
					</Button>
					<Button variant="outlined" color="error" onClick={() => setDeleteTaskDialogOpen(true)}>
						Delete
					</Button>
				</Box>

				{/* Delete Confirmation Dialog (unchanged) */}
				<Dialog
					open={deleteTaskDialogOpen}
					onClose={() => setDeleteTaskDialogOpen(false)}
					aria-labelledby="delete-task-dialog-title"
					aria-describedby="delete-task-dialog-description"
					sx={{
						"& .MuiPaper-root": {
							minWidth: "350px",
						},
					}}
				>
					<DialogTitle id="delete-task-dialog-title">{"Delete Task"}</DialogTitle>
					<DialogContent>
						<DialogContentText id="delete-task-dialog-description">Are you sure you want to delete this task?</DialogContentText>
					</DialogContent>

					<DialogActions
						sx={{
							justifyContent: "flex-start",
							padding: "22px",
						}}
					>
						<Button variant="contained" onClick={handleDeleteTask} disabled={deleteTaskLoading}>
							{deleteTaskLoading ? "Deleting task..." : "Yes"}
						</Button>
						<Button variant="outlined" onClick={() => setDeleteTaskDialogOpen(false)} autoFocus>
							Cancel
						</Button>
					</DialogActions>
				</Dialog>
			</Box>
			{openCreateAndUpdateTaskDialog && <CreateAndUpdateTask config={createAndUpdateTaskProps} />}
		</Container>
	);
};

export default TaskDetails;
