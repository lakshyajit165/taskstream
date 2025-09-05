package com.elkay.taskstream.project.payload;

import java.time.LocalDateTime;
import java.util.List;

public class ProjectResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> tags;

    // constructor
    public ProjectResponse(Long id, String title, String description, LocalDateTime dueDate,
                           LocalDateTime createdAt, LocalDateTime updatedAt, List<String> tags) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.tags = tags;
    }

    // getters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public LocalDateTime getDueDate() { return dueDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public List<String> getTags() { return tags; }
}
