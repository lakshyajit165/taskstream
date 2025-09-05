package com.elkay.taskstream.project.controller;

import com.elkay.taskstream.payload.GenericResponse;
import com.elkay.taskstream.project.model.Project;
import com.elkay.taskstream.project.payload.ProjectRequest;
import com.elkay.taskstream.project.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/project")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    /**
     * Create new project
     */
    @PostMapping()
    public ResponseEntity<GenericResponse<Project>> createProject(@Valid @RequestBody ProjectRequest projectRequest) {
        Project project = projectService.createProject(projectRequest);
        return ResponseEntity.ok(new GenericResponse<>("Project created successfully", false, project));
    }

    /**
     * Get all projects of logged-in user
     */
    @GetMapping
    public ResponseEntity<GenericResponse<List<Project>>> getMyProjects() {
        List<Project> projects = projectService.getMyProjects();
        return ResponseEntity.ok(new GenericResponse<>("Projects fetched successfully", false, projects));
    }

    /**
     * Update a project by ID
     */
    @PutMapping("/{id}")
    public ResponseEntity<GenericResponse<Project>> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest projectRequest
    ) {
        Project project = projectService.updateProject(id, projectRequest);
        return ResponseEntity.ok(new GenericResponse<>("Project updated successfully", false, project));
    }

    /**
     * Delete a project by ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<GenericResponse<Void>> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(new GenericResponse<>("Project deleted successfully", false));
    }
}
