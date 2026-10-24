package com.elkay.taskstream;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
@SpringBootTest
class TaskstreamApplicationTests {
	@Container
	static final PostgreSQLContainer<?> postgresqlContainer = new PostgreSQLContainer<>("postgres:17")
			.withDatabaseName("taskstream_test")
			.withUsername("postgres")
			.withPassword("postgres123");

	static {
		postgresqlContainer.start();
	}

	@DynamicPropertySource
	static void setDatabaseProperties(DynamicPropertyRegistry registry) {
		registry.add("spring.datasource.url", postgresqlContainer::getJdbcUrl);
		registry.add("spring.datasource.username", postgresqlContainer::getUsername);
		registry.add("spring.datasource.password", postgresqlContainer::getPassword);
		registry.add("spring.jpa.hibernate.ddl-auto", () -> "none");
		registry.add("spring.flyway.locations", () -> "classpath:db/migration");
	}

	@Test
	void contextLoads() {
	}

}
