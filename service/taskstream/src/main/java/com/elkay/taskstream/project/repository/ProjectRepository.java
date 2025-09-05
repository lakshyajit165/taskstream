package com.elkay.taskstream.project.repository;

import com.elkay.taskstream.project.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByAuthorId(Long authorId);
}
