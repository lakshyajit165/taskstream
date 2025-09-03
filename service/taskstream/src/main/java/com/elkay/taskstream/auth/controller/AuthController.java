package com.elkay.taskstream.auth.controller;

import com.elkay.taskstream.auth.payload.LoginRequest;
import com.elkay.taskstream.auth.payload.SignupRequest;
import com.elkay.taskstream.auth.service.AuthService;
import com.elkay.taskstream.payload.GenericResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Login endpoint
     */
    @PostMapping("/login")
    public ResponseEntity<GenericResponse<HashMap<String, String>>> login(@Valid @RequestBody LoginRequest loginRequest) {
        String token = authService.login(loginRequest);
        HashMap<String, String> response = new HashMap<>();
        response.put("token", token);
        return ResponseEntity.ok(new GenericResponse<>("Login successful", false, response));
    }

    /**
     * Signup endpoint
     */
    @PostMapping("/signup")
    public ResponseEntity<GenericResponse<String>> signup(@Valid @RequestBody SignupRequest signupRequest) {
        String message = authService.signup(signupRequest);
        return ResponseEntity.ok(new GenericResponse<>(message, false));
    }
}
