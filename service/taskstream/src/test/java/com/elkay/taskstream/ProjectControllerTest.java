package com.elkay.taskstream;

import com.elkay.taskstream.auth.payload.LoginRequest;
import com.elkay.taskstream.auth.payload.SignupRequest;
import com.elkay.taskstream.auth.repository.UserRepository;
import com.elkay.taskstream.project.payload.ProjectRequest;
import com.elkay.taskstream.project.repository.ProjectRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Set;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestInstance(TestInstance.Lifecycle.PER_CLASS) // Tells JUnit to create only one instance of the test
@ActiveProfiles("test")
@Sql(scripts = {"/data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_CLASS)
public class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static String jwtTokenAdmin;
    private static String jwtTokenUser;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    private static final String ADMIN_EMAIL = "john.doe@gmail.com";
    private static final String USER_EMAIL = "jane.doe@gmail.com";

    /**
     * mockMvc and objectMapper are no longer static. They’re autowired into the test class normally.
     * @BeforeAll is still static, but Spring allows us to inject beans into it by declaring parameters
     * */
    @BeforeAll
    void setUp(@Autowired MockMvc mockMvc,
                      @Autowired ObjectMapper objectMapper) {
        try {
            jwtTokenAdmin = getJwtToken(ADMIN_EMAIL);
            jwtTokenUser = getJwtToken(USER_EMAIL);
        } catch (Exception e) {
            System.out.println("Error setting up users");
        }
    }

    @BeforeEach
    void clearData() {
        projectRepository.deleteAll();
    }

    // ===================== CREATE PROJECT =====================

    @Test
    void createProject_Success() throws Exception {
        ProjectRequest request = new ProjectRequest();
        request.setTitle("My Project");
        request.setDescription("Description");
        request.setDueDate(LocalDateTime.now().plusDays(7).atZone(ZoneId.systemDefault())
                .toInstant());
        request.setTags(Set.of("tag1", "tag2"));

        mockMvc.perform(post("/api/v1/projects/create")
                        .header("Authorization", "Bearer " + jwtTokenAdmin)
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
        request.setDueDate(LocalDateTime.now().plusDays(5).atZone(ZoneId.systemDefault())
                .toInstant());
        request.setTags(Set.of("tag"));

        mockMvc.perform(post("/api/v1/projects/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createProject_ShouldFail_WhenCreatedByNonAdmin() throws Exception {
        ProjectRequest request = new ProjectRequest();
        request.setTitle("Project created by non admin");
        request.setDescription("Desc");
        request.setDueDate(LocalDateTime.now().plusDays(5).atZone(ZoneId.systemDefault())
                .toInstant());
        request.setTags(Set.of("tag"));

        mockMvc.perform(post("/api/v1/projects/create")
                        .header("Authorization", "Bearer " + jwtTokenUser)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("true"))
                .andExpect(jsonPath("$.message").value("User not authorized to perform this action"));
    }

    // ===================== GET PROJECTS =====================

    @Test
    void getMyProjects_Success_WithPagination() throws Exception {
        // Create a project first
        ProjectRequest request = new ProjectRequest();
        request.setTitle("Paginated Project");
        request.setDescription("Desc");
        request.setDueDate(LocalDateTime.now().plusDays(5).atZone(ZoneId.systemDefault())
                .toInstant());
        request.setTags(Set.of("tag1"));

        // create project(by admin)
        mockMvc.perform(post("/api/v1/projects/create")
                        .header("Authorization", "Bearer " + jwtTokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // get projects (for a normal user)
        mockMvc.perform(get("/api/v1/projects?page=1&size=5")
                        .header("Authorization", "Bearer " + jwtTokenUser))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.projects").isArray())
                .andExpect(jsonPath("$.data.currentPage", is(1)))
                .andExpect(jsonPath("$.data.totalPages").isNumber());
    }

    @Test
    void getMyProjects_ShouldFail_WhenInvalidPageSize() throws Exception {
        mockMvc.perform(get("/api/v1/projects?page=1&size=20")
                        .header("Authorization", "Bearer " + jwtTokenUser))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Page size must be between 1 and 10"))
                .andExpect(jsonPath("$.error").value(Boolean.TRUE));
    }

    @Test
    void getAllProjects_Success_WithPagination() throws Exception {
        // create a project by current user
        ProjectRequest request = new ProjectRequest();
        request.setTitle("Global Project");
        request.setDescription("Some description");
        request.setDueDate(LocalDateTime.now().plusDays(4).atZone(ZoneId.systemDefault())
                .toInstant());
        request.setTags(Set.of("tag1"));

        mockMvc.perform(post("/api/v1/projects/create")
                        .header("Authorization", "Bearer " + jwtTokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/projects/all?page=1&size=5")
                        .header("Authorization", "Bearer " + jwtTokenAdmin)) // can be jwtTokenUser too
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Projects fetched successfully"))
                .andExpect(jsonPath("$.error").value(Boolean.FALSE))
                .andExpect(jsonPath("$.data.projects").isArray())
                .andExpect(jsonPath("$.data.currentPage", is(1)))
                .andExpect(jsonPath("$.data.totalPages").isNumber())
                .andExpect(jsonPath("$.data.totalElements").isNumber())
                // assert isEditable flag for the first project
                .andExpect(jsonPath("$.data.projects[0].additionalParams.isEditable").value(true));
    }

    @Test
    void getAllProjects_ShouldFail_WhenInvalidPageSize() throws Exception {
        mockMvc.perform(get("/api/v1/projects/all?page=1&size=50")
                        .header("Authorization", "Bearer " + jwtTokenUser))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Page size must be between 1 and 10"))
                .andExpect(jsonPath("$.error").value(Boolean.TRUE));
    }

    @Test
    void searchProjects_Success_WithPagination() throws Exception {
        // create 2 projects by current user
        ProjectRequest reactProjectRequest = new ProjectRequest();
        reactProjectRequest.setTitle("React Project");
        reactProjectRequest.setDescription("React project description");
        reactProjectRequest.setDueDate(LocalDateTime.now().plusDays(4).atZone(ZoneId.systemDefault())
                .toInstant());
        reactProjectRequest.setTags(Set.of("React.js"));

        mockMvc.perform(post("/api/v1/projects/create")
                        .header("Authorization", "Bearer " + jwtTokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reactProjectRequest)))
                .andExpect(status().isOk());

        ProjectRequest javaProjectRequest = new ProjectRequest();
        javaProjectRequest.setTitle("Java Project");
        javaProjectRequest.setDescription("Java project description");
        javaProjectRequest.setDueDate(LocalDateTime.now().plusDays(4).atZone(ZoneId.systemDefault())
                .toInstant());
        javaProjectRequest.setTags(Set.of("Java"));

        mockMvc.perform(post("/api/v1/projects/create")
                        .header("Authorization", "Bearer " + jwtTokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(javaProjectRequest)))
                .andExpect(status().isOk());

        // default api request(without filters)
        mockMvc.perform(get("/api/v1/projects/search?page=1&size=1")
                        .header("Authorization", "Bearer " + jwtTokenAdmin)) // can be jwtTokenUser too
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Projects fetched successfully"))
                .andExpect(jsonPath("$.error").value(Boolean.FALSE))
                .andExpect(jsonPath("$.data.projects").isArray())
                .andExpect(jsonPath("$.data.currentPage", is(1)))
                .andExpect(jsonPath("$.data.totalPages").isNumber())
                .andExpect(jsonPath("$.data.totalPages", is(2)))
                .andExpect(jsonPath("$.data.totalElements").isNumber());

        // api request with search text
        mockMvc.perform(get("/api/v1/projects/search?searchText=react&page=1&size=1")
                        .header("Authorization", "Bearer " + jwtTokenAdmin)) // can be jwtTokenUser too
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Projects fetched successfully"))
                .andExpect(jsonPath("$.error").value(Boolean.FALSE))
                .andExpect(jsonPath("$.data.projects").isArray())
                .andExpect(jsonPath("$.data.currentPage", is(1)))
                .andExpect(jsonPath("$.data.totalPages").isNumber())
                .andExpect(jsonPath("$.data.totalPages", is(1)))
                .andExpect(jsonPath("$.data.totalElements").isNumber());
    }

    @Test
    void getProjectById_Success() throws Exception {
        ProjectRequest createRequest = new ProjectRequest();
        createRequest.setTitle("Get Project by id");
        createRequest.setDescription("Project description");
        createRequest.setDueDate(LocalDateTime.now().plusDays(3).withHour(0).withMinute(0).withSecond(0).withNano(0).atZone(ZoneId.systemDefault())
                .toInstant());
        createRequest.setTags(Set.of("tag1"));

        // create project
        String createResponse = mockMvc.perform(post("/api/v1/projects/create")
                        .header("Authorization", "Bearer " + jwtTokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        long projectId = objectMapper.readTree(createResponse).path("data").path("id").asLong();

        // format with seconds
        String expectedDueDate = createRequest.getDueDate().toString();

        mockMvc.perform(get("/api/v1/projects/" + projectId)
                        .header("Authorization", "Bearer " + jwtTokenUser))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Project fetched successfully"))
                .andExpect(jsonPath("$.data.id").value(projectId))
                .andExpect(jsonPath("$.data.title").value("Get Project by id"))
                .andExpect(jsonPath("$.data.description").value("Project description"))
                .andExpect(jsonPath("$.data.dueDate").value(expectedDueDate))
                .andExpect(jsonPath("$.data.tags").isArray())
                .andExpect(jsonPath("$.data.tags[0]").value("tag1"));
    }

    @Test
    void getProjectById_ShouldFail_WhenIdIsInvalid() throws Exception {
        long projectId = 234234;
        mockMvc.perform(get("/api/v1/projects/" + projectId)
                        .header("Authorization", "Bearer " + jwtTokenUser))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("true"))
                .andExpect(jsonPath("$.message").value("Project not found"));
    }


    // ===================== UPDATE PROJECT =====================

    @Test
    void updateProject_Success() throws Exception {
        ProjectRequest createRequest = new ProjectRequest();
        createRequest.setTitle("Old Title");
        createRequest.setDescription("Old Desc");
        createRequest.setDueDate(LocalDateTime.now().plusDays(3).atZone(ZoneId.systemDefault())
                .toInstant());
        createRequest.setTags(Set.of("tag1"));

        // create projects
        String createResponse = mockMvc.perform(post("/api/v1/projects/create")
                        .header("Authorization", "Bearer " + jwtTokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Long projectId = objectMapper.readTree(createResponse).path("data").path("id").asLong();

        ProjectRequest updateRequest = new ProjectRequest();
        updateRequest.setTitle("Updated Title");
        updateRequest.setDescription("Updated Desc");
        updateRequest.setDueDate(LocalDateTime.now().plusDays(10).atZone(ZoneId.systemDefault())
                .toInstant());
        updateRequest.setTags(Set.of("tag2", "tag3"));

        // update project
        mockMvc.perform(put("/api/v1/projects/" + projectId)
                        .header("Authorization", "Bearer " + jwtTokenAdmin)
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
        updateRequest.setDueDate(LocalDateTime.now().plusDays(2).atZone(ZoneId.systemDefault())
                .toInstant());
        updateRequest.setTags(Set.of("tag"));

        mockMvc.perform(put("/api/v1/projects/9999")
                        .header("Authorization", "Bearer " + jwtTokenAdmin)
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
        request.setDueDate(LocalDateTime.now().plusDays(5).atZone(ZoneId.systemDefault())
                .toInstant());
        request.setTags(Set.of("tag1"));

        // create project
        String response = mockMvc.perform(post("/api/v1/projects/create")
                        .header("Authorization", "Bearer " + jwtTokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn().getResponse().getContentAsString();

        // delete project
        Long projectId = objectMapper.readTree(response).path("data").path("id").asLong();

        mockMvc.perform(delete("/api/v1/projects/" + projectId)
                        .header("Authorization", "Bearer " + jwtTokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Project deleted successfully"))
                .andExpect(jsonPath("$.error").value(Boolean.FALSE));
    }

    @Test
    void deleteProject_ShouldFail_WhenNotFound() throws Exception {
        mockMvc.perform(delete("/api/v1/projects/9999")
                        .header("Authorization", "Bearer " + jwtTokenAdmin))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Project not found"))
                .andExpect(jsonPath("$.error").value(Boolean.TRUE));
    }

    private String getJwtToken(String email) throws Exception {
        // Signup admin user
        SignupRequest signupRequest = new SignupRequest("John Doe", email, "password123");
        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        // Login to get JWT token for admin user
        LoginRequest loginRequest = new LoginRequest(email, "password123");
        String response = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String jwtToken = objectMapper.readTree(response).path("data").path("token").asText();
        return jwtToken;
    }
}
