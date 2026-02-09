package com.elkay.taskstream.resource_upload.service;

import com.elkay.taskstream.exception.InvalidUploadRequestException;
import com.elkay.taskstream.exception.S3PresignFailedException;
import com.elkay.taskstream.resource_upload.payload.PresignedUrlResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.Set;
import java.util.UUID;

@Service
public class ResourceService {

    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${aws.region}")
    private String region;

    public ResourceService(S3Presigner s3Presigner) {
        this.s3Presigner = s3Presigner;
    }

    // Allowed resource types for safety
    private static final Set<String> ALLOWED_RESOURCE_TYPES = Set.of("projects", "tasks");

    public PresignedUrlResponse generateUploadUrl(
            String fileName,
            String contentType,
            String resourceType,
            Long resourceId
    ) {

        // ------------------------------------------------------------
        // STEP 1: Validate request inputs
        // ------------------------------------------------------------
        if (fileName == null || fileName.isBlank()) {
            throw new InvalidUploadRequestException("File name must be provided");
        }

        if (contentType == null || contentType.isBlank()) {
            throw new InvalidUploadRequestException("Content type must be provided");
        }

        if (resourceId == null) {
            throw new InvalidUploadRequestException("Resource ID must be provided");
        }

        if (!ALLOWED_RESOURCE_TYPES.contains(resourceType)) {
            throw new InvalidUploadRequestException("Invalid resource type: " + resourceType);
        }

        if (!fileName.contains(".")) {
            throw new InvalidUploadRequestException("File must have a valid extension");
        }

        try {
            // ------------------------------------------------------------
            // STEP 2: Extract extension safely
            // ------------------------------------------------------------
            String extension = fileName.substring(fileName.lastIndexOf("."));

            // ------------------------------------------------------------
            // STEP 3: Generate unique image ID
            // ------------------------------------------------------------
            String imageId = UUID.randomUUID().toString();

            // ------------------------------------------------------------
            // STEP 4: Construct S3 object key (path inside bucket)
            // ------------------------------------------------------------
            String key = String.format(
                    "taskstream-resources/uploads/%s/%d/%s%s",
                    resourceType,
                    resourceId,
                    imageId,
                    extension
            );

            // ------------------------------------------------------------
            // STEP 5: Build PUT object request for S3
            // ------------------------------------------------------------
            PutObjectRequest objectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(contentType)
                    .build();

            // ------------------------------------------------------------
            // STEP 6: Create presign request (temporary upload permission)
            // ------------------------------------------------------------
            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(10))
                    .putObjectRequest(objectRequest)
                    .build();

            // ------------------------------------------------------------
            // STEP 7: Generate signed upload URL
            // ------------------------------------------------------------
            PresignedPutObjectRequest presignedRequest =
                    s3Presigner.presignPutObject(presignRequest);

            // ------------------------------------------------------------
            // STEP 8: Construct permanent file URL
            // ------------------------------------------------------------
            String fileUrl = String.format(
                    "https://%s.s3.%s.amazonaws.com/%s",
                    bucketName,
                    region,
                    key
            );

            return new PresignedUrlResponse(
                    presignedRequest.url().toString(),
                    fileUrl
            );

        } catch (SdkException e) {
            // AWS SDK specific failure (credentials, region, signing issues, etc.)
            throw new S3PresignFailedException("Failed to generate S3 presigned URL", e);
        } catch (Exception e) {
            // Catch-all safety
            throw new S3PresignFailedException("Unexpected error while generating upload URL", e);
        }
    }
}