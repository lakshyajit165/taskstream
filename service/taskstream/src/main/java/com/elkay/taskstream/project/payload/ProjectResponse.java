package com.elkay.taskstream.project.payload;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ProjectResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> tags;

    /**
     * param: isEditable
     * denotes if the project is editable for a user;
       only user who created a project can edit it. Need
       it for the UI - anyone should be able to view
       all projects. But a project is editable for those
       who created it
     */
    private Map<String, Object> additionalParams = new HashMap<>();

    // contructor
    public ProjectResponse() {
    }

    // constructor
    public ProjectResponse(Long id, String title, String description, LocalDateTime dueDate,
                           LocalDateTime createdAt, LocalDateTime updatedAt, List<String> tags, Map<String, ?> additionalParams) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.tags = tags;
        if(additionalParams != null) {
            this.additionalParams.putAll(additionalParams);
        }
    }

    // getters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public LocalDateTime getDueDate() { return dueDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public List<String> getTags() { return tags; }
    public Map<String, Object> getAdditionalParams() { return additionalParams; }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public void addParam(String key, Object value) {
        this.additionalParams.put(key, value);
    }
}
