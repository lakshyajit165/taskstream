package com.elkay.taskstream;

import com.elkay.taskstream.auth.payload.LoginRequest;
import com.elkay.taskstream.auth.payload.SignupRequest;
import com.elkay.taskstream.auth.repository.RoleRepository;
import com.elkay.taskstream.auth.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import javax.sql.DataSource;

import java.time.Duration;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@SpringBootTest
@AutoConfigureMockMvc
@TestInstance(TestInstance.Lifecycle.PER_CLASS) // Tells JUnit to create only one instance of the test
@Testcontainers
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Container
    private static PostgreSQLContainer postgresqlContainer = (PostgreSQLContainer) new PostgreSQLContainer("postgres:9.6.12")
            .withDatabaseName("taskstreamdb")
            .withUsername("postgres")
            .withPassword("postgres123")
            .withStartupTimeout(Duration.ofMinutes(2));

    /**
     * the container starts immediately when the class is loaded,
     * before Spring Boot tries to initialize the ApplicationContext,
     * before @DynamicPropertySource runs, and before JUnit runs any test lifecycle logic.
     *
     * That means:
     *
     * ✔ postgresqlContainer.getJdbcUrl() is safe
     * ✔ Ports are mapped
     * ✔ Dynamic properties resolve correctly
     * ✔ ApplicationContext loads successfully
     *
     * This guarantees the PostgreSQL container is fully running when Spring Boot
     * reads the datasource properties.
     *
     * */
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

    @BeforeEach
    void setUp() {
        // Clean database before each test
        userRepository.deleteAll();
    }

    @Test
    void testPostgresContainerRunning() {
        assertThat(postgresqlContainer.isRunning()).isTrue();
    }
    // ===================== SIGNUP TESTS =====================

    // SIGNUP: Missing name
    @Test
    void signup_ShouldFail_WhenNameIsBlank() throws Exception {
        SignupRequest signupRequest = new SignupRequest("", "test@example.com", "password123");

        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Name is required"))
                .andExpect(jsonPath("$.error").value(Boolean.TRUE));
    }

    // SIGNUP: Invalid email
    @Test
    void signup_ShouldFail_WhenEmailIsInvalid() throws Exception {
        SignupRequest signupRequest = new SignupRequest("John Doe", "invalid-email", "password123");

        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email should be valid"))
                .andExpect(jsonPath("$.error").value(Boolean.TRUE));
    }

    // SIGNUP: Missing password
    @Test
    void signup_ShouldFail_WhenPasswordIsBlank() throws Exception {
        SignupRequest signupRequest = new SignupRequest("John Doe", "john@example.com", "");

        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Password is required"))
                .andExpect(jsonPath("$.error").value(Boolean.TRUE));
    }

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
                .andExpect(jsonPath("$.message").value("User email already exists"))
                .andExpect(jsonPath("$.error").value(Boolean.TRUE));
    }

    // ===================== LOGIN TESTS =====================

    // LOGIN: Missing email
    @Test
    void login_ShouldFail_WhenEmailIsBlank() throws Exception {
        LoginRequest loginRequest = new LoginRequest("", "password123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email is required"))
                .andExpect(jsonPath("$.error").value(Boolean.TRUE));
    }

    // LOGIN: Missing password
    @Test
    void login_ShouldFail_WhenPasswordIsBlank() throws Exception {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Password is required"))
                .andExpect(jsonPath("$.error").value(Boolean.TRUE));
    }

    // LOGIN: success
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

    // LOGIN: wrong password
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

    // LOGIN: user not found
    @Test
    void testLogin_Failure_UserNotFound() throws Exception {
        LoginRequest loginRequest = new LoginRequest("nonexistent@example.com", "password123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("User email not found"))
                .andExpect(jsonPath("$.error").value(Boolean.TRUE));
    }
}
