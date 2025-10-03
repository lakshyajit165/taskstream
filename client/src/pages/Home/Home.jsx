// src/pages/Home.jsx
import React, { useState, useEffect, useContext } from "react";
import { Container, Box, Typography, Autocomplete, TextField, Paper, CircularProgress, Button, IconButton } from "@mui/material";
import { ToastContext } from "../../context/ToastContext";
import { getProjects } from "../../api/project/projects";
import { getTasksByProject } from "../../api/task/tasks";
import "./Home.css";
import AddIcon from "@mui/icons-material/Add";
import scrumBoardImg from "../../assets/scrum_board.png";
import CreateAndUpdateTask from "../../components/CreateAndUpdateTask";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
import { getTaskBackgroundColor } from "../../api/utils/cssUtils";
import { useNavigate } from "react-router-dom";

const Home = () => {
	const { showToast } = useContext(ToastContext);
	const [projects, setProjects] = useState([]);
	const [selectedProject, setSelectedProject] = useState(null);
	const [tasks, setTasks] = useState([]);
	const [tasksLoading, setTasksLoading] = useState(false);
	const [openCreateAndUpdateTaskDialog, setOpenCreateAndUpdateTaskDialog] = useState(false);
	const [taskState, setTaskState] = useState(null);
	const navigate = useNavigate();

	// Fetch projects
	useEffect(() => {
		const fetchProjects = async () => {
			try {
				const response = await getProjects(1, 10);
				setProjects(response.data.projects || []);
			} catch (error) {
				showToast(error.message || "Failed to load projects", "error");
			}
		};
		fetchProjects();
	}, []);

	// Fetch tasks for selected project
	useEffect(() => {
		if (selectedProject) {
			setTasksLoading(true);
			const fetchTasks = async () => {
				try {
					const response = await getTasksByProject(selectedProject.id, 1, 10);
					setTasks(response.data.tasks || []);
				} catch (error) {
					showToast(error.message || "Failed to load tasks", "error");
				} finally {
					setTasksLoading(false);
				}
			};
			fetchTasks();
		}
	}, [selectedProject]);

	// Group tasks by status
	const groupedTasks = {
		NEW: [],
		IN_PROGRESS: [],
		COMPLETE: [],
		BACKLOG: [],
	};

	tasks.forEach((task) => {
		if (task.state) {
			groupedTasks[task.state]?.push(task);
		}
	});

	const createTask = (status) => {
		setTaskState(status);
		setOpenCreateAndUpdateTaskDialog(true);
	};

	const viewTask = (taskId) => {
		navigate(`/tasks/${taskId}`);
	};

	return (
		<Container maxWidth="xl">
			{/* Project Selector */}
			<Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
				<Autocomplete
					options={projects}
					getOptionLabel={(option) => option.title}
					value={selectedProject}
					onChange={(event, newValue) => setSelectedProject(newValue)}
					renderInput={(params) => <TextField {...params} label="Select Project" placeholder="Search project..." />}
					sx={{ width: "100%", maxWidth: "400px" }} // responsive + centered
				/>
			</Box>

			{/* Show image if no project selected */}
			{!selectedProject ? (
				<Box
					sx={{
						display: "flex",
						flexDirection: "column", // stack vertically
						justifyContent: "center",
						alignItems: "center",
						px: 2, // padding for small screens
						textAlign: "center", // center text under image
					}}
				>
					<img
						src={scrumBoardImg}
						alt="Scrum Board"
						style={{
							width: "100%", // responsive full width inside container
							maxWidth: "500px", // don’t stretch too much
							height: "auto", // keep aspect ratio
							borderRadius: "8px",
						}}
					/>
					<Typography variant="body1" color="text.secondary">
						No project selected. Please select a project to view the tasks.
					</Typography>
				</Box>
			) : tasksLoading ? (
				<Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
					<CircularProgress />
				</Box>
			) : (
				<Box className="task-container-wrapper">
					{Object.entries(groupedTasks).map(([status, taskList]) => (
						<Box key={status} className="task-container">
							{/* Header row with Status and + button */}
							<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
								<Typography variant="h6" sx={{ textTransform: "capitalize" }}>
									{status.toLowerCase().replace("_", " ")}
								</Typography>
								<Button variant="outlined" size="small" onClick={() => createTask(status)} startIcon={<AddIcon />}>
									Add
								</Button>
							</Box>

							{/* Task list */}
							{taskList.length > 0 ? (
								<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
									{taskList.map((task) => (
										<Paper
											key={task.id}
											className="task-item"
											elevation={0}
											sx={{
												display: "flex", // Enable flex
												justifyContent: "space-between", // Push title to left and icons to right
												alignItems: "center", // Vertically align title and icons
												p: 1.5, // Added padding for better aesthetics
												bgcolor: (theme) => getTaskBackgroundColor(task.state),
											}}
										>
											<Typography
												variant="body1"
												sx={{ fontWeight: "bold", flexGrow: 1, minWidth: 0, mr: 1, maxWidth: "16ch", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}
											>
												{task.title}
											</Typography>
											<Box sx={{ display: "flex", gap: 0.5 }}>
												<IconButton size="small" aria-label="move left">
													<KeyboardArrowLeftIcon fontSize="small" />
												</IconButton>
												<IconButton size="small" aria-label="move right">
													<KeyboardArrowRightIcon fontSize="small" />
												</IconButton>
												<IconButton size="small" aria-label="more options" onClick={() => viewTask(task.id)}>
													<InfoOutlineIcon fontSize="small" />
												</IconButton>
											</Box>
										</Paper>
									))}
								</Box>
							) : (
								<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
									No tasks found.
								</Typography>
							)}
						</Box>
					))}
				</Box>
			)}
			{openCreateAndUpdateTaskDialog && (
				<CreateAndUpdateTask open={openCreateAndUpdateTaskDialog} onClose={() => setOpenCreateAndUpdateTaskDialog(false)} project={selectedProject} taskState={taskState} />
			)}
		</Container>
	);
};

export default Home;
