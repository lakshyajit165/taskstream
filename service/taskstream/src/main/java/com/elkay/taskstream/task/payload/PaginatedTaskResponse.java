package com.elkay.taskstream.task.payload;

import com.elkay.taskstream.project.payload.ProjectResponse;
import com.elkay.taskstream.task.model.Task;

import java.util.List;

public class PaginatedTaskResponse {
    private List<Task> tasks;
    private int currentPage;
    private int totalPages;
    private long totalElements;

    public PaginatedTaskResponse() {
    }

    public PaginatedTaskResponse(List<Task> tasks, int currentPage, int totalPages, long totalElements) {
        this.tasks = tasks;
        this.currentPage = currentPage;
        this.totalPages = totalPages;
        this.totalElements = totalElements;
    }

    public List<Task> getTasks() {
        return tasks;
    }

    public void setTasks(List<Task> tasks) {
        this.tasks = tasks;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }
}
