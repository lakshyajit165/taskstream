package com.elkay.taskstream.project.service;

import com.elkay.taskstream.auth.jwt.JWTUtil;
import com.elkay.taskstream.exception.BadRequestException;
import com.elkay.taskstream.exception.ForbiddenException;
import com.elkay.taskstream.exception.ResourceNotFoundException;
import com.elkay.taskstream.exception.UnauthorizedException;
import com.elkay.taskstream.project.model.Project;
import com.elkay.taskstream.project.model.ProjectTag;
import com.elkay.taskstream.project.payload.ProjectRequest;
import com.elkay.taskstream.project.repository.ProjectRepository;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final JWTUtil jwtUtil;
    private final HttpServletRequest request;

    public ProjectService(ProjectRepository projectRepository, JWTUtil jwtUtil, HttpServletRequest request) {
        this.projectRepository = projectRepository;
        this.jwtUtil = jwtUtil;
        this.request = request;
    }

    private Long getCurrentUserId() {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing or invalid authorization header");
        }
        return jwtUtil.extractUserId(authHeader);
    }

    @Transactional
    public Project createProject(ProjectRequest projectRequest) {
        Long authorId = getCurrentUserId();

        Project project = new Project(
                projectRequest.getTitle(),
                projectRequest.getDescription(),
                projectRequest.getDueDate(),
                authorId
        );

        // Map tags
        Set<ProjectTag> tags = projectRequest.getTags().stream()
                .map(tagName -> {
                    ProjectTag tag = new ProjectTag(tagName);
                    tag.setProject(project);
                    return tag;
                })
                .collect(Collectors.toSet());

        project.setTags(tags);

        return projectRepository.save(project);
    }

    @Transactional(readOnly = true)
    public List<Project> getMyProjects() {
        Long authorId = getCurrentUserId();
        return projectRepository.findByAuthorId(authorId);
    }

    @Transactional
    public Project updateProject(Long projectId, ProjectRequest projectRequest) {
        Long authorId = getCurrentUserId();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!project.getAuthor().equals(authorId)) {
            throw new ForbiddenException("You are not allowed to update this project");
        }

        project.setTitle(projectRequest.getTitle());
        project.setDescription(projectRequest.getDescription());
        project.setDueDate(projectRequest.getDueDate());

        project.getTags().clear();
        Set<ProjectTag> newTags = projectRequest.getTags().stream()
                .map(ProjectTag::new)
                .collect(Collectors.toSet());
        project.setTags(newTags);

        return projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(Long projectId) {
        Long authorId = getCurrentUserId();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!project.getAuthor().equals(authorId)) {
            throw new ForbiddenException("You are not allowed to delete this project");
        }

        projectRepository.delete(project);
    }
}
