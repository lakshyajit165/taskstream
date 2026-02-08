package com.elkay.taskstream.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class S3PresignFailedException extends RuntimeException {
    public S3PresignFailedException(String message, Throwable cause) {
        super(message, cause);
    }
}
