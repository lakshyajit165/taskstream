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
import { createTask, updateTask } from "../api/task/tasks";
import { ToastContext } from "../context/ToastContext";
import { searchUsers } from "../api/user/users";
import CodeIcon from "@mui/icons-material/Code";

const CreateAndUpdateTask = (props) => {
	const { open, onClose, projectId, projectName, projectDueDate, taskState, onTaskSave, task, mode } = props.config;
	const { showToast } = useContext(ToastContext);
	const taskId = task ? task.id : null;
	const setTaskAssignedTo = (() => {
		if (mode === "update" && task && task.assignedToId && task.assignedToName) {
			// ✅ Initialize with a full object structure
			return {
				id: task.assignedToId, // Assuming you have the ID in the task object
				name: task.assignedToName,
			};
		}
		return null; // Autocomplete prefers null or an object for its value
	})();
	const appBarTitle = mode === "create" ? "Create Task" : "Update Task";
	const [taskPayload, setTaskPayload] = useState({
		title: mode === "update" && task ? task.title : "",
		description: mode === "update" && task ? task.description : "",
		dueDate: mode === "update" && task ? task.dueDate : "",
		state: taskState || "",
		priority: mode === "update" && task ? task.priority : "",
		type: mode === "update" && task ? task.type : "",
		projectId: projectId || null,
		assignedTo: setTaskAssignedTo,
		targetVersion: mode === "update" && task ? task.targetVersion : "",
		restrictedEdit: mode === "update" && task ? task.restrictedEdit : false,
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
					showToast(error.message || "Failed to load user options.", "error");
					setUserOptions([]);
				} finally {
					setUsersLoading(false);
				}
			}, 500); // 500ms debounce
		},
		[showToast],
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
			e.preventDefault();

			// Create the API payload from the current state
			const apiPayload = { ...taskPayload };

			// If assignedTo is an object (which it is from Autocomplete),
			// extract only the 'id' for the API call.
			if (apiPayload.assignedTo && typeof apiPayload.assignedTo === "object") {
				apiPayload.assignedTo = apiPayload.assignedTo.id;
			}
			const validationErrors = validateTaskPayload(apiPayload);
			if (Object.keys(validationErrors).length === 0) {
				let saveTaskResponse;
				if (mode === "create") {
					saveTaskResponse = await createTask(apiPayload);
				} else if (mode === "update") {
					saveTaskResponse = await updateTask(taskId, apiPayload);
				} else {
					throw new Error("Could not save task");
				}
				showToast(saveTaskResponse.message, "success");
				onTaskSave();
				// close the modal here
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
		<Dialog
			fullScreen
			open={open}
			onClose={onClose}
			slotProps={{
				paper: {
					sx: {
						display: "flex",
						flexDirection: "column",
						minHeight: 0,
						overflow: "hidden",
					},
				},
			}}
		>
			<AppBar elevation={0} sx={{ position: "relative", flexShrink: 0, borderBottom: 1, borderColor: "divider" }}>
				<Toolbar sx={{ minHeight: { xs: 60, sm: 68 }, px: { xs: 1.5, sm: 3 } }}>
					<IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
						<CloseIcon />
					</IconButton>
					<Box sx={{ ml: 1.5, flex: 1, minWidth: 0 }}>
						<Typography variant="h6" component="div" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{appBarTitle}</Typography>
						<Typography variant="caption" sx={{ opacity: 0.78, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{projectName || "Project task"}</Typography>
					</Box>
					<Button
						autoFocus
						color="inherit"
						onClick={submitTask}
						disabled={loading} // <--- DISABLE WHILE LOADING
						sx={{ minWidth: 64, fontWeight: 600 }}
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
			<Box
				sx={{
					flex: "1 1 0%",
					minHeight: 0,
					overflowY: "auto",
					overflowX: "hidden",
					overscrollBehaviorY: "contain",
					WebkitOverflowScrolling: "touch",
					bgcolor: "background.default",
				}}
			>
			<Container maxWidth={false} sx={{ width: "100%", maxWidth: { xs: "100%", sm: "800px" }, pt: { xs: 3, sm: 4 }, pb: { xs: 2, sm: 3 }, boxSizing: "border-box" }}>
				<form onSubmit={submitTask}>
					<Box>
					{/* Title */}
					<Box sx={{ position: "relative" }}>
						<TextField fullWidth label="Task title" name="title" value={taskPayload.title} onChange={handleInputChange} error={!!errors.title} />
						<Collapse in={!!errors.title} sx={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 1 }}>
							<FormHelperText error sx={{ m: 0, lineHeight: "16px" }}>{errors.title}</FormHelperText>
						</Collapse>
					</Box>
					{/* Markdown-enabled Description */}
					<Box sx={{ mt: { xs: 2.5, sm: 3 }, mb: 0.25, minWidth: 0 }}>
						<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 1, flexWrap: "wrap", mb: 1 }}>
							<Box>
								<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Description</Typography>
							</Box>
							<Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ minHeight: 36, "& .MuiTabs-indicator": { height: 2, borderRadius: 1 }, "& .MuiTab-root": { minHeight: 36, minWidth: 64, px: 1, color: "text.secondary", textTransform: "none" }, "& .MuiTab-root.Mui-selected": { color: "primary.main", fontWeight: 600 } }}>
								<Tab value="write" label="Write" />
								<Tab value="preview" label="Preview" />
							</Tabs>
						</Box>
						{tab === "write" ? (
							<>
								<Box sx={{ position: "relative", mb: 2.5 }}>
								<TextField
									label="Task description"
									name="description"
									multiline
									rows={6}
									fullWidth
									value={taskPayload.description}
									onChange={handleInputChange}
									error={!!errors.description}
								/>
								<Box sx={{ position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
									<Collapse in={!!errors.description} sx={{ flex: 1, minWidth: 0 }}>
										<FormHelperText error sx={{ m: 0, lineHeight: "14px" }}>{errors.description}</FormHelperText>
									</Collapse>
									<Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary", flexShrink: 0 }}>
										<CodeIcon sx={{ fontSize: 17 }} />
										<Typography variant="caption">Markdown is enabled</Typography>
									</Box>
								</Box>
								</Box>
							</>
						) : (
							<>
								<Box
									sx={(theme) => ({
										border: `1px solid ${theme.palette.divider}`,
										borderRadius: 1,
										p: 2,
										minHeight: 184,
										maxHeight: 320,
										overflowY: "auto",
										overflowWrap: "anywhere",
										"& img": { maxWidth: "100%", height: "auto" },
										color: theme.palette.text.primary,
									})}
								>
									<ReactMarkdown>{taskPayload.description || "Nothing to preview"}</ReactMarkdown>
								</Box>
								<Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
									<Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary" }}>
										<CodeIcon sx={{ fontSize: 17 }} />
										<Typography variant="caption">Markdown is enabled</Typography>
									</Box>
								</Box>
							</>
						)}
					</Box>
					<Typography variant="subtitle2" color="text.secondary" sx={{ mt: { xs: 2.5, sm: 3 }, mb: 1, fontWeight: 600 }}>Planning and assignment</Typography>
					<Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }, rowGap: 2.5, columnGap: { xs: 0, sm: 2 }, alignItems: "start" }}>
					<Box sx={{ minWidth: 0, position: "relative" }}>
					{/* Due date */}
					<DatePicker
						label="Due Date"
						format="dd/MM/yyyy"
						minDate={new Date()}
						maxDate={new Date(projectDueDate)}
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
								margin: "none",
								error: !!errors.dueDate,
							},
						}}
					/>
					<Collapse in={!!errors.dueDate} sx={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 1 }}>
						<FormHelperText error sx={{ m: 0, lineHeight: "16px" }}>{errors.dueDate}</FormHelperText>
					</Collapse>
					</Box>
					<Box sx={{ minWidth: 0, position: "relative" }}>
					{/* State (read-only) */}
					<TextField fullWidth label="State" value={taskState || ""} readOnly />
					</Box>
					<Box sx={{ minWidth: 0, position: "relative" }}>
					{/* Priority */}
					<FormControl fullWidth error={!!errors.priority}>
						<InputLabel>Priority</InputLabel>
						<Select name="priority" value={taskPayload.priority} onChange={handleInputChange} label="Priority">
							<MenuItem value="LOW">Low</MenuItem>
							<MenuItem value="MEDIUM">Medium</MenuItem>
							<MenuItem value="HIGH">High</MenuItem>
						</Select>
					</FormControl>
					<Collapse in={!!errors.priority} sx={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 1 }}>
						<FormHelperText error sx={{ m: 0, lineHeight: "16px" }}>{errors.priority}</FormHelperText>
					</Collapse>
					</Box>
					<Box sx={{ minWidth: 0, position: "relative" }}>
					{/* Type */}
					<FormControl fullWidth error={!!errors.type}>
						<InputLabel>Type</InputLabel>
						<Select name="type" value={taskPayload.type} onChange={handleInputChange} label="Type">
							<MenuItem value="FEATURE">Feature</MenuItem>
							<MenuItem value="DEFECT">Defect</MenuItem>
							<MenuItem value="CUSTOMIZATION">Customization</MenuItem>
							<MenuItem value="BACKPORT">BackPort</MenuItem>
							<MenuItem value="FORWARDPORT">ForwardPort</MenuItem>
						</Select>
					</FormControl>
					<Collapse in={!!errors.type} sx={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 1 }}>
						<FormHelperText error sx={{ m: 0, lineHeight: "16px" }}>{errors.type}</FormHelperText>
					</Collapse>
					</Box>
					<Box sx={{ minWidth: 0, position: "relative" }}>
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
						sx={{ minWidth: 0 }}
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
					<Collapse in={!!errors.assignedTo} sx={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 1 }}>
						<FormHelperText error sx={{ m: 0, lineHeight: "16px" }}>{errors.assignedTo}</FormHelperText>
					</Collapse>
					</Box>
					<Box sx={{ minWidth: 0, position: "relative" }}>
					{/* Target Version */}
					<TextField
						fullWidth
						label="Target Version"
						name="targetVersion"
						value={taskPayload.targetVersion}
						onChange={handleInputChange}
						error={!!errors.targetVersion}
						margin="none"
					/>
					<Collapse in={!!errors.targetVersion} sx={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 1 }}>
						<FormHelperText error sx={{ m: 0, lineHeight: "16px" }}>{errors.targetVersion}</FormHelperText>
					</Collapse>
					</Box>
					</Box>
					{/* Restricted Edit */}
					<Box sx={{ display: "flex", alignItems: "center", mt: 2.5 }}>
						<FormControlLabel control={<Checkbox checked={taskPayload.restrictedEdit} onChange={handleRestrictedEditChange} name="restrictedEdit" />} label="Restricted Edit" />
						<Tooltip title={<Typography sx={{ fontSize: "14px" }}>If checked, only task owners can modify this task.</Typography>} arrow>
							<InfoIcon color="action" sx={{ fontSize: 25 }} />
						</Tooltip>
					</Box>
					</Box>
				</form>
			</Container>
			</Box>
		</Dialog>
	);
};

export default CreateAndUpdateTask;
