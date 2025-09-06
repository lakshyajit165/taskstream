package com.elkay.taskstream.task.controller;

import com.elkay.taskstream.payload.GenericResponse;
import com.elkay.taskstream.task.model.Task;
import com.elkay.taskstream.task.payload.PaginatedTaskResponse;
import com.elkay.taskstream.task.payload.TaskRequest;
import com.elkay.taskstream.task.service.TaskService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping("/create")
    public ResponseEntity<GenericResponse<Task>> createTask(@RequestBody TaskRequest taskRequest) {
        Task task = taskService.createTask(taskRequest);
        return ResponseEntity.ok(new GenericResponse<>("Task created successfully", false, task));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GenericResponse<Task>> getTask(@PathVariable Long id) {
        Task task = taskService.getTaskById(id);
        return ResponseEntity.ok(new GenericResponse<>("Task fetched successfully", false, task));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<GenericResponse<PaginatedTaskResponse>> getTasksByProject(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<Task> tasks = taskService.getTasksByProject(projectId, page, size);

        // Build response payload
        PaginatedTaskResponse paginatedTaskResponse = new PaginatedTaskResponse();
        paginatedTaskResponse.setTasks(tasks.getContent());
        paginatedTaskResponse.setCurrentPage(tasks.getNumber() + 1);
        paginatedTaskResponse.setTotalPages(tasks.getTotalPages());
        paginatedTaskResponse.setTotalElements(tasks.getTotalElements());
        return ResponseEntity.ok(new GenericResponse<>("Tasks fetched successfully", false, paginatedTaskResponse));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GenericResponse<Task>> updateTask(
            @PathVariable Long id,
            @RequestBody TaskRequest request
    ) {
        Task task = taskService.updateTask(id, request);
        return ResponseEntity.ok(new GenericResponse<>("Task updated successfully", false, task));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<GenericResponse<Void>> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(new GenericResponse<>("Task deleted successfully", false));
    }
}
