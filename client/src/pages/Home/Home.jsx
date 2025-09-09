// src/pages/Home.jsx
import React, { useState, useEffect, useContext } from "react";
import { Container, Box, Typography, Autocomplete, TextField, Grid, Paper, CircularProgress } from "@mui/material";
import { ToastContext } from "../../context/ToastContext";
import { getProjects } from "../../api/project/projects";
import { getTasksByProject } from "../../api/task/tasks";
import "./Home.css";

export default function Home() {
	const { showToast } = useContext(ToastContext);
	const [projects, setProjects] = useState([]);
	const [selectedProject, setSelectedProject] = useState(null);
	const [tasks, setTasks] = useState([]);
	const [tasksLoading, setTasksLoading] = useState(false);

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
		new: [],
		in_progress: [],
		complete: [],
		backlog: [],
	};

	tasks.forEach((task) => {
		if (task.status) {
			groupedTasks[task.status.toLowerCase()]?.push(task);
		}
	});

	return (
		<Container maxWidth="lg">
			<Autocomplete
				options={projects}
				getOptionLabel={(option) => option.title}
				value={selectedProject}
				onChange={(event, newValue) => setSelectedProject(newValue)}
				renderInput={(params) => <TextField {...params} label="Select Project" placeholder="Search project..." />}
				sx={{ maxWidth: "400px", mb: 4 }}
			/>

			{tasksLoading ? (
				<Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
					<CircularProgress />
				</Box>
			) : (
				<Box className="task-container">
					{Object.entries(groupedTasks).map(([status, taskList]) => (
						<Box key={status} className="task-item">
							<Typography variant="h6" sx={{ textTransform: "capitalize", mb: 2 }}>
								{status.replace("_", " ")} [{taskList.length}]
							</Typography>
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
								<Typography variant="body2" color="text.secondary">
									No tasks found.
								</Typography>
							)}
						</Box>
					))}
				</Box>
			)}
		</Container>
	);
}
