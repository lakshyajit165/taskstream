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
	CircularProgress,
	Tooltip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import ReactMarkdown from "react-markdown";
import { validateTaskPayload } from "../api/utils/formValidation";
validateTaskPayload;

const mockUsers = [
	{ id: 1, name: "Alice" },
	{ id: 2, name: "Bob" },
	{ id: 3, name: "Charlie" },
];
const CreateAndUpdateTask2 = ({ open, onClose, project, taskState }) => {
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
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);

	// Markdown editor tab (write/preview)
	const [tab, setTab] = useState("write");

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		const newValues = { ...taskPayload, [name]: value };
		setTaskPayload(newValues);
		validateTaskPayload({ [name]: value }); // validate live per field
	};

	const handleRestrictedEditChange = (e) => {
		const { name, checked } = e.target;
		setTaskPayload((prev) => ({ ...prev, [name]: checked }));
	};

	const createTask = (e) => {
		e.preventDefault();
		const validationErrors = validateTaskPayload(taskPayload);
		if (validationErrors) {
			setErrors(validationErrors);
		}
		console.log("Form Submitted:", taskPayload);
		// onClose();
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
					<Button
						autoFocus
						color="inherit"
						onClick={createTask}
						disabled={loading} // <--- DISABLE WHILE LOADING
					>
						{loading ? ( // <--- CONDITIONAL CONTENT
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
								Saving...
							</Box>
						) : (
							"Save"
						)}
					</Button>
				</Toolbar>
			</AppBar>
			<Container sx={{ maxWidth: { xs: 400, sm: 600 }, py: 4 }}>
				<form onSubmit={createTask}>
					{/* Title */}
					<TextField fullWidth label="Title" name="title" value={taskPayload.title} onChange={handleInputChange} error={!!errors.title} margin="normal" />
					<Collapse in={!!errors.title}>
						<FormHelperText error>{errors.title}</FormHelperText>
					</Collapse>

					{/* Project (read-only) */}
					<TextField fullWidth label="Project" value={project?.title || ""} readOnly margin="normal" />

					{/* Markdown-enabled Description */}
					<Box sx={{ marginBottom: "2px" }}>
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
									onChange={handleInputChange}
									error={!!errors.description}
								/>
								<Collapse in={!!errors.description}>
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
					{/* Due Date */}
					<DatePicker
						label="Due Date"
						format="dd/MM/yyyy"
						minDate={new Date()}
						maxDate={new Date(project.dueDate)}
						value={taskPayload.dueDate ? new Date(taskPayload.dueDate) : null}
						onChange={(newValue) => {
							setTaskPayload((prev) => ({
								...prev,
								dueDate: newValue ? newValue.toISOString() : "",
							}));
							validateTaskPayload({ dueDate: newValue ? newValue.toISOString() : "" });
						}}
						slotProps={{
							textField: {
								fullWidth: true,
								margin: "normal",
								error: !!errors.dueDate,
							},
						}}
					/>
					<Collapse in={!!errors.dueDate}>
						<FormHelperText error>{errors.dueDate}</FormHelperText>
					</Collapse>

					{/* State (read-only) */}
					<TextField fullWidth label="State" value={taskState || ""} readOnly margin="normal" />

					{/* Priority */}

					<FormControl fullWidth error={!!errors.priority} margin="normal">
						<InputLabel>Priority</InputLabel>
						<Select name="priority" value={taskPayload.priority} onChange={handleInputChange} label="Priority">
							<MenuItem value="LOW">Low</MenuItem>
							<MenuItem value="MEDIUM">Medium</MenuItem>
							<MenuItem value="HIGH">High</MenuItem>
						</Select>
					</FormControl>
					<Collapse in={!!errors.priority}>
						<FormHelperText error>{errors.priority}</FormHelperText>
					</Collapse>

					{/* Type */}

					<FormControl fullWidth error={!!errors.type} margin="normal">
						<InputLabel>Type</InputLabel>
						<Select name="type" value={taskPayload.type} onChange={handleInputChange} label="Type">
							<MenuItem value="FEATURE">Feature</MenuItem>
							<MenuItem value="DEFECT">Defect</MenuItem>
							<MenuItem value="CUSTOMIZATION">Customization</MenuItem>
							<MenuItem value="BACKPORT">BackPort</MenuItem>
							<MenuItem value="FORWARDPORT">ForwardPort</MenuItem>
						</Select>
					</FormControl>

					<Collapse in={!!errors.type}>
						<FormHelperText error>{errors.type}</FormHelperText>
					</Collapse>

					{/* Assigned To */}
					<Autocomplete
						fullWidth
						options={mockUsers}
						getOptionLabel={(option) => option?.name || ""}
						value={taskPayload.assignedTo}
						onChange={(e, newValue) => setTaskPayload((prev) => ({ ...prev, assignedTo: newValue }))}
						sx={{ mt: 2, mb: 1 }} // <-- ADD CUSTOM MARGIN FOR SPACING CONSISTENCY
						renderInput={(params) => <TextField {...params} label="Assigned To" error={!!errors.assignedTo} />}
					/>
					<Collapse in={!!errors.assignedTo}>
						<FormHelperText error>{errors.assignedTo}</FormHelperText>
					</Collapse>

					{/* Target Version */}
					<TextField
						fullWidth
						label="Target Version"
						name="targetVersion"
						value={taskPayload.targetVersion}
						onChange={handleInputChange}
						error={!!errors.targetVersion}
						sx={{ mt: 2, mb: 1 }} // <-- ADD CUSTOM MARGIN FOR SPACING CONSISTENCY
					/>
					<Collapse in={!!errors.targetVersion}>
						<FormHelperText error>{errors.targetVersion}</FormHelperText>
					</Collapse>
					{/* Restricted Edit */}
					<Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
						<FormControlLabel control={<Checkbox checked={taskPayload.restrictedEdit} onChange={handleRestrictedEditChange} name="restrictedEdit" />} label="Restricted Edit" />
						<Tooltip title={<Typography sx={{ fontSize: "14px" }}>If checked, only task owners can modify this task.</Typography>} arrow>
							<InfoIcon color="action" sx={{ fontSize: 25 }} />
						</Tooltip>
					</Box>
				</form>
			</Container>
		</Dialog>
	);
};

export default CreateAndUpdateTask2;
