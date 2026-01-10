package com.elkay.taskstream.auth.controller;

import com.elkay.taskstream.auth.payload.InitiateResetPasswordRequest;
import com.elkay.taskstream.auth.payload.LoginRequest;
import com.elkay.taskstream.auth.payload.ResetPasswordRequest;
import com.elkay.taskstream.auth.payload.SignupRequest;
import com.elkay.taskstream.auth.service.AuthService;
import com.elkay.taskstream.mail.EmailService;
import com.elkay.taskstream.payload.GenericResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final EmailService emailService;

    public AuthController(AuthService authService, EmailService emailService) {
        this.authService = authService;
        this.emailService = emailService;
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

    @PostMapping("/send_verification_code")
    public ResponseEntity<GenericResponse<String>> sendVerificationCode(@Valid @RequestBody InitiateResetPasswordRequest initiateResetPasswordRequest) {
        logger.info("Received request to send verification code to: {}", initiateResetPasswordRequest.getEmail());
        String message = authService.sendVerificationCode(initiateResetPasswordRequest);
        return ResponseEntity.ok(new GenericResponse<>(message, false));
    }

    @PostMapping("/reset_password")
    public ResponseEntity<GenericResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
        String message = authService.resetPassword(resetPasswordRequest);
        return ResponseEntity.ok(new GenericResponse<>(message, false));
    }
}
