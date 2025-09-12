// src/components/CreateAndUpdateTask.jsx
import React, { useState, useEffect } from "react";
import {
	Dialog,
	AppBar,
	Toolbar,
	IconButton,
	Typography,
	Button,
	Container,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Checkbox,
	FormControlLabel,
	Box,
	Tabs,
	Tab,
	Autocomplete,
	FormHelperText,
	Collapse,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CloseIcon from "@mui/icons-material/Close";
import ReactMarkdown from "react-markdown";

const mockUsers = [
	{ id: 1, name: "Alice" },
	{ id: 2, name: "Bob" },
	{ id: 3, name: "Charlie" },
];

const CreateAndUpdateTask = ({ open, onClose, project, taskState }) => {
	// Log project + taskState when component mounts
	useEffect(() => {
		console.log("CreateAndUpdateTask opened with:");
		console.log("Project:", project);
		console.log("Task State:", taskState);
	}, [project, taskState]);

	// Form state
	const [taskPayload, setTaskPayload] = useState({
		title: "",
		description: "",
		dueDate: "",
		state: taskState || "",
		priority: "",
		type: "",
		project: project?.id || null,
		assignedTo: null,
		targetVersion: "",
		restrictedEdit: false,
	});

	// form errors
	const [errors, setErrors] = useState({});

	// Markdown editor tab (write/preview)
	const [tab, setTab] = useState("write");

	// Handlers
	const handleChange = (e) => {
		const { name, value } = e.target;
		validateTaskPayload({ [name]: value });
		setTaskPayload((prev) => ({ ...prev, [name]: value }));
	};

	const handleCheckboxChange = (e) => {
		const { name, checked } = e.target;
		setTaskPayload((prev) => ({ ...prev, [name]: checked }));
	};

	const createTask = (e) => {
		e.preventDefault();
		const validationErrors = validateTaskPayload(taskPayload);
		console.log("Form Submitted:", taskPayload);
		// onClose();
	};

	const validateTaskPayload = (fieldValues = taskPayload) => {
		let validationErrors = { ...errors };
		if ("title" in fieldValues) {
			if (!fieldValues.title) {
				validationErrors.title = "Title is required";
			} else {
				delete validationErrors.title;
			}
		}
		if ("description" in fieldValues) {
			if (!fieldValues.description) {
				validationErrors.description = "Description is required";
			} else {
				delete validationErrors.description;
			}
		}
		if ("dueDate" in fieldValues) {
			if (!fieldValues.dueDate) {
				validationErrors.dueDate = "Due date is required";
			} else {
				delete validationErrors.dueDate;
			}
		}
		if ("priority" in fieldValues) {
			if (!fieldValues.priority) {
				validationErrors.priority = "Priority is required";
			} else {
				validationErrors.priority;
			}
		}
		if ("type" in fieldValues) {
			if (!fieldValues.type) {
				validationErrors.type = "Type is required";
			} else {
				delete validationErrors.type;
			}
		}
		if ("assignedTo" in fieldValues) {
			if (!fieldValues.assignedTo) {
				validationErrors.assignedTo = "Assigned to is required";
			} else {
				delete validationErrors.assignedTo;
			}
		}
		if ("targetVersion" in fieldValues) {
			if (!fieldValues.targetVersion) {
				validationErrors.targetVersion = "Target version is required";
			} else {
				delete validationErrors.targetVersion;
			}
		}
		setErrors(validationErrors);
		return validationErrors;
	};

	return (
		<Dialog fullScreen open={open} onClose={onClose}>
			<AppBar sx={{ position: "relative" }}>
				<Toolbar>
					<IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
						<CloseIcon />
					</IconButton>
					<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
						Create Task
					</Typography>
					<Button autoFocus color="inherit" onClick={createTask}>
						Save
					</Button>
				</Toolbar>
			</AppBar>

			<Container sx={{ maxWidth: { xs: 400, sm: 600 }, py: 4 }}>
				<form onSubmit={createTask}>
					<Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
						<TextField label="Title" name="title" margin="normal" value={taskPayload.title} onChange={handleChange} error={!!errors.title} />
						<Collapse in={!!errors.title} timeout={300}>
							<FormHelperText error>{errors.title}</FormHelperText>
						</Collapse>
						{/* Project (read-only) */}
						<TextField label="Project" value={project?.title || ""} readOnly />
						{/* Markdown-enabled Description */}
						<Box>
							<Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ mb: 1 }}>
								<Tab value="write" label="Write" />
								<Tab value="preview" label="Preview" />
							</Tabs>
							{tab === "write" ? (
								<>
									<TextField
										label="Description"
										name="description"
										multiline
										rows={4}
										fullWidth
										value={taskPayload.description}
										onChange={handleChange}
										error={!!errors.description}
									/>
									<Collapse in={!!errors.description} timeout={300}>
										<FormHelperText error>{errors.description}</FormHelperText>
									</Collapse>
								</>
							) : (
								<Box
									sx={{
										border: "1px solid #ccc",
										borderRadius: 1,
										p: 2,
										minHeight: "100px",
										backgroundColor: "#fafafa",
									}}
								>
									<ReactMarkdown>{taskPayload.description || "Nothing to preview"}</ReactMarkdown>
								</Box>
							)}
						</Box>

						{/* Date only */}
						<DatePicker
							label="Due Date"
							format="dd/MM/yyyy"
							minDate={new Date()}
							maxDate={new Date(project.dueDate)}
							value={taskPayload.dueDate ? new Date(taskPayload.dueDate) : null}
							onChange={handleChange}
							renderInput={(params) => (
								<TextField
									{...params}
									fullWidth // ✅ Full width applied here
									sx={{ mb: 3 }}
								/>
							)}
							sx={{ width: "100%" }} // optional: ensure container width
							error={!!errors.dueDate}
						/>
						<Collapse in={!!errors.dueDate} timeout={300}>
							<FormHelperText error>{errors.dueDate}</FormHelperText>
						</Collapse>
						{/* State (read-only) */}
						<TextField label="State" value={taskState || ""} readOnly />

						{/* Priority */}
						<FormControl fullWidth error={!!errors.priority}>
							<InputLabel>Priority</InputLabel>
							<Select name="priority" value={taskPayload.priority} onChange={handleChange} label="Priority">
								<MenuItem value="LOW">Low</MenuItem>
								<MenuItem value="MEDIUM">Medium</MenuItem>
								<MenuItem value="HIGH">High</MenuItem>
							</Select>
						</FormControl>
						<Collapse in={!!errors.priority} timeout={300}>
							<FormHelperText error>{errors.priority}</FormHelperText>
						</Collapse>

						{/* Type */}
						<FormControl fullWidth error={!!errors.type}>
							<InputLabel>Type</InputLabel>
							<Select name="type" value={taskPayload.type} onChange={handleChange} label="Type">
								<MenuItem value="FEATURE">Feature</MenuItem>
								<MenuItem value="DEFECT">Defect</MenuItem>
								<MenuItem value="CUSTOMIZATION">Customization</MenuItem>
								<MenuItem value="BACKPORT">BackPort</MenuItem>
								<MenuItem value="FORWARDPORT">ForwardPort</MenuItem>
							</Select>
						</FormControl>
						<Collapse in={!!errors.type} timeout={300}>
							<FormHelperText error>{errors.type}</FormHelperText>
						</Collapse>

						{/* Assigned To (Autocomplete) */}
						<Autocomplete
							options={mockUsers}
							getOptionLabel={(option) => option?.name || ""} // safe access
							value={taskPayload.assignedTo}
							onChange={(e, newValue) => setTaskPayload((prev) => ({ ...prev, assignedTo: newValue }))}
							renderInput={(params) => <TextField {...params} label="Assigned To" error={!!errors.assignedTo} />}
						/>
						<Collapse in={!!errors.assignedTo} timeout={300}>
							<FormHelperText error>{errors.assignedTo}</FormHelperText>
						</Collapse>

						<TextField label="Target Version" name="targetVersion" value={taskPayload.targetVersion} onChange={handleChange} error={!!errors.targetVersion} />
						<Collapse in={!!errors.targetVersion} timeout={300}>
							<FormHelperText error>{errors.targetVersion}</FormHelperText>
						</Collapse>
						<FormControlLabel control={<Checkbox checked={taskPayload.restrictedEdit} onChange={handleCheckboxChange} name="restrictedEdit" />} label="Restricted Edit" />
					</Box>
				</form>
			</Container>
		</Dialog>
	);
};

export default CreateAndUpdateTask;
