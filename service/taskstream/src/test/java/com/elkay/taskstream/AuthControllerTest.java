package com.elkay.taskstream;

import com.elkay.taskstream.auth.payload.LoginRequest;
import com.elkay.taskstream.auth.payload.SignupRequest;
import com.elkay.taskstream.auth.repository.RoleRepository;
import com.elkay.taskstream.auth.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        // Clean database before each test
        userRepository.deleteAll();
    }

    // ===================== SIGNUP TESTS =====================

    @Test
    void testSignup_Success() throws Exception {
        SignupRequest signupRequest = new SignupRequest("John Doe", "john@example.com", "password123");

        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User registered successfully"))
                .andExpect(jsonPath("$.error").value(Boolean.FALSE))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    void testSignup_Failure_UserAlreadyExists() throws Exception {
        SignupRequest signupRequest = new SignupRequest("John Doe", "john@example.com", "password123");

        // First signup succeeds
        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        // Second signup with same email should fail
        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("User with email already exists"))
                .andExpect(jsonPath("$.error").value(Boolean.TRUE));
    }

    // ===================== LOGIN TESTS =====================

    @Test
    void testLogin_Success() throws Exception {
        // Signup first
        SignupRequest signupRequest = new SignupRequest("John Doe", "john@example.com", "password123");
        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        LoginRequest loginRequest = new LoginRequest("john@example.com", "password123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.error").value(Boolean.FALSE))
                .andExpect(jsonPath("$.data.token").exists());
    }

    @Test
    void testLogin_Failure_WrongPassword() throws Exception {
        // Signup first
        SignupRequest signupRequest = new SignupRequest("John Doe", "john@example.com", "password123");
        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        LoginRequest loginRequest = new LoginRequest("john@example.com", "wrongpassword");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Password doesn't match"))
                .andExpect(jsonPath("$.error").value(Boolean.TRUE));
    }

    @Test
    void testLogin_Failure_UserNotFound() throws Exception {
        LoginRequest loginRequest = new LoginRequest("nonexistent@example.com", "password123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("User email is invalid"))
                .andExpect(jsonPath("$.error").value(Boolean.TRUE));
    }
}
