// src/pages/CreateAndUpdateProject.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Box, Typography, TextField, Button, Chip, Stack, Autocomplete, Tabs, Tab, Collapse, FormHelperText, CircularProgress } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { ToastContext } from "../../context/ToastContext";
import { getProjectById, createProject, updateProject } from "../../api/project/projects";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { validateProject } from "../../api/utils/formValidation";

const CreateAndUpdateProject = () => {
	const { showToast } = useContext(ToastContext);
	const navigate = useNavigate();
	const { id } = useParams(); // undefined in create mode
	const isEdit = Boolean(id);

	const [project, setProject] = useState(null);
	// const [title, setTitle] = useState("");
	// const [description, setDescription] = useState("");
	// const [dueDate, setDueDate] = useState(""); // string in YYYY-MM-DD
	// const [tags, setTags] = useState([]);

	const [projectPayload, setProjectPayload] = useState({
		title: isEdit && project ? project.title : "",
		description: isEdit && project ? project.description : "",
		dueDate: isEdit && project ? project.dueDate : "",
		tags: isEdit && project ? project.tags : [],
	});
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);

	const [tagInput, setTagInput] = useState("");

	// Markdown editor tab (write/preview)
	const [tab, setTab] = useState("write");

	const handleInputChange = (e) => {
		const { name, value } = e.target;

		// 1. Update the main payload state
		setProjectPayload((prevPayload) => ({ ...prevPayload, [name]: value }));

		// 2. Validate just the changed field
		let fieldErrors = validateProject({ [name]: value });

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

	// Prepopulate in edit mode
	useEffect(() => {
		if (isEdit) {
			const fetchProject = async () => {
				try {
					const response = await getProjectById(id);
					const projectDetails = response.data;
					setProject(projectDetails);
					// setTitle(projectDetails.title);
					setProjectPayload((prevPayload) => ({ ...prevPayload, title: projectDetails.title }));
					setProjectPayload((prevPayload) => ({ ...prevPayload, description: projectDetails.description }));
					setProjectPayload((prevPayload) => ({ ...prevPayload, dueDate: projectDetails.dueDate }));
					setProjectPayload((prevPayload) => ({ ...prevPayload, tags: projectDetails.tags }));
					// setDescription(projectDetails.description);
					// setDueDate(projectDetails.dueDate); // format YYYY-MM-DD
					// setTags(projectDetails.tags || []);
				} catch (error) {
					showToast(error.message || "Failed to fetch project details", "error");
				}
			};
			fetchProject();
		}
	}, [id, isEdit]);

	// Handle adding tags
	const handleAddTag = (e) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			const newTag = tagInput.trim();
			if (newTag && !projectPayload.tags.includes(newTag)) {
				// setTags([...tags, newTag]);
				setProjectPayload((prevPayload) => ({ ...prevPayload, tags: [...projectPayload.tags, newTag] }));
			}
			setTagInput("");
		}
	};

	const handleDeleteTag = (tagToDelete) => {
		// setTags(tags.filter((t) => t !== tagToDelete));
		setProjectPayload((prevPayload) => ({ ...prevPayload, tags: projectPayload.tags.filter((t) => t !== tagToDelete) }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		// const payload = { title, description, dueDate, tags };

		try {
			if (isEdit) {
				await updateProject(id, projectPayload);
				showToast("Project updated successfully!", "info");
			} else {
				await createProject(projectPayload);
				showToast("Project created successfully!", "info");
			}
			navigate("/projects");
		} catch (err) {
			showToast(err.message || "Failed to save project", "error");
		}
	};

	return (
		<Container sx={{ maxWidth: { xs: 400, sm: 600 } }}>
			<Box sx={{ my: 2 }}>
				{/* Heading with image on right */}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<Typography variant="h5" component="h5" gutterBottom>
						{isEdit ? "Edit Project" : "Create Project"}
					</Typography>
				</Box>

				<form onSubmit={handleSubmit}>
					{/* Title */}
					<TextField label="Title" fullWidth name="title" value={projectPayload.title} onChange={handleInputChange} error={!!errors.title} margin="normal" />
					<Collapse in={!!errors.title}>
						<FormHelperText error>{errors.title}</FormHelperText>
					</Collapse>
					{/* Markdown-enabled Description */}
					<Box sx={{ mb: 2 }}>
						<Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ mb: 2 }}>
							<Tab value="write" label="Write" />
							<Tab value="preview" label="Preview" />
						</Tabs>
						{tab === "write" ? (
							<>
								<TextField
									label="Project description"
									name="description"
									multiline
									rows={4}
									fullWidth
									value={projectPayload.description}
									// onChange={(e) => setDescription(e.target.value)}
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
								<ReactMarkdown>{projectPayload.description || "Nothing to preview"}</ReactMarkdown>
							</Box>
						)}
					</Box>

					<DatePicker
						label="Due Date"
						format="dd/MM/yyyy"
						minDate={new Date()}
						value={projectPayload.dueDate ? new Date(projectPayload.dueDate) : null}
						// onChange={(newValue) => setDueDate(newValue ? newValue.toISOString() : "")}
						onChange={(newValue) => {
							const newDueDate = newValue ? newValue.toISOString() : "";

							// 1. Update payload
							setProjectPayload((prev) => ({
								...prev,
								dueDate: newDueDate,
							}));

							// 2. Validate just the dueDate field
							const fieldErrors = validateProject({ dueDate: newDueDate });

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
						renderInput={(params) => (
							<TextField
								{...params}
								fullWidth // ✅ Full width applied here
								required
								sx={{ mb: 3 }}
							/>
						)}
						sx={{ width: "100%", mb: 2 }} // optional: ensure container width
					/>
					<Collapse in={!!errors.dueDate}>
						<FormHelperText error>{errors.dueDate}</FormHelperText>
					</Collapse>
					{/* Tags */}
					<TextField
						label="Tags"
						placeholder="Type a tag and press Enter or Comma"
						fullWidth
						value={tagInput}
						onChange={(e) => setTagInput(e.target.value)}
						onKeyDown={handleAddTag}
						sx={{ mb: 2 }}
					/>
					<Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1.5, columnGap: 1.5, mb: 3 }}>
						{projectPayload.tags.map((tag, index) => (
							<Chip key={index} label={tag} onDelete={() => handleDeleteTag(tag)} color="info" variant="outlined" />
						))}
					</Stack>

					{/* Buttons */}
					<Box sx={{ display: "flex", gap: 2 }}>
						<Button type="submit" variant="contained" color="primary" disabled={loading}>
							{loading ? ( // <--- CONDITIONAL CONTENT
								<Box sx={{ display: "flex", alignItems: "center" }}>
									<CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
									Saving...
								</Box>
							) : (
								"Submit"
							)}
						</Button>
						<Button variant="outlined" onClick={() => navigate(-1)}>
							Cancel
						</Button>
					</Box>
				</form>
			</Box>
		</Container>
	);
};

export default CreateAndUpdateProject;
