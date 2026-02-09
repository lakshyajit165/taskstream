package com.elkay.taskstream.utils;


import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class EnvironmentVariableValidator {
    private static final Logger logger = LoggerFactory.getLogger(EnvironmentVariableValidator.class);

    // List all required environment variables here
    private static final String[] REQUIRED_ENV_VARS = {
            "AWS_ACCESS_KEY_ID",
            "AWS_SECRET_ACCESS_KEY",
            "SENDER_EMAIL",
            "SENDER_EMAIL_PASSWORD"
            // Add more here if needed, e.g. "JWT_SECRET", "DB_PASSWORD"
    };

    @PostConstruct
    public void validateEnvironmentVariables() {
        List<String> missingVars = new ArrayList<>();

        for (String var : REQUIRED_ENV_VARS) {
            String value = System.getenv(var);
            if (value == null || value.isBlank()) {
                missingVars.add(var);
            }
        }

        if (!missingVars.isEmpty()) {
            logger.error("Application startup failed. Missing required environment variables: {}", missingVars);
            logger.error("Please set these variables before starting the application.");

            // Gracefully stop Spring Boot
            System.exit(1);
        }

        logger.info("All required environment variables are present.");
    }
}
