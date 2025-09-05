package com.elkay.taskstream.project.service;

import com.elkay.taskstream.auth.jwt.CustomUserDetails;
import com.elkay.taskstream.auth.jwt.JWTUtil;
import com.elkay.taskstream.exception.BadRequestException;
import com.elkay.taskstream.exception.ForbiddenException;
import com.elkay.taskstream.exception.ResourceNotFoundException;
import com.elkay.taskstream.exception.UnauthorizedException;
import com.elkay.taskstream.project.model.Project;
import com.elkay.taskstream.project.model.ProjectTag;
import com.elkay.taskstream.project.payload.ProjectRequest;
import com.elkay.taskstream.project.payload.ProjectResponse;
import com.elkay.taskstream.project.repository.ProjectRepository;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new UnauthorizedException("User not authenticated");
        }
        return userDetails.getUserId();
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest projectRequest) {
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

        Project saved = projectRepository.save(project);
        return mapToResponse(saved);
    }

//    @Transactional(readOnly = true)
//    public Page<ProjectResponse> getMyProjects(int page, int size) {
//        Long authorId = getCurrentUserId();
//        Pageable pageable = PageRequest.of(page, size);
//        return projectRepository.findByAuthorId(authorId, pageable);
//    }

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

    private ProjectResponse mapToResponse(Project project) {
        List<String> tags = project.getTags().stream()
                .map(ProjectTag::getName)
                .toList();

        return new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getDueDate(),
                project.getCreatedAt(),
                project.getUpdatedAt(),
                tags
        );
    }
}
