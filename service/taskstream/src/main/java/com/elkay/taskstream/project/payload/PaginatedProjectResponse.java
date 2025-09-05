package com.elkay.taskstream.project.payload;

import java.util.List;

public class PaginatedProjectResponse {

    private List<ProjectResponse> projects;
    private int currentPage;
    private int totalPages;
    private long totalItems;

    public PaginatedProjectResponse() {
    }

    public PaginatedProjectResponse(List<ProjectResponse> projects, int currentPage, int totalPages, long totalItems) {
        this.projects = projects;
        this.currentPage = currentPage;
        this.totalPages = totalPages;
        this.totalItems = totalItems;
    }

    public List<ProjectResponse> getProjects() {
        return projects;
    }

    public void setProjects(List<ProjectResponse> projects) {
        this.projects = projects;
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

    public long getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(long totalItems) {
        this.totalItems = totalItems;
    }
}
