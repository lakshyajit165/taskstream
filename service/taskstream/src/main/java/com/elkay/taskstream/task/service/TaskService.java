package com.elkay.taskstream.task.service;

import com.elkay.taskstream.auth.jwt.CustomUserDetails;
import com.elkay.taskstream.auth.model.User;
import com.elkay.taskstream.auth.repository.UserRepository;
import com.elkay.taskstream.exception.BadRequestException;
import com.elkay.taskstream.exception.ForbiddenException;
import com.elkay.taskstream.exception.ResourceNotFoundException;
import com.elkay.taskstream.project.model.Project;
import com.elkay.taskstream.project.repository.ProjectRepository;
import com.elkay.taskstream.task.model.Task;
import com.elkay.taskstream.task.payload.TaskRequest;
import com.elkay.taskstream.task.repository.TaskRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new RuntimeException("User not authenticated");
        }
        return userDetails.getUserId();
    }

    @Transactional
    public Task createTask(TaskRequest taskRequest) {
        Long projectId = taskRequest.getProjectId();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project with id " + projectId + " not found"));

        if (taskRequest.getDueDate() != null && taskRequest.getDueDate().isAfter(project.getDueDate())) {
            throw new BadRequestException("Task due date cannot be after the project's due date");
        }

        User assignedUser = userRepository.findById(taskRequest.getAssignedTo())
                .orElseThrow(() -> new ResourceNotFoundException("User to be assigned not found"));

        Task task = new Task();
        task.setTitle(taskRequest.getTitle());
        task.setDescription(taskRequest.getDescription());
        task.setDueDate(taskRequest.getDueDate());
        task.setState(taskRequest.getState());
        task.setPriority(taskRequest.getPriority());
        task.setType(taskRequest.getType());
        task.setProjectId(projectId);
        task.setCreatedBy(getCurrentUserId());
        task.setUpdatedBy(getCurrentUserId());
        task.setAssignedTo(assignedUser.getId());
        task.setTargetVersion(taskRequest.getTargetVersion());
        task.setRestrictedEdit(taskRequest.getRestrictedEdit());
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }

    @Transactional(readOnly = true)
    public Page<Task> getTasksByProject(Long projectId, int page, int size) {
        if (page < 1) {
            throw new BadRequestException("Page number must be at least 1");
        }
        if (size < 1 || size > 100) { // You can tweak max size as per your requirements
            throw new BadRequestException("Page size must be between 1 and 100");
        }
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project with id " + projectId + " not found"));

        PageRequest pageable = PageRequest.of(page - 1, size);
        return taskRepository.findByProjectId(projectId, pageable);
    }

    @Transactional(readOnly = true)
    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    }

    @Transactional
    public Task updateTask(Long taskId, TaskRequest request) {
        Task task = getTaskById(taskId);
        Long currentUserId = getCurrentUserId();

        if (Boolean.TRUE.equals(task.getRestrictedEdit()) && !currentUserId.equals(task.getAssignedTo())) {
            throw new ForbiddenException("You are not allowed to edit this task");
        }

        Project project = projectRepository.findById(task.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (request.getDueDate() != null && request.getDueDate().isAfter(project.getDueDate())) {
            throw new BadRequestException("Task dueDate cannot be after the project's dueDate");
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());
        task.setState(request.getState());
        task.setPriority(request.getPriority());
        task.setType(request.getType());
        task.setAssignedTo(request.getAssignedTo());
        task.setUpdatedBy(currentUserId);
        task.setTargetVersion(request.getTargetVersion());
        task.setRestrictedEdit(request.getRestrictedEdit());
        task.setUpdatedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }

    @Transactional
    public void deleteTask(Long taskId) {
        Task task = getTaskById(taskId);
        Long currentUserId = getCurrentUserId();

        if (Boolean.TRUE.equals(task.getRestrictedEdit()) && !currentUserId.equals(task.getAssignedTo())) {
            throw new ForbiddenException("You are not allowed to delete this task");
        }

        taskRepository.delete(task);
    }
}
