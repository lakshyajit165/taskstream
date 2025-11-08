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
import com.elkay.taskstream.project.utils.ProjectSpecifications;
import com.elkay.taskstream.task.repository.TaskRepository;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final JWTUtil jwtUtil;
    private final HttpServletRequest request;

    public ProjectService(ProjectRepository projectRepository, TaskRepository taskRepository, JWTUtil jwtUtil, HttpServletRequest request) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
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

        Project savedProject = projectRepository.save(project);
        return mapToResponse(savedProject, new HashMap<>());
    }

    @Transactional(readOnly = true)
    public Page<ProjectResponse> getMyProjects(int page, int size) {
        if (page < 1) {
            throw new BadRequestException("Page number must be at least 1");
        }
        if (size < 1 || size > 10) { // You can tweak max size as per your requirements
            throw new BadRequestException("Page size must be between 1 and 10");
        }
        Long authorId = getCurrentUserId();
        Pageable pageable = PageRequest.of(page - 1, size);
        return projectRepository.findByAuthorId(authorId, pageable).map(project -> mapToResponse(project, new HashMap<>()));
    }

    @Transactional(readOnly = true)
    public Page<ProjectResponse> getAllProjects(int page, int size) {
        if (page < 1) {
            throw new BadRequestException("Page number must be at least 1");
        }
        if (size < 1 || size > 10) { // You can tweak max size as per your requirements
            throw new BadRequestException("Page size must be between 1 and 10");
        }
        Long currentUserId = getCurrentUserId();
        Pageable pageable = PageRequest.of(page - 1, size);
        return projectRepository.findAll(pageable)
                .map(project -> {
                    HashMap<String, Object> additionalParams = new HashMap<>();
                    // editable only if the current user is the author
                    additionalParams.put("isEditable", project.getAuthor().equals(currentUserId));
                    return mapToResponse(project, additionalParams);
                });
    }

    @Transactional(readOnly = true)
    public Page<ProjectResponse> searchProjects(
            String searchText,
            Instant dueDateRangeStart,
            Instant dueDateRangeEnd,
            Instant createdAtRangeStart,
            Instant createdAtRangeEnd,
            List<String> tags,
            int page,
            int size
    ) {
        if (page < 1) {
            throw new BadRequestException("Page number must be at least 1");
        }
        if (size < 1 || size > 10) { // You can tweak max size as per your requirements
            throw new BadRequestException("Page size must be between 1 and 10");
        }
        Long currentUserId = getCurrentUserId();
        Pageable pageable = PageRequest.of(page - 1, size);
        Specification<Project> searchProjectSpecification = (root, query, cb) -> cb.conjunction();
        searchProjectSpecification = searchProjectSpecification
                .and(ProjectSpecifications.filter(searchText, dueDateRangeStart, dueDateRangeEnd, createdAtRangeStart, createdAtRangeEnd, tags));

        return projectRepository.findAll(searchProjectSpecification, pageable)
                .map(project -> {
                    HashMap<String, Object> additionalParams = new HashMap<>();
                    // editable only if the current user is the author
                    additionalParams.put("isEditable", project.getAuthor().equals(currentUserId));
                    return mapToResponse(project, additionalParams);
                });
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(long projectId) {
        Long authorId = getCurrentUserId();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        HashMap<String, Object> additionalParams = new HashMap<>();
        // denotes if the project is editable by the current user
        additionalParams.put("isEditable", project.getAuthor().equals(authorId));
        return mapToResponse(project, additionalParams);
    }

    @Transactional
    public ProjectResponse updateProject(Long projectId, ProjectRequest projectRequest) {
        Long authorId = getCurrentUserId();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!project.getAuthor().equals(authorId)) {
            throw new ForbiddenException("User not allowed to update this project");
        }

        project.setTitle(projectRequest.getTitle());
        project.setDescription(projectRequest.getDescription());
        project.setDueDate(projectRequest.getDueDate());

        // ✅ Clear existing tags but keep the same collection instance
        project.getTags().clear();

        // ✅ Add new tags via helper (keeps bidirectional mapping consistent)
        projectRequest.getTags().forEach(tagName -> {
            ProjectTag tag = new ProjectTag(tagName);
            project.addTag(tag);  // uses your addTag() method
        });

        Project updatedProject = projectRepository.save(project);
        return mapToResponse(updatedProject, new HashMap<>());
    }

    @Transactional
    public void deleteProject(Long projectId) {
        Long authorId = getCurrentUserId();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!project.getAuthor().equals(authorId)) {
            throw new ForbiddenException("User not allowed to delete this project");
        }
        // 1. Delete all dependent tasks first
        taskRepository.deleteAllByProjectId(projectId);
        projectRepository.delete(project);
    }

    private ProjectResponse mapToResponse(Project project, Map<String, ?> additionalParams) {
        List<String> tags = project.getTags().stream()
                .map(ProjectTag::getName)
                .toList();

        ProjectResponse projectResponse = new ProjectResponse();
        projectResponse.setId(project.getId());
        projectResponse.setTitle(project.getTitle());
        projectResponse.setDescription(project.getDescription());
        projectResponse.setDueDate(project.getDueDate());
        projectResponse.setCreatedAt(project.getCreatedAt());
        projectResponse.setUpdatedAt(project.getUpdatedAt());
        projectResponse.setTags(tags);
        if (additionalParams != null) {
            additionalParams.forEach(projectResponse::addParam);
        }
        return projectResponse;
    }
}
