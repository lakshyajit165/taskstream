// src/pages/Home.jsx
import React, { useState, useEffect, useContext } from "react";
import { Container, Box, Typography, Autocomplete, TextField, Grid, Paper } from "@mui/material";
import { ToastContext } from "../context/ToastContext";
import { getProjects } from "../api/project/projects";
import { getTasksByProject } from "../api/task/tasks"; // You'll create this API wrapper

export default function Home() {
	const { showToast } = useContext(ToastContext);
	const [projects, setProjects] = useState([]);
	const [selectedProject, setSelectedProject] = useState(null);
	const [tasks, setTasks] = useState([]);

	// Fetch projects for dropdown
	useEffect(() => {
		const fetchProjects = async () => {
			try {
				const response = await getProjects(1, 10); // fetch many so dropdown has options
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
			const fetchTasks = async () => {
				try {
					const response = await getTasksByProject(selectedProject.id, 1, 10);
					setTasks(response.data.tasks || []);
				} catch (error) {
					showToast(error.message || "Failed to load tasks", "error");
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
		<Container maxWidth="lg" sx={{ py: 4 }}>
			{/* Project Selector */}
			<Box sx={{ mb: 4 }}>
				<Autocomplete
					options={projects}
					getOptionLabel={(option) => option.title}
					value={selectedProject}
					onChange={(event, newValue) => setSelectedProject(newValue)}
					renderInput={(params) => <TextField {...params} label="Select Project" placeholder="Search project..." />}
				/>
			</Box>

			{/* Kanban Board */}
			{selectedProject ? (
				<Grid container spacing={2}>
					{["New", "In Progress", "Complete", "Backlog"].map((statusKey) => (
						<Grid item xs={12} sm={6} md={3} key={statusKey}>
							<Paper sx={{ p: 2, minHeight: "70vh", display: "flex", flexDirection: "column" }} elevation={3}>
								<Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
									{statusKey}
								</Typography>
								<Box sx={{ flexGrow: 1 }}>
									{groupedTasks[statusKey.toLowerCase().replace(" ", "_")]?.map((task) => (
										<Paper
											key={task.id}
											sx={{
												p: 1,
												mb: 1.5,
												bgcolor: "grey.100",
											}}
											elevation={1}
										>
											<Typography variant="body1" fontWeight="bold">
												{task.title}
											</Typography>
											<Typography variant="body2" color="text.secondary" noWrap>
												{task.description}
											</Typography>
										</Paper>
									))}
								</Box>
							</Paper>
						</Grid>
					))}
				</Grid>
			) : (
				<Typography variant="body1" color="text.secondary" align="center">
					Please select a project to view tasks.
				</Typography>
			)}
		</Container>
	);
}
