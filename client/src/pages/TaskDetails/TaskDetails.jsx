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
	const { id } = useParams();
	const navigate = useNavigate();
	const { showToast } = useContext(ToastContext);

	const [taskDetailsLoading, setTaskDetailsLoading] = useState(false);
	const [deleteTaskLoading, setDeleteTaskLoading] = useState(false);
	const [task, setTask] = useState(null);

	const [deleteTaskDialogOpen, setDeleteTaskDialogOpen] = useState(false);

	// --- API Handlers ---

	const handleDeleteTask = async () => {
		setDeleteTaskLoading(true);
		try {
			const response = await deleteTask(id);
			showToast(response.message || "Task deleted successfully.", "info");
		} catch (error) {
			showToast(error.message || "Error deleting task", "error");
		} finally {
			setDeleteTaskLoading(false);
			setDeleteTaskDialogOpen(false);
			navigate(-1);
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
	}, [id]);

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

	if (!task) {
		return (
			<Container sx={{ maxWidth: { xs: 400, sm: 600 } }}>
				<Box sx={{ my: 4 }}>
					<Alert severity="error">Task not found or failed to load.</Alert>
				</Box>
			</Container>
		);
	}

	// A small helper component for displaying labeled data
	const DetailItem = ({ label, value }) => (
		<Box sx={{ mb: 1.5 }}>
			<Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: "bold" }}>
				{label}
			</Typography>
			<Typography variant="body1">{value}</Typography>
		</Box>
	);

	return (
		<Container sx={{ maxWidth: { xs: 400, sm: 600 } }}>
			<Box sx={{ my: 4 }}>
				{/* Header and Title */}
				<Typography variant="h4" component="h1" gutterBottom>
					{task.title}
				</Typography>

				{/* Status Chips */}
				<Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 3, gap: 1 }}>
					<Chip label={formatEnum(task.state)} color="primary" variant="filled" sx={{ textTransform: "capitalize" }} />
					<Chip label={`Priority: ${formatEnum(task.priority)}`} color={getPriorityColor(task.priority)} variant="outlined" sx={{ textTransform: "capitalize" }} />
					<Chip label={`Type: ${formatEnum(task.type)}`} color="info" variant="outlined" sx={{ textTransform: "capitalize" }} />
					{task.targetVersion && <Chip label={`Version: ${task.targetVersion}`} color="default" variant="outlined" />}
				</Stack>

				<Divider sx={{ my: 3 }} />

				{/* Task Description */}
				<Box sx={{ mb: 4 }}>
					<Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 500 }}>
						Description
					</Typography>
					<ReactMarkdown>{task.description}</ReactMarkdown>
				</Box>

				<Divider sx={{ my: 3 }} />

				{/* Metadata Grid */}
				<Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 500 }}>
					Details
				</Typography>

				<Grid container spacing={6}>
					{/* Column 1: Core Dates & Assignment */}
					<Grid item xs={12} sm={6} md={4}>
						<Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: "primary.main" }}>
							Dates & Assignment
						</Typography>
						<DetailItem label="Task Due Date" value={task.dueDate ? formatDate(task.dueDate) : "Not Set"} />
						<DetailItem label="Assigned To" value={task.assignedToName || "Unassigned"} />
						<DetailItem label="Restricted Edit" value={task.restrictedEdit ? "Yes" : "No"} />
					</Grid>

					{/* Column 2: Project Context */}
					<Grid item xs={12} sm={6} md={4}>
						<Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: "primary.main" }}>
							Project Context
						</Typography>
						<DetailItem label="Project Name" value={task.projectName || "N/A"} />
						<DetailItem label="Project Due Date" value={task.projectDueDate ? formatDate(task.projectDueDate) : "Not Set"} />
					</Grid>

					{/* Column 3: Audit Trail */}
					<Grid item xs={12} sm={12} md={4}>
						<Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: "primary.main" }}>
							Audit Trail
						</Typography>
						<DetailItem label="Created By" value={task.createdByName || "N/A"} />
						<DetailItem label="Last Updated By" value={task.updatedByName || "N/A"} />
						<DetailItem label="Created At" value={task.createdAt ? formatDate(task.createdAt) : "N/A"} />
						<DetailItem label="Last Updated At" value={task.updatedAt ? formatDate(task.updatedAt) : "N/A"} />
					</Grid>
				</Grid>

				<Divider sx={{ my: 4 }} />

				{/* Action Buttons */}
				<Box sx={{ display: "flex", gap: 2 }}>
					<Button variant="contained" color="primary" onClick={() => navigate(`/tasks/edit/${task.id}`)}>
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
						<DialogContentText id="delete-task-dialog-description">Are you sure you want to delete the task: {task.title}?</DialogContentText>
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
		</Container>
	);
};

export default TaskDetails;
