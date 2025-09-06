package com.elkay.taskstream;

import com.elkay.taskstream.auth.payload.LoginRequest;
import com.elkay.taskstream.auth.payload.SignupRequest;
import com.elkay.taskstream.auth.repository.UserRepository;
import com.elkay.taskstream.project.payload.ProjectRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Set;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private String jwtToken;

    @BeforeEach
    void setUp() throws Exception {
        userRepository.deleteAll();

        // Signup user
        SignupRequest signupRequest = new SignupRequest("John Doe", "john@example.com", "password123");
        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        // Login to get JWT token
        LoginRequest loginRequest = new LoginRequest("john@example.com", "password123");
        String response = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        jwtToken = objectMapper.readTree(response).path("data").path("token").asText();
    }

    // ===================== CREATE PROJECT =====================

    @Test
    void createProject_Success() throws Exception {
        ProjectRequest request = new ProjectRequest();
        request.setTitle("My Project");
        request.setDescription("Description");
        request.setDueDate(LocalDateTime.now().plusDays(7));
        request.setTags(Set.of("tag1", "tag2"));

        mockMvc.perform(post("/api/v1/projects/create")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Project created successfully"))
                .andExpect(jsonPath("$.error").value(Boolean.FALSE))
                .andExpect(jsonPath("$.data.id").exists());
    }

    @Test
    void createProject_ShouldFail_WhenNoJwt() throws Exception {
        ProjectRequest request = new ProjectRequest();
        request.setTitle("Project Without JWT");
        request.setDescription("Desc");
        request.setDueDate(LocalDateTime.now().plusDays(5));
        request.setTags(Set.of("tag"));

        mockMvc.perform(post("/api/v1/projects/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    // ===================== GET PROJECTS =====================

    @Test
    void getMyProjects_Success_WithPagination() throws Exception {
        // Create a project first
        ProjectRequest request = new ProjectRequest();
        request.setTitle("Paginated Project");
        request.setDescription("Desc");
        request.setDueDate(LocalDateTime.now().plusDays(5));
        request.setTags(Set.of("tag1"));

        // create project
        mockMvc.perform(post("/api/v1/projects/create")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // get projects
        mockMvc.perform(get("/api/v1/projects?page=1&size=5")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.projects").isArray())
                .andExpect(jsonPath("$.data.currentPage", is(1)))
                .andExpect(jsonPath("$.data.totalPages").isNumber());
    }

    @Test
    void getMyProjects_ShouldFail_WhenInvalidPageSize() throws Exception {
        mockMvc.perform(get("/api/v1/projects?page=1&size=20")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Page size must be between 1 and 10"))
                .andExpect(jsonPath("$.error").value(Boolean.TRUE));
    }

    // ===================== UPDATE PROJECT =====================

    @Test
    void updateProject_Success() throws Exception {
        ProjectRequest createRequest = new ProjectRequest();
        createRequest.setTitle("Old Title");
        createRequest.setDescription("Old Desc");
        createRequest.setDueDate(LocalDateTime.now().plusDays(3));
        createRequest.setTags(Set.of("tag1"));

        // create projects
        String createResponse = mockMvc.perform(post("/api/v1/projects/create")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Long projectId = objectMapper.readTree(createResponse).path("data").path("id").asLong();

        ProjectRequest updateRequest = new ProjectRequest();
        updateRequest.setTitle("Updated Title");
        updateRequest.setDescription("Updated Desc");
        updateRequest.setDueDate(LocalDateTime.now().plusDays(10));
        updateRequest.setTags(Set.of("tag2", "tag3"));

        // update project
        mockMvc.perform(put("/api/v1/projects/" + projectId)
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Project updated successfully"))
                .andExpect(jsonPath("$.data.title").value("Updated Title"));
    }

    @Test
    void updateProject_ShouldFail_WhenProjectNotFound() throws Exception {
        ProjectRequest updateRequest = new ProjectRequest();
        updateRequest.setTitle("Title");
        updateRequest.setDescription("Desc");
        updateRequest.setDueDate(LocalDateTime.now().plusDays(2));
        updateRequest.setTags(Set.of("tag"));

        mockMvc.perform(put("/api/v1/projects/9999")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Project not found"))
                .andExpect(jsonPath("$.error").value(Boolean.TRUE));
    }

    // ===================== DELETE PROJECT =====================

    @Test
    void deleteProject_Success() throws Exception {
        ProjectRequest request = new ProjectRequest();
        request.setTitle("Delete Project");
        request.setDescription("Desc");
        request.setDueDate(LocalDateTime.now().plusDays(5));
        request.setTags(Set.of("tag1"));

        // create project
        String response = mockMvc.perform(post("/api/v1/projects/create")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn().getResponse().getContentAsString();

        // delete project
        Long projectId = objectMapper.readTree(response).path("data").path("id").asLong();

        mockMvc.perform(delete("/api/v1/projects/" + projectId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Project deleted successfully"))
                .andExpect(jsonPath("$.error").value(Boolean.FALSE));
    }

    @Test
    void deleteProject_ShouldFail_WhenNotFound() throws Exception {
        mockMvc.perform(delete("/api/v1/projects/9999")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Project not found"))
                .andExpect(jsonPath("$.error").value(Boolean.TRUE));
    }
}
