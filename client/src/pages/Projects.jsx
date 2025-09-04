import React, { useState } from "react";
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Button,
    TextField,
    Divider,
    Pagination,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const Projects = () => {
    const [projects, setProjects] = useState([
        {
            id: 1,
            title: "Sample Project",
            description: "This is a demo project",
            dueDate: "2025-09-10",
            createdBy: "User1",
            createdAt: "2025-09-01",
            updatedAt: "2025-09-02",
        },
    ]);

    const [formMode, setFormMode] = useState(null); // "create" | "edit" | "view"
    const [currentProject, setCurrentProject] = useState(null);
    const [formValues, setFormValues] = useState({
        title: "",
        description: "",
        dueDate: null,
    });

    const resetForm = () => {
        setFormValues({ title: "", description: "", dueDate: null });
        setCurrentProject(null);
        setFormMode(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    const handleCreate = () => {
        const newProject = {
            id: projects.length + 1,
            ...formValues,
            dueDate: formValues.dueDate
                ? new Date(formValues.dueDate).toISOString().split("T")[0]
                : "",
            createdBy: "User1",
            createdAt: new Date().toISOString().split("T")[0],
            updatedAt: new Date().toISOString().split("T")[0],
        };
        setProjects([...projects, newProject]);
        resetForm();
    };

    const handleEdit = (project) => {
        setCurrentProject(project);
        setFormValues({
            title: project.title,
            description: project.description,
            dueDate: new Date(project.dueDate),
        });
        setFormMode("edit");
    };

    const handleUpdate = () => {
        setProjects(
            projects.map((p) =>
                p.id === currentProject.id
                    ? {
                        ...p,
                        ...formValues,
                        dueDate: formValues.dueDate
                            ? new Date(formValues.dueDate).toISOString().split("T")[0]
                            : "",
                        updatedAt: new Date().toISOString().split("T")[0],
                    }
                    : p
            )
        );
        resetForm();
    };

    const handleDelete = (id) => {
        setProjects(projects.filter((p) => p.id !== id));
        resetForm();
    };

    const handleView = (project) => {
        setCurrentProject(project);
        setFormMode("view");
    };

    // Pagination state
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;
    const handlePageChange = (_, value) => {
        setPage(value);
    };

    const paginatedProjects = projects.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                mt: 4,
                width: "100%",
            }}
        >
            <Paper
                sx={{
                    p: 3,
                    width: "100%",
                    maxWidth: 700,
                }}
                elevation={0}
            >
                <Typography variant="h5" gutterBottom>
                    Projects
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {/* List of Projects */}
                {formMode === null && (
                    <>
                        <List>
                            {paginatedProjects.map((project, index) => (
                                <React.Fragment key={project.id}>
                                    <ListItem
                                        secondaryAction={
                                            <Box sx={{ display: "flex", gap: 1 }}>
                                                <IconButton onClick={() => handleView(project)}>
                                                    <InfoOutlinedIcon />
                                                </IconButton>
                                                <IconButton onClick={() => handleEdit(project)}>
                                                    <EditOutlinedIcon />
                                                </IconButton>
                                                <IconButton onClick={() => handleDelete(project.id)}>
                                                    <DeleteOutlinedIcon />
                                                </IconButton>
                                            </Box>
                                        }
                                    >
                                        <ListItemText
                                            primary={project.title}
                                            secondary={project.description}
                                        />
                                    </ListItem>
                                    {index < paginatedProjects.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                mt: 2,
                            }}
                        >
                            <Pagination
                                count={Math.ceil(projects.length / itemsPerPage)}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                            />
                        </Box>
                        <Button
                            variant="contained"
                            sx={{ mt: 2 }}
                            onClick={() => setFormMode("create")}
                        >
                            Add
                        </Button>
                    </>
                )}

                {/* Create/Edit Form */}
                {(formMode === "create" || formMode === "edit") && (
                    <Box
                        component="form"
                        noValidate
                        sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}
                    >
                        <TextField
                            fullWidth
                            label="Title"
                            name="title"
                            value={formValues.title}
                            onChange={handleInputChange}
                            variant="outlined"
                        />

                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={formValues.description}
                            onChange={handleInputChange}
                            multiline
                            minRows={3}
                            variant="outlined"
                            sx={{
                                "& .MuiInputBase-root": {
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                },
                            }}
                        />

                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Due Date"
                                value={formValues.dueDate}
                                onChange={(newValue) =>
                                    setFormValues({ ...formValues, dueDate: newValue })
                                }
                                slotProps={{
                                    textField: { fullWidth: true, variant: "outlined" },
                                }}
                            />
                        </LocalizationProvider>

                        <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2 }}>
                            <Button
                                variant="contained"
                                onClick={formMode === "create" ? handleCreate : handleUpdate}
                            >
                                Submit
                            </Button>
                            <Button variant="outlined" onClick={resetForm}>
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* View Project */}
                {formMode === "view" && currentProject && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6">{currentProject.title}</Typography>
                        <Typography>{currentProject.description}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Due: {currentProject.dueDate}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Created by: {currentProject.createdBy}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Created At: {currentProject.createdAt}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Updated At: {currentProject.updatedAt}
                        </Typography>
                        <Button sx={{ mt: 2 }} variant="outlined" onClick={resetForm}>
                            Back
                        </Button>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default Projects;
