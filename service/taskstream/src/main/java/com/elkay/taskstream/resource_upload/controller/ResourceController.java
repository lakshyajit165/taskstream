package com.elkay.taskstream.resource_upload.controller;

import com.elkay.taskstream.auth.controller.AuthController;
import com.elkay.taskstream.resource_upload.payload.PresignedUrlRequest;
import com.elkay.taskstream.resource_upload.payload.PresignedUrlResponse;
import com.elkay.taskstream.resource_upload.service.ResourceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/resource/upload")
public class ResourceController {

    private static final Logger logger = LoggerFactory.getLogger(ResourceController.class);
    private ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    /**
     * Endpoint to generate a pre-signed S3 upload URL.
     * Client will use the returned uploadUrl to PUT the file directly to S3.
     * fileUrl is the permanent public URL that should be saved in markdown.
     */
    @PostMapping("/get_presigned_url")
    public PresignedUrlResponse getPresignedUrl(@RequestBody PresignedUrlRequest request) {

        logger.info("Generating presigned upload URL for resourceType={}",
                request.getResourceType());

        return resourceService.generateUploadUrl(
                request.getFileName(),
                request.getContentType(),
                request.getResourceType()
        );
    }
}
