package com.elkay.taskstream.resource_upload.payload;

public class PresignedUrlRequest {
    private String fileName;
    private String contentType;
    private String resourceType; // "projects" or "tasks"

    public PresignedUrlRequest() {
    }

    public PresignedUrlRequest(String fileName, String contentType, String resourceType) {
        this.fileName = fileName;
        this.contentType = contentType;
        this.resourceType = resourceType;
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

}
