// src/pages/Home.jsx
import React, { useState, useEffect, useContext } from "react";
import { Container, Box, Typography, Autocomplete, TextField, Paper, CircularProgress, Button } from "@mui/material";
import { ToastContext } from "../../context/ToastContext";
import { getProjects } from "../../api/project/projects";
import { getTasksByProject } from "../../api/task/tasks";
import "./Home.css";
import AddIcon from "@mui/icons-material/Add";
import scrumBoardImg from "../../assets/scrum_board.png";
import CreateAndUpdateTask from "../../components/CreateAndUpdateTask";

const Home = () => {
	const { showToast } = useContext(ToastContext);
	const [projects, setProjects] = useState([]);
	const [selectedProject, setSelectedProject] = useState(null);
	const [tasks, setTasks] = useState([]);
	const [tasksLoading, setTasksLoading] = useState(false);
	const [openCreateAndUpdateTaskDialog, setOpenCreateAndUpdateTaskDialog] = useState(false);
	const [taskState, setTaskState] = useState(null);

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
						flexDirection: "column", // 👈 stack vertically
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
				<Box className="task-container">
					{Object.entries(groupedTasks).map(([status, taskList]) => (
						<Box key={status} className="task-item">
							{/* Header row with Status and + button */}
							<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
								<Typography variant="h6" sx={{ textTransform: "capitalize" }}>
									{status.replace("_", " ")}
								</Typography>
								<Button variant="outlined" size="small" onClick={() => createTask(status)} startIcon={<AddIcon />}>
									Add
								</Button>
							</Box>

							{/* Task list */}
							{taskList.length > 0 ? (
								<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
									{taskList.map((task) => (
										<Paper key={task.id} sx={{ p: 1.5, mb: 1 }}>
											<Typography variant="body1" sx={{ fontWeight: "bold" }}>
												{task.title}
											</Typography>
											<Typography variant="body2" color="text.secondary">
												{task.description}
											</Typography>
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
