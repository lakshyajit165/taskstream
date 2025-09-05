package com.elkay.taskstream.project.model;

import com.elkay.taskstream.auth.model.User;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "projects")
@EntityListeners(AuditingEntityListener.class)
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    private LocalDateTime dueDate;

    @Column(name = "author_id", nullable = false)
    private Long authorId;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * orphanRemoval = true is useful when a child entity cannot exist without its parent.
     * It ensures database consistency automatically.
     * */
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProjectTag> tags = new HashSet<>();

    public Project() {}

    public Project(String title, String description, LocalDateTime dueDate, Long authorId) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.authorId = authorId;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    public Long getAuthor() { return authorId; }
    public void setCreatedBy(Long authorId) { this.authorId = authorId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public Set<ProjectTag> getTags() { return tags; }
    public void setTags(Set<ProjectTag> tags) { this.tags = tags; }

    public void addTag(ProjectTag tag) {
        tags.add(tag);
        tag.setProject(this);
    }

    public void removeTag(ProjectTag tag) {
        tags.remove(tag);
        tag.setProject(null);
    }
}
