package com.elkay.taskstream.project.controller;

import com.elkay.taskstream.exception.BadRequestException;
import com.elkay.taskstream.payload.GenericResponse;
import com.elkay.taskstream.project.model.Project;
import com.elkay.taskstream.project.payload.PaginatedProjectResponse;
import com.elkay.taskstream.project.payload.ProjectRequest;
import com.elkay.taskstream.project.payload.ProjectResponse;
import com.elkay.taskstream.project.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    @PostMapping
    public ResponseEntity<GenericResponse<ProjectResponse>> createProject(@Valid @RequestBody ProjectRequest projectRequest) {
        ProjectResponse project = projectService.createProject(projectRequest);
        return ResponseEntity.ok(new GenericResponse<>("Project created successfully", false, project));
    }

    /**
     * Get all projects of logged-in user
     */
    @GetMapping
    public ResponseEntity<GenericResponse<PaginatedProjectResponse>> getMyProjects(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        if (page < 1) {
            throw new BadRequestException("Page number must be at least 1");
        }
        if (size < 1 || size > 10) { // You can tweak max size as per your requirements
            throw new BadRequestException("Page size must be between 1 and 10");
        }
        Page<ProjectResponse> projectPage = projectService.getMyProjects(page, size);

        // Build response payload
        PaginatedProjectResponse listProjectResponse = new PaginatedProjectResponse();
        listProjectResponse.setProjects(projectPage.getContent());
        listProjectResponse.setCurrentPage(projectPage.getNumber() + 1);
        listProjectResponse.setTotalPages(projectPage.getTotalPages());
        listProjectResponse.setTotalItems(projectPage.getTotalElements());


        return ResponseEntity.ok(
                new GenericResponse<>("Projects fetched successfully", false, listProjectResponse)
        );
    }

    /**
     * Update a project by ID
     */
    @PutMapping("/{id}")
    public ResponseEntity<GenericResponse<ProjectResponse>> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest projectRequest
    ) {
        ProjectResponse project = projectService.updateProject(id, projectRequest);
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
