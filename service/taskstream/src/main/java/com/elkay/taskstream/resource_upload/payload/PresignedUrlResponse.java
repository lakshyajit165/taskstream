package com.elkay.taskstream.resource_upload.payload;

public class PresignedUrlResponse {

    private String uploadUrl;
    private String fileUrl;

    public PresignedUrlResponse() {
    }

    public PresignedUrlResponse(String uploadUrl, String fileUrl) {
        this.uploadUrl = uploadUrl;
        this.fileUrl = fileUrl;
    }

    public String getUploadUrl() {
        return uploadUrl;
    }

    public void setUploadUrl(String uploadUrl) {
        this.uploadUrl = uploadUrl;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }
}
