package com.elkay.taskstream.auth.jwt;

import com.elkay.taskstream.payload.GenericResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Handles forbidden access attempts by authenticated users.
 *
 * When a user is authenticated but does not have sufficient permissions to access
 * a resource, Spring Security throws an AccessDeniedException. This handler catches
 * that exception and returns a JSON response in a consistent format.
 *
 * Note:
 * - This is needed alongside the global exception handler because access control
 *   exceptions are thrown by the security layer before reaching controllers.
 * - Provides clients with a structured GenericResponse for 403 Forbidden errors.
 */

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException, ServletException {
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        GenericResponse<Void> body = new GenericResponse<>("Forbidden: " + accessDeniedException.getMessage(), true);
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}