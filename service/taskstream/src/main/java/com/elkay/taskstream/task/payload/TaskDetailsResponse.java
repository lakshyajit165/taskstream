package com.elkay.taskstream.task.payload;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.io.Serializable;
import java.time.Instant;


public class TaskDetailsResponse implements Serializable {
    // --- Task Fields (t.*) ---
    private Long id;
    private String title;
    private String description;
    
    private Instant dueDate; // time stamp needed for native query

    private String state;        // Mapped from t.state (EnumType.STRING)
    private String priority;     // Mapped from t.priority (EnumType.STRING)
    private String type;         // Mapped from t.type (EnumType.STRING)
    
    private Instant createdAt;
    private Instant updatedAt;

    private String targetVersion;
    private Boolean restrictedEdit;

    // --- Project Fields (p.*) ---
    private Long projectId;      // Mapped from p.id AS project_id
    private String projectName;  // Mapped from p.title AS project_name

    private Instant projectDueDate; // Mapped from p.due_date as project_due_date

    // --- Assigned To User (ua.*) ---
    private Long assignedToId;   // Mapped from ua.id AS assigned_to_id
    private String assignedToName; // Mapped from ua.name AS assigned_to_name

    // --- Created By User (uc.*) ---
    private Long createdById;    // Mapped from uc.id AS created_by_id
    private String createdByName;  // Mapped from uc.name AS created_by_name

    // --- Updated By User (uu.*) ---
    private Long updatedById;    // Mapped from uu.id AS updated_by_id
    private String updatedByName;  // Mapped from uu.name AS updated_by_name

    public TaskDetailsResponse() {
    }

    public TaskDetailsResponse(Long id, String title, String description, Instant dueDate, String state, String priority, String type, Instant createdAt, Instant updatedAt, String targetVersion, Boolean restrictedEdit, Long projectId, String projectName, Instant projectDueDate, Long assignedToId, String assignedToName, Long createdById, String createdByName, Long updatedById, String updatedByName) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.state = state;
        this.priority = priority;
        this.type = type;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.targetVersion = targetVersion;
        this.restrictedEdit = restrictedEdit;
        this.projectId = projectId;
        this.projectName = projectName;
        this.projectDueDate = projectDueDate;
        this.assignedToId = assignedToId;
        this.assignedToName = assignedToName;
        this.createdById = createdById;
        this.createdByName = createdByName;
        this.updatedById = updatedById;
        this.updatedByName = updatedByName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Instant getDueDate() {
        return dueDate;
    }

    public void setDueDate(Instant dueDate) {
        this.dueDate = dueDate;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
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

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public Instant getProjectDueDate() {
        return projectDueDate;
    }

    public void setProjectDueDate(Instant projectDueDate) {
        this.projectDueDate = projectDueDate;
    }

    public Long getAssignedToId() {
        return assignedToId;
    }

    public void setAssignedToId(Long assignedToId) {
        this.assignedToId = assignedToId;
    }

    public String getAssignedToName() {
        return assignedToName;
    }

    public void setAssignedToName(String assignedToName) {
        this.assignedToName = assignedToName;
    }

    public Long getCreatedById() {
        return createdById;
    }

    public void setCreatedById(Long createdById) {
        this.createdById = createdById;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public Long getUpdatedById() {
        return updatedById;
    }

    public void setUpdatedById(Long updatedById) {
        this.updatedById = updatedById;
    }

    public String getUpdatedByName() {
        return updatedByName;
    }

    public void setUpdatedByName(String updatedByName) {
        this.updatedByName = updatedByName;
    }
}
