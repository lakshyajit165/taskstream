package com.elkay.taskstream.exception;

import com.elkay.taskstream.payload.GenericResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<GenericResponse<Void>> handleBadRequestException(BadRequestException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new GenericResponse<>(ex.getMessage(), true));
    }

    @ExceptionHandler(ResourceAlreadyExistsException.class)
    public ResponseEntity<GenericResponse<Void>> handleResourceAlreadyExistsException(ResourceAlreadyExistsException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new GenericResponse<>(ex.getMessage(), true));
    }

    @ExceptionHandler(InternalServerError.class)
    public ResponseEntity<GenericResponse<Void>> handleInternalServerError(InternalServerError ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new GenericResponse<>(ex.getMessage(), true));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<GenericResponse<Void>> handleResourceNotFoundException(ResourceNotFoundException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new GenericResponse<>(ex.getMessage(), true));
    }

    // to handle all other exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<GenericResponse<Void>> handleAllExceptions(Exception ex, HttpServletRequest request) {
        ex.printStackTrace(); // optional logging
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new GenericResponse<>("An unexpected error occurred", true));
    }


}
