import React, { useState, useEffect, useRef, useMemo, useContext } from "react";
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
import { createTask } from "../api/task/tasks";
import { ToastContext } from "../context/ToastContext";
import { searchUsers } from "../api/user/users";

const CreateAndUpdateTask = ({ open, onClose, project, taskState }) => {
	const { showToast } = useContext(ToastContext);
	const [taskPayload, setTaskPayload] = useState({
		title: "",
		description: "",
		dueDate: "",
		state: taskState || "",
		priority: "",
		type: "",
		projectId: project?.id || null,
		assignedTo: null,
		targetVersion: "",
		restrictedEdit: false,
	});
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);

	// Markdown editor tab (write/preview)
	const [tab, setTab] = useState("write");

	const [userOptions, setUserOptions] = useState([]); // Start with mocks
	const [usersLoading, setUsersLoading] = useState(false);

	const searchTimeoutRef = useRef(null);

	// Cleanup the timeout on component unmount
	useEffect(() => {
		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
		};
	}, []);

	// --- Debounced User Search Function ---
	const searchUsersByName = useMemo(
		() => (query) => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}

			if (!query) {
				setUserOptions([]); // Clear options if query is empty
				setUsersLoading(false);
				return;
			}

			setUsersLoading(true);
			searchTimeoutRef.current = setTimeout(async () => {
				try {
					// Call the API
					const users = await searchUsers(query);
					setUserOptions(users?.data?.userSuggestions || []);
				} catch (error) {
					console.error("Failed to fetch users:", error);
					showToast("Failed to load user options.", "error");
					setUserOptions([]);
				} finally {
					setUsersLoading(false);
				}
			}, 500); // 500ms debounce
		},
		[showToast]
	);

	const handleInputChange = (e) => {
		const { name, value } = e.target;

		// 1. Update the main payload state
		setTaskPayload((prevPayload) => ({ ...prevPayload, [name]: value }));

		// 2. Validate just the changed field
		let fieldErrors = validateTaskPayload({ [name]: value });

		// 3. Update the errors state:
		//    - If there's an error for the current field, use it.
		//    - If there's NO error, remove it from the errors state.
		setErrors((prevErrors) => {
			const newErrors = { ...prevErrors };

			if (fieldErrors[name]) {
				newErrors[name] = fieldErrors[name];
			} else {
				delete newErrors[name]; // Remove error if field is now valid
			}

			// Add this line to prevent returning the fieldErrors object.
			// The return value of setErrors determines the new state.
			return newErrors;
		});
	};

	const handleRestrictedEditChange = (e) => {
		const { name, checked } = e.target;
		setTaskPayload((prev) => ({ ...prev, [name]: checked }));
	};

	const submitTask = async (e) => {
		try {
			setLoading(true);
			console.log(taskPayload);
			e.preventDefault();
			const validationErrors = validateTaskPayload(taskPayload);
			if (Object.keys(validationErrors).length === 0) {
				console.log(taskPayload);
				const createTaskResponse = await createTask(taskPayload);
				console.log(createTaskResponse);
			} else {
				setErrors(validationErrors);
			}
		} catch (error) {
			showToast(error.message || "Error logging in user", "error");
		} finally {
			setLoading(false);
		}

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
						onClick={submitTask}
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
				<form onSubmit={submitTask}>
					{/* Project (read-only) */}
					<TextField fullWidth label="Project" value={project?.title || ""} readOnly margin="normal" />
					{/* Title */}
					<TextField fullWidth label="Task title" name="title" value={taskPayload.title} onChange={handleInputChange} error={!!errors.title} margin="normal" />
					<Collapse in={!!errors.title}>
						<FormHelperText error>{errors.title}</FormHelperText>
					</Collapse>
					{/* Markdown-enabled Description */}
					<Box sx={{ marginBottom: "2px" }}>
						<Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ mb: 1 }}>
							<Tab value="write" label="Write" />
							<Tab value="preview" label="Preview" />
						</Tabs>
						{tab === "write" ? (
							<>
								<TextField
									label="Task description"
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
					{/* Due date */}
					<DatePicker
						label="Due Date"
						format="dd/MM/yyyy"
						minDate={new Date()}
						maxDate={new Date(project.dueDate)}
						value={taskPayload.dueDate ? new Date(taskPayload.dueDate) : null}
						onChange={(newValue) => {
							const newDueDate = newValue ? newValue.toISOString() : "";

							// 1. Update payload
							setTaskPayload((prev) => ({
								...prev,
								dueDate: newDueDate,
							}));

							// 2. Validate just the dueDate field
							const fieldErrors = validateTaskPayload({ dueDate: newDueDate });

							// 3. Merge/clear errors
							setErrors((prevErrors) => {
								const newErrors = { ...prevErrors };
								if (fieldErrors.dueDate) {
									newErrors.dueDate = fieldErrors.dueDate;
								} else {
									delete newErrors.dueDate; // Remove error if valid
								}
								return newErrors;
							});
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
					{/* Assigned to */}
					<Autocomplete
						fullWidth
						// 1. Use dynamic options
						options={userOptions}
						getOptionLabel={(option) => option?.name || ""}
						value={taskPayload.assignedTo}
						onChange={(e, newValue) => {
							// ... (keep your existing state update and validation logic)
							// 1. Update payload
							setTaskPayload((prev) => ({ ...prev, assignedTo: newValue }));

							// 2. Validate just the assignedTo field
							const fieldErrors = validateTaskPayload({ assignedTo: newValue });

							// 3. Merge/clear errors
							setErrors((prevErrors) => {
								const newErrors = { ...prevErrors };
								if (fieldErrors.assignedTo) {
									newErrors.assignedTo = fieldErrors.assignedTo;
								} else {
									delete newErrors.assignedTo; // Remove error if valid
								}
								return newErrors;
							});
						}}
						// 2. Trigger search on input change
						// The second argument is the reason, we only want to search when "input" is changing
						onInputChange={(e, newInputValue, reason) => {
							if (reason === "input") {
								searchUsersByName(newInputValue);
							}
						}}
						sx={{ mt: 2, mb: 1 }}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Assigned To"
								error={!!errors.assignedTo}
								// Replace InputProps with slotProps targeting the 'input' component
								slotProps={{
									input: {
										// **CRITICAL**: Spread params.InputProps to keep Autocomplete's icons
										...params.InputProps,
										endAdornment: (
											<>
												{usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
												{params.InputProps.endAdornment}
											</>
										),
									},
								}}
							/>
						)}
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

export default CreateAndUpdateTask;
