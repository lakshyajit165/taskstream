package com.elkay.taskstream.auth.jwt;

import com.elkay.taskstream.payload.GenericResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Handles unauthenticated requests to protected endpoints.
 *
 * In Spring Security, if a user tries to access a secured resource without providing valid
 * authentication (e.g., missing or invalid JWT), the security filter chain triggers an
 * AuthenticationException. This class intercepts that exception and returns a
 * consistent JSON response instead of the default HTML error page.
 *
 * Note:
 * - This is required in addition to the global exception handler because exceptions
 *   thrown by Spring Security filters occur before reaching controller methods.
 * - Ensures the client always receives a structured GenericResponse for 401 errors.
 */

@Component
public class JWTAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        GenericResponse<Void> body = new GenericResponse<>("Unauthorized: " + authException.getMessage(), true);
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }

}
