package com.elkay.taskstream;

import com.elkay.taskstream.auth.payload.LoginRequest;
import com.elkay.taskstream.auth.payload.SignupRequest;
import com.elkay.taskstream.auth.repository.UserRepository;
import com.elkay.taskstream.project.payload.ProjectRequest;
import com.elkay.taskstream.project.repository.ProjectRepository;
import com.elkay.taskstream.task.model.TaskPriority;
import com.elkay.taskstream.task.model.TaskState;
import com.elkay.taskstream.task.model.TaskType;
import com.elkay.taskstream.task.payload.TaskRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Set;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Testcontainers
@SpringBootTest
@AutoConfigureMockMvc
@TestInstance(TestInstance.Lifecycle.PER_CLASS) // Tells JUnit to create only one instance of the test
public class TaskControllerTest {

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

    private Long projectId = 0L;


    // will be started before and stopped after each test method
    @Container
    private static PostgreSQLContainer postgresqlContainer = (PostgreSQLContainer) new PostgreSQLContainer("postgres:9.6.12")
            .withDatabaseName("taskstreamdb")
            .withUsername("postgres")
            .withPassword("postgres123")
            .withStartupTimeout(Duration.ofMinutes(2));

    static {
        postgresqlContainer.start();
    }

    @DynamicPropertySource
    static void setDatabaseProperties(DynamicPropertyRegistry registry) {
        // 1. Database Connection (Standard)
        registry.add("spring.datasource.url", postgresqlContainer::getJdbcUrl);
        registry.add("spring.datasource.username", postgresqlContainer::getUsername);
        registry.add("spring.datasource.password", postgresqlContainer::getPassword);
        registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.PostgreSQLDialect");

        // 2. CRITICAL: Disable Hibernate DDL interference
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "none");

        // 3. CRITICAL: Configure Flyway for testing
        registry.add("spring.flyway.enabled", () -> "true"); // Ensure Flyway is active

        // Optional: Point to the location of your migration scripts
        registry.add("spring.flyway.locations", () -> "classpath:db/migration");
    }


    /**
     * mockMvc and objectMapper are no longer static. They’re autowired into the test class normally.
     * @BeforeAll is still static, but Spring allows us to inject beans into it by declaring parameters
     * and the @TestInstance(TestInstance.Lifecycle.PER_CLASS) annotation
     * */
    @BeforeAll
    void setUp(@Autowired MockMvc mockMvc,
               @Autowired ObjectMapper objectMapper) {
        try {
            // These static fields are now guaranteed to be populated
            // before createTask_Success(), etc., run.
            jwtTokenAdmin = getJwtToken(ADMIN_EMAIL);
            jwtTokenUser = getJwtToken(USER_EMAIL);
            projectId = createProjectAndGetId();
        } catch (Exception e) {
            // CRITICAL: Throw a RuntimeException to fail the entire test class
            // if setup fails, preventing NullPointerExceptions later.
            throw new RuntimeException("Initial test setup failed.", e);
        }
    }

    @Test
    void test() {
        assertThat(postgresqlContainer.isRunning()).isTrue();
        assertThat(postgresqlContainer.isRunning()).isTrue();

    }

    @Test
    void createTask_Success() throws Exception {
        TaskRequest request = createTaskRequest(projectId, 1L, "New Task", "Desc", TaskState.NEW, TaskPriority.HIGH, TaskType.FEATURE);

        mockMvc.perform(post("/api/v1/tasks/create")
                        .header("Authorization", "Bearer " + jwtTokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Task created successfully"))
                .andExpect(jsonPath("$.error").value(Boolean.FALSE))
                .andExpect(jsonPath("$.data.id").exists());
    }

    @Test
    void createTask_Failure_Invalid_JWT() throws Exception {
        TaskRequest request = createTaskRequest(projectId, 1L, "New Task", "Desc", TaskState.NEW, TaskPriority.HIGH, TaskType.FEATURE);

        mockMvc.perform(post("/api/v1/tasks/create")
                        .header("Authorization", "Bearer " + "jwtTokenAdmin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Unauthorized: Full authentication is required to access this resource"))
                .andExpect(jsonPath("$.error").value(Boolean.TRUE));
    }

    @Test
    void getTaskById_Success() throws Exception {
        TaskRequest request = createTaskRequest(projectId, 1L, "New Task", "Desc", TaskState.NEW, TaskPriority.HIGH, TaskType.FEATURE);

        String createTaskResponse = mockMvc.perform(post("/api/v1/tasks/create")
                        .header("Authorization", "Bearer " + jwtTokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn().getResponse().getContentAsString();
        Long taskId = objectMapper.readTree(createTaskResponse).path("data").path("id").asLong();

        mockMvc.perform(get("/api/v1/tasks/" + taskId)
                        .header("Authorization", "Bearer " + jwtTokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Task fetched successfully"))
                .andExpect(jsonPath("$.data.id").value(taskId));
    }

    @Test
    void createTask_Failure_Invalid_AssignedTo() throws Exception {
        TaskRequest request = createTaskRequest(projectId, 0L, "Task title", "Task description", TaskState.NEW, TaskPriority.HIGH, TaskType.FEATURE);

        mockMvc.perform(post("/api/v1/tasks/create")
                        .header("Authorization", "Bearer " + jwtTokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("User to be assigned not found"))
                .andExpect(jsonPath("$.error").value(Boolean.TRUE));
    }

    @Test
    void updateTask_Success() throws Exception {
        TaskRequest request = createTaskRequest(projectId, 1L, "New Task", "Desc", TaskState.NEW, TaskPriority.HIGH, TaskType.FEATURE);

        String createTaskResponse = mockMvc.perform(post("/api/v1/tasks/create")
                        .header("Authorization", "Bearer " + jwtTokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Long taskId = objectMapper.readTree(createTaskResponse).path("data").path("id").asLong();

        request.setTitle("New Task updated");
        request.setDescription("Desc updated");

        mockMvc.perform(put("/api/v1/tasks/" + taskId)
                        .header("Authorization", "Bearer " + jwtTokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Task updated successfully"))
                .andExpect(jsonPath("$.error").value(Boolean.FALSE))
                .andExpect(jsonPath("$.data.id").exists())
                .andExpect(jsonPath("$.data.title").value("New Task updated"))
                .andExpect(jsonPath("$.data.description").value("Desc updated"));

    }

    @Test
    void updateTask_Failure_InValid_JWT() throws Exception {
        TaskRequest request = createTaskRequest(projectId, 1L, "New Task", "Desc", TaskState.NEW, TaskPriority.HIGH, TaskType.FEATURE);

        String createTaskResponse = mockMvc.perform(post("/api/v1/tasks/create")
                        .header("Authorization", "Bearer " + jwtTokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Long taskId = objectMapper.readTree(createTaskResponse).path("data").path("id").asLong();

        request.setTitle("New Task updated");
        request.setDescription("Desc updated");

        mockMvc.perform(put("/api/v1/tasks/" + taskId)
                        .header("Authorization", "Bearer " + "jwtTokenAdmin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Unauthorized: Full authentication is required to access this resource"));
    }

    @Test
    void updateTask_Failure_Invalid_TaskId() throws Exception {
        TaskRequest request = createTaskRequest(projectId, 1L, "New Task", "Desc", TaskState.NEW, TaskPriority.HIGH, TaskType.FEATURE);
        String createTaskResponse = mockMvc.perform(post("/api/v1/tasks/create")
                        .header("Authorization", "Bearer " + jwtTokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        request.setTitle("New Task updated");
        request.setDescription("Desc updated");

        mockMvc.perform(put("/api/v1/tasks/" + 99999)
                        .header("Authorization", "Bearer " + jwtTokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value(Boolean.TRUE))
                .andExpect(jsonPath("$.message").value("Task not found"));
    }

    @Test
    void updateTask_Failure_Restricted_Edit() throws Exception {
        TaskRequest request = createTaskRequest(projectId, 1L, "New Task", "Desc", TaskState.NEW, TaskPriority.HIGH, TaskType.FEATURE);
        request.setRestrictedEdit(true);

        String createTaskResponse = mockMvc.perform(post("/api/v1/tasks/create")
                        .header("Authorization", "Bearer " + jwtTokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Long taskId = objectMapper.readTree(createTaskResponse).path("data").path("id").asLong();

        request.setTitle("New Task updated");
        request.setDescription("Desc updated");

        mockMvc.perform(put("/api/v1/tasks/" + taskId)
                        .header("Authorization", "Bearer " + jwtTokenUser)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value(Boolean.TRUE))
                .andExpect(jsonPath("$.message").value("You are not allowed to edit this task"));
    }

    @Test
    void deleteTask_Success() throws Exception {
        TaskRequest request = createTaskRequest(projectId, 1L, "New Task", "Desc", TaskState.NEW, TaskPriority.HIGH, TaskType.FEATURE);

        String createTaskResponse = mockMvc.perform(post("/api/v1/tasks/create")
                        .header("Authorization", "Bearer " + jwtTokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Long taskId = objectMapper.readTree(createTaskResponse).path("data").path("id").asLong();

        mockMvc.perform(delete("/api/v1/tasks/" + taskId)
                        .header("Authorization", "Bearer " + jwtTokenUser)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.error").value(Boolean.FALSE))
                .andExpect(jsonPath("$.message").value("Task deleted successfully"));
    }

    @Test
    void deleteTask_Failure_Invalid_TaskId() throws Exception {
        TaskRequest request = createTaskRequest(projectId, 1L, "New Task", "Desc", TaskState.NEW, TaskPriority.HIGH, TaskType.FEATURE);

        String createTaskResponse = mockMvc.perform(post("/api/v1/tasks/create")
                        .header("Authorization", "Bearer " + jwtTokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        mockMvc.perform(delete("/api/v1/tasks/" + 99999)
                        .header("Authorization", "Bearer " + jwtTokenUser)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value(Boolean.TRUE))
                .andExpect(jsonPath("$.message").value("Task not found"));
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

    private Long createProjectAndGetId() throws Exception {
        ProjectRequest createRequest = new ProjectRequest();
        createRequest.setTitle("Get Project by id");
        createRequest.setDescription("Project description");
        createRequest.setDueDate(LocalDateTime.now().plusDays(7).withHour(0).withMinute(0).withSecond(0).withNano(0).atZone(ZoneId.systemDefault())
                .toInstant());
        createRequest.setTags(Set.of("tag1"));

        // create project
        String createResponse = mockMvc.perform(post("/api/v1/projects/create")
                        .header("Authorization", "Bearer " + jwtTokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(createResponse).path("data").path("id").asLong();

    }

    /**
     * Creates a TaskRequest object.
     */
    private TaskRequest createTaskRequest(Long projectId, Long assignedTo, String title, String description,
                                          TaskState state, TaskPriority priority, TaskType type) {
        TaskRequest request = new TaskRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setDueDate(LocalDateTime.now().plusDays(3).withHour(0).withMinute(0).withSecond(0).withNano(0)
                .atZone(ZoneId.systemDefault()).toInstant());
        request.setState(state);
        request.setPriority(priority);
        request.setType(type);
        request.setProjectId(projectId);
        request.setAssignedTo(assignedTo);
        request.setTargetVersion("v1.0");
        return request;
    }


}
