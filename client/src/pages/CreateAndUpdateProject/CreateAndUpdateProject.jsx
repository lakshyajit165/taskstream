// src/pages/CreateAndUpdateProject.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Box, Typography, TextField, Button, Chip, Stack, Autocomplete, Tabs, Tab, Collapse, FormHelperText, CircularProgress } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { ToastContext } from "../../context/ToastContext";
import { getProjectById, createProject, updateProject } from "../../api/project/projects";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { validateProject } from "../../api/utils/formValidation";
import CodeIcon from "@mui/icons-material/Code";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import { uploadResources } from "../../utils/resourceUpload";
import { markdownComponents } from "../../components/markdownComponents";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

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
		<Container maxWidth={false} sx={{ width: "100%", maxWidth: { xs: "100%", sm: "800px" }, py: { xs: 2, sm: 4 }, boxSizing: "border-box" }}>
			<Box sx={{ mb: 4 }}>
				<Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 1.5, mb: 0.75 }}>
					<DescriptionOutlinedIcon color="primary" sx={{ fontSize: 28, flexShrink: 0 }} />
					<Box sx={{ minWidth: 0 }}>
						<Typography variant="h5" component="h1" sx={{ fontWeight: 600, fontSize: { xs: "1.45rem", sm: "1.75rem" }, lineHeight: 1.25 }}>
							{isEdit ? "Edit project" : "Create a project"}
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
							{isEdit ? "Update the project details and keep your team aligned." : "Set up a shared space for your team's work."}
						</Typography>
					</Box>
				</Box>
			</Box>

			<form onSubmit={handleSubmit}>
				<Box sx={{ py: { xs: 0, sm: 1 } }}>
						<input type="file" hidden multiple accept="image/*,video/*" ref={fileInputRef} onChange={handleFileChange} />
						<Box sx={{ position: "relative" }}>
							<TextField label="Project title" fullWidth name="title" value={projectPayload.title} onChange={handleInputChange} error={!!errors.title} />
							<Collapse in={!!errors.title} sx={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 1 }}>
								<FormHelperText error sx={{ m: 0, lineHeight: "16px" }}>{errors.title}</FormHelperText>
							</Collapse>
						</Box>

						<Box sx={{ mt: { xs: 2.5, sm: 3 } }}>
							<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 1, flexWrap: "wrap", mb: 1 }}>
								<Box>
									<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Description</Typography>
									<Typography variant="body2" color="text.secondary">Add context, goals, and useful project notes.</Typography>
								</Box>
								<Stack direction="row" spacing={0.5}>
								<Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ minHeight: 36, "& .MuiTabs-indicator": { height: 2, borderRadius: 1 }, "& .MuiTab-root": { minHeight: 36, minWidth: 64, px: 1, color: "text.secondary", textTransform: "none" }, "& .MuiTab-root.Mui-selected": { color: "primary.main", fontWeight: 600 } }}>
									<Tab value="write" label="Write" />
									<Tab value="preview" label="Preview" />
									</Tabs>
								</Stack>
							</Box>
							{tab === "write" ? (
								<>
									<Box sx={{ position: "relative", mb: 2.5 }}>
									<TextField
										label="Project description"
										name="description"
										multiline
									rows={6}
										fullWidth
										inputRef={descriptionRef}
										value={projectPayload.description}
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
								<Box sx={(theme) => ({
									border: `1px solid ${theme.palette.divider}`,
									borderRadius: 1,
									p: { xs: 1.5, sm: 2 },
									minHeight: 184,
									maxHeight: 320,
									overflowY: "auto",
									color: theme.palette.text.primary,
									"& *": { overflowWrap: "anywhere", wordBreak: "break-word" },
									"& img": { maxWidth: "100%", height: "auto" },
								})}>
									<ReactMarkdown components={markdownComponents}>{projectPayload.description || "Nothing to preview"}</ReactMarkdown>
								</Box>
							)}
							{tab === "preview" && (
								<Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
									<Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary" }}>
										<CodeIcon sx={{ fontSize: 17 }} />
										<Typography variant="caption">Markdown is enabled</Typography>
									</Box>
								</Box>
							)}
							<Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
								<Button size="small" onClick={handleFileUpload} startIcon={<AddPhotoAlternateOutlinedIcon />} sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}>
									Upload file
								</Button>
							</Box>
						</Box>

							<Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }, gap: { xs: 2.5, sm: 2 }, alignItems: "start", mt: 1 }}>
							<Box sx={{ minWidth: 0, position: "relative" }}>
								<DatePicker
									label="Due date"
									format="dd/MM/yyyy"
									minDate={new Date()}
									value={projectPayload.dueDate ? new Date(projectPayload.dueDate) : null}
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
									slotProps={{ textField: { fullWidth: true, margin: "none", error: !!errors.dueDate } }}
								/>
								<Collapse in={!!errors.dueDate} sx={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 1 }}>
									<FormHelperText error sx={{ m: 0, lineHeight: "16px" }}>{errors.dueDate}</FormHelperText>
								</Collapse>
							</Box>
							<Box sx={{ minWidth: 0, position: "relative" }}>
								<TextField
									label="Add tags"
									placeholder="Press Enter or comma to add"
									fullWidth
									value={tagInput}
									onChange={(e) => setTagInput(e.target.value)}
									onKeyDown={handleAddTag}
									error={!!errors.tags}
								/>
								<Collapse in={!!errors.tags} sx={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 1 }}>
									<FormHelperText error sx={{ m: 0, lineHeight: "16px" }}>{errors.tags}</FormHelperText>
								</Collapse>
								<Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, mt: 2.5, minWidth: 0 }}>
									{projectPayload.tags.map((tag, index) => (
										<Chip key={index} label={tag} onDelete={() => handleDeleteTag(tag)} color="primary" variant="outlined" sx={{ maxWidth: "100%" }} />
									))}
								</Stack>
						</Box>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "flex-start", gap: 1, mt: 2.5, flexDirection: "row", flexWrap: "wrap" }}>
						<Button size="small" type="submit" variant="contained" color="primary" disabled={loading} sx={{ minHeight: 36, px: 2, boxShadow: "none", whiteSpace: "nowrap", "&:hover": { boxShadow: "none" } }}>
							{loading ? <Box sx={{ display: "flex", alignItems: "center" }}><CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />Saving...</Box> : "Save"}
						</Button>
						<Button size="small" variant="text" onClick={() => navigate(-1)} sx={{ minHeight: 36, color: "text.secondary" }}>
							Cancel
						</Button>
					</Box>
				</Box>
			</form>
		</Container>
	);
};

export default CreateAndUpdateProject;
