package com.elkay.taskstream.resource_upload.payload;

public class PresignedUrlRequest {
    private String fileName;
    private String contentType;
    private String resourceType; // "projects" or "tasks"
    private Long resourceId;

    public PresignedUrlRequest() {
    }

    public PresignedUrlRequest(String fileName, String contentType, String resourceType, Long resourceId) {
        this.fileName = fileName;
        this.contentType = contentType;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }
}
