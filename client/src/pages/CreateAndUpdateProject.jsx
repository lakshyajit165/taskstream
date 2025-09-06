// src/pages/CreateAndUpdateProject.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Box, Typography, TextField, Button, Chip, Stack, Autocomplete } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { ToastContext } from "../context/ToastContext";
import { getProjectById, createProject, updateProject } from "../api/project/projects";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const CreateAndUpdateProject = () => {
	const { showToast } = useContext(ToastContext);
	const navigate = useNavigate();
	const { id } = useParams(); // undefined in create mode
	const isEdit = Boolean(id);

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [dueDate, setDueDate] = useState(""); // string in YYYY-MM-DD
	const [tags, setTags] = useState([]);
	const [tagInput, setTagInput] = useState("");

	// Prepopulate in edit mode
	useEffect(() => {
		if (isEdit) {
			const fetchProject = async () => {
				try {
					const response = await getProjectById(id);
					const project = response.data;
					setTitle(project.title);
					setDescription(project.description);
					setDueDate(project.dueDate); // format YYYY-MM-DD
					setTags(project.tags || []);
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
			if (newTag && !tags.includes(newTag)) {
				setTags([...tags, newTag]);
			}
			setTagInput("");
		}
	};

	const handleDeleteTag = (tagToDelete) => {
		setTags(tags.filter((t) => t !== tagToDelete));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const payload = { title, description, dueDate, tags };

		try {
			if (isEdit) {
				console.log(payload);
				await updateProject(id, payload);
				showToast("Project updated successfully!", "info");
			} else {
				console.log(payload);
				await createProject(payload);
				showToast("Project created successfully!", "info");
			}
			navigate("/projects");
		} catch (err) {
			showToast(err.message || "Failed to save project", "error");
		}
	};

	return (
		<Container sx={{ maxWidth: { xs: 400, sm: 600 } }}>
			<Box sx={{ my: 4 }}>
				<Typography variant="h4" gutterBottom>
					{isEdit ? "Edit Project" : "Create Project"}
				</Typography>

				<form onSubmit={handleSubmit}>
					{/* Title */}
					<TextField label="Title" fullWidth required value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mb: 3 }} />

					{/* Description with Markdown preview */}
					<TextField label="Description (Markdown supported)" fullWidth required multiline minRows={4} value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mb: 1 }} />
					<Box
						sx={{
							border: "1px solid #ccc",
							borderRadius: 1,
							p: 2,
							mb: 3,
							bgcolor: "#fafafa",
						}}
					>
						<Typography variant="subtitle2" gutterBottom>
							Preview:
						</Typography>
						<ReactMarkdown>{description || "Enter description to update the preview"}</ReactMarkdown>
					</Box>

					<DatePicker
						label="Due Date"
						format="dd/MM/yyyy"
						minDate={new Date()}
						value={dueDate ? new Date(dueDate) : null}
						onChange={(newValue) => setDueDate(newValue ? newValue.toISOString() : "")}
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
					<Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 3 }}>
						{tags.map((tag, index) => (
							<Chip key={index} label={tag} onDelete={() => handleDeleteTag(tag)} color="info" variant="outlined" />
						))}
					</Stack>

					{/* Buttons */}
					<Box sx={{ display: "flex", gap: 2 }}>
						<Button type="submit" variant="contained" color="primary">
							{isEdit ? "Update" : "Create"}
						</Button>
						<Button variant="outlined" onClick={() => navigate("/projects")}>
							Cancel
						</Button>
					</Box>
				</form>
			</Box>
		</Container>
	);
};

export default CreateAndUpdateProject;
