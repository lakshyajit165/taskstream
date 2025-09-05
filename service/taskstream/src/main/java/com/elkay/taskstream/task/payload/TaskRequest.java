package com.elkay.taskstream.task.payload;

import com.elkay.taskstream.task.model.TaskPriority;
import com.elkay.taskstream.task.model.TaskState;
import com.elkay.taskstream.task.model.TaskType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class TaskRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Due date is required")
    private LocalDateTime dueDate;

    @NotNull(message = "State is required")
    private TaskState state;

    @NotNull(message = "Priority is required")
    private TaskPriority priority;

    @NotNull(message = "Type is required")
    private TaskType type;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "Assigned to is required")
    private Long assignedTo;

    private String targetVersion;

    private Boolean restrictedEdit = false;

    public TaskRequest() {
    }

    // Getters and Setters

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public TaskState getState() {
        return state;
    }

    public void setState(TaskState state) {
        this.state = state;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

    public TaskType getType() {
        return type;
    }

    public void setType(TaskType type) {
        this.type = type;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Long getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(Long assignedTo) {
        this.assignedTo = assignedTo;
    }

    public String getTargetVersion() {
        return targetVersion;
    }

    public void setTargetVersion(String targetVersion) {
        this.targetVersion = targetVersion;
    }

    public Boolean getRestrictedEdit() {
        return restrictedEdit;
    }

    public void setRestrictedEdit(Boolean restrictedEdit) {
        this.restrictedEdit = restrictedEdit;
    }
}
