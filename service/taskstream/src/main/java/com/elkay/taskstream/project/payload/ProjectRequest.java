package com.elkay.taskstream.project.payload;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.Set;

public class ProjectRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @Size(max = 2000, message = "Description can be at most 2000 characters")
    private String description;

    @NotNull(message = "Due date is required")
    @FutureOrPresent(message = "Due date must be in the present or future")
    private LocalDateTime dueDate;

    @NotEmpty(message = "At least one tag is required")
    private Set<@NotBlank(message = "Tags cannot be blank") String> tags;

    // Getters & Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public Set<String> getTags() { return tags; }
    public void setTags(Set<String> tags) { this.tags = tags; }
}
