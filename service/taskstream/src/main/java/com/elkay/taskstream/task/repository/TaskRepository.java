package com.elkay.taskstream.task.repository;

import com.elkay.taskstream.task.model.Task;
import com.elkay.taskstream.task.model.TaskState;
import com.elkay.taskstream.task.payload.TaskDetailsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
    // Fetch all tasks for a project with pagination
    Page<Task> findByProjectId(Long projectId, Pageable pageable);

    // Fetch all tasks for a project with a specific state (new/in-progress/complete/backlog) with pagination
    Page<Task> findByProjectIdAndState(Long projectId, TaskState state, Pageable pageable);

    // Optional: fetch all tasks assigned to a user, paginated
    Page<Task> findByAssignedTo(Long userId, Pageable pageable);

    // Optional: fetch all tasks created by a user, paginated
    Page<Task> findByCreatedBy(Long userId, Pageable pageable);

    @Query(value = """
        SELECT
            t.id, t.title, t.description, t.due_date, t.state, t.priority, t.type, t.created_at, t.updated_at,
            t.target_version, t.restricted_edit,
            p.id AS project_id, p.title AS project_name, p.due_date AS project_due_date,
            ua.id AS assigned_to_id, ua.name AS assigned_to_name,
            uc.id AS created_by_id, uc.name AS created_by_name,
            uu.id AS updated_by_id, uu.name AS updated_by_name
        FROM tasks t
        INNER JOIN projects p ON t.project_id = p.id
        INNER JOIN users ua ON t.assigned_to = ua.id
        LEFT JOIN users uc ON t.created_by = uc.id
        LEFT JOIN users uu ON t.updated_by = uu.id
        WHERE t.id = :taskId
    """,
            nativeQuery = true)
    Optional<TaskDetailsResponse> findTaskDetailsById(@Param("taskId") Long taskId);
}
