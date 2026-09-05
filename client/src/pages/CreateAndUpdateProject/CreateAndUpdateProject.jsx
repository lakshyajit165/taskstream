// src/pages/CreateAndUpdateProject.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Box, Typography, TextField, Button, Chip, Stack, Autocomplete, Tabs, Tab, Collapse, FormHelperText, CircularProgress } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { ToastContext } from "../../context/ToastContext";
import { getProjectById, createProject, updateProject } from "../../api/project/projects";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { validateProject } from "../../api/utils/formValidation";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ViewHeadlineIcon from "@mui/icons-material/ViewHeadline";
import CodeIcon from "@mui/icons-material/Code";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import { uploadResources } from "../../utils/resourceUpload";
import { markdownComponents } from "../../components/markdownComponents";

const CreateAndUpdateProject = () => {
	const { showToast } = useContext(ToastContext);
	const navigate = useNavigate();
	const { id } = useParams(); // undefined in create mode
	const isEdit = Boolean(id);
	const [project, setProject] = useState(null);
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

	const fileInputRef = React.useRef(null);
	// for description cursor position
	const descriptionRef = React.useRef(null);

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
			fetchProject();
		}
	}, [id, isEdit]);

	const fetchProject = async () => {
		try {
			const response = await getProjectById(id);
			const projectDetails = response.data;
			setProject(projectDetails);
			setProjectPayload((prevPayload) => ({ ...prevPayload, title: projectDetails.title }));
			setProjectPayload((prevPayload) => ({ ...prevPayload, description: projectDetails.description }));
			setProjectPayload((prevPayload) => ({ ...prevPayload, dueDate: projectDetails.dueDate }));
			setProjectPayload((prevPayload) => ({ ...prevPayload, tags: projectDetails.tags }));
		} catch (error) {
			showToast(error.message || "Failed to fetch project details", "error");
		}
	};

	// Handle adding tags
	const handleAddTag = (e) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			const newTag = tagInput.trim();
			if (!newTag) {
				setTagInput("");
				return;
			}

			// Use functional update and avoid duplicates
			setProjectPayload((prev) => {
				const existing = prev.tags || [];
				if (existing.includes(newTag)) {
					return prev;
				}
				const newTags = [...existing, newTag];
				// Validate tags field only
				const fieldErrors = validateProject({ tags: newTags });

				setErrors((prevErrors) => {
					const newErrors = { ...prevErrors };
					if (fieldErrors.tags) {
						newErrors.tags = fieldErrors.tags;
					} else {
						delete newErrors.tags;
					}
					return newErrors;
				});

				return { ...prev, tags: newTags };
			});

			setTagInput("");
		}
	};

	const handleDeleteTag = (tagToDelete) => {
		setProjectPayload((prev) => {
			const newTags = (prev.tags || []).filter((t) => t !== tagToDelete);

			// Validate tags field only
			const fieldErrors = validateProject({ tags: newTags });
			setErrors((prevErrors) => {
				const newErrors = { ...prevErrors };
				if (fieldErrors.tags) {
					newErrors.tags = fieldErrors.tags;
				} else {
					delete newErrors.tags;
				}
				return newErrors;
			});

			return { ...prev, tags: newTags };
		});
	};

	const handleSubmit = async (e) => {
		setLoading(true);
		e.preventDefault();
		// const payload = { title, description, dueDate, tags };

		try {
			const validationErrors = validateProject(projectPayload);
			if (Object.keys(validationErrors).length === 0) {
				if (isEdit) {
					await updateProject(id, projectPayload);
					showToast("Project updated successfully!", "success");
				} else {
					await createProject(projectPayload);
					showToast("Project created successfully!", "success");
				}
				navigate("/projects");
			} else {
				setErrors(validationErrors);
			}
		} catch (err) {
			showToast(err.message || "Failed to save project", "error");
		} finally {
			setLoading(false);
		}
	};

	const handleFileUpload = () => {
		if (!fileInputRef.current) return;
		fileInputRef.current.click();
	};

	const insertAtCursor = (markdownSnippet) => {
		setProjectPayload((prev) => {
			const currentText = prev.description || "";
			const textarea = descriptionRef.current;

			// If textarea not focused or ref missing → append to end
			if (!textarea || textarea.selectionStart === null) {
				return {
					...prev,
					description: currentText + markdownSnippet,
				};
			}

			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;

			const newText = currentText.substring(0, start) + markdownSnippet + currentText.substring(end);

			return {
				...prev,
				description: newText,
			};
		});
	};

	const handleFileChange = async (e) => {
		const files = Array.from(e.target.files || []);
		if (!files.length) return;

		try {
			const uploadedFiles = await uploadResources({
				files,
				resourceType: "projects",
			});

			uploadedFiles.forEach(({ fileName, fileType, fileUrl }) => {
				let markdownSnippet = "";

				if (fileType.startsWith("image/")) {
					markdownSnippet = `\n![${fileName}](${fileUrl})\n`;
				} else {
					markdownSnippet = `\n[${fileName}](${fileUrl})\n`;
				}

				insertAtCursor(markdownSnippet);
			});

			showToast("File(s) uploaded successfully", "success");
		} catch (err) {
			showToast(err.message || "File upload failed", "error");
		} finally {
			e.target.value = null;
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
					{/** hidden file input */}
					<input type="file" hidden multiple accept="image/*,video/*" ref={fileInputRef} onChange={handleFileChange} />
					{/* Title */}
					<TextField label="Project title" fullWidth name="title" value={projectPayload.title} onChange={handleInputChange} error={!!errors.title} margin="normal" />
					<Collapse in={!!errors.title}>
						<FormHelperText error>{errors.title}</FormHelperText>
					</Collapse>
					{/* Markdown-enabled Description */}
					<Box sx={{ mb: 1 }}>
						<Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ mb: 2 }}>
							<Tab value="write" label="Write" icon={<EditNoteIcon />} iconPosition="start" />
							<Tab value="preview" label="Preview" icon={<ViewHeadlineIcon />} iconPosition="start" />
						</Tabs>
						{tab === "write" ? (
							<>
								<TextField
									label="Project description"
									name="description"
									multiline
									rows={8}
									fullWidth
									inputRef={descriptionRef}
									value={projectPayload.description}
									onChange={handleInputChange}
									error={!!errors.description}
								/>
								<Collapse in={!!errors.description}>
									<FormHelperText error>{errors.description}</FormHelperText>
								</Collapse>
							</>
						) : (
							<Box
								sx={(theme) => ({
									border: `1px solid ${theme.palette.divider}`,
									borderRadius: 1,
									p: 2,
									height: "184px", // MUI ~23px per row * 8 = 184px
									overflowY: "auto", // ✅ Scroll when content exceeds
									backgroundColor: "inherit",
									color: theme.palette.text.primary,
								})}
							>
								<ReactMarkdown components={markdownComponents}>{projectPayload.description || "Nothing to preview"}</ReactMarkdown>
							</Box>
						)}
					</Box>
					<Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
						<CodeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
						<Typography variant="caption" color="text.secondary">
							Markdown is enabled
						</Typography>
						<Box
							sx={{
								display: "inline-flex",
								alignItems: "center",
								gap: 0.5,
								ml: 1.5,
								cursor: "pointer",
								color: "text.secondary",
								"&:hover": {
									color: "text.primary",
								},
							}}
							onClick={handleFileUpload}
						>
							<AddPhotoAlternateOutlinedIcon sx={{ fontSize: 16 }} />
							<Typography variant="caption">Upload file</Typography>
						</Box>
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
					{/* Tags */}
					<TextField
						label="Tags"
						placeholder="Type a tag and press Enter or Comma"
						fullWidth
						value={tagInput}
						onChange={(e) => setTagInput(e.target.value)}
						onKeyDown={handleAddTag}
						// sx={{ mb: 2 }}
						error={!!errors.tags}
						margin="normal"
					/>
					<Collapse in={!!errors.tags}>
						<FormHelperText error>{errors.tags}</FormHelperText>
					</Collapse>
					<Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1.5, columnGap: 1, mb: 3 }}>
						{projectPayload.tags.map((tag, index) => (
							<Chip key={index} label={tag} onDelete={() => handleDeleteTag(tag)} color="primary" variant="outlined" style={{ borderRadius: "5px" }} />
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
