package com.elkay.taskstream.task.repository;

import com.elkay.taskstream.task.model.Task;
import com.elkay.taskstream.task.model.TaskState;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
    // Fetch all tasks for a project with pagination
    Page<Task> findByProjectId(Long projectId, Pageable pageable);

    // Fetch all tasks for a project with a specific state (new/in-progress/complete/backlog) with pagination
    Page<Task> findByProjectIdAndState(Long projectId, TaskState state, Pageable pageable);

    // Optional: fetch all tasks assigned to a user, paginated
    Page<Task> findByAssignedTo(Long userId, Pageable pageable);

    // Optional: fetch all tasks created by a user, paginated
    Page<Task> findByCreatedBy(Long userId, Pageable pageable);
}
