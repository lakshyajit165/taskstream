package com.elkay.taskstream.config;

import java.util.List;

public final class AdminConfig {

    // List of emails that should be assigned ROLE_ADMIN
    public static final List<String> ADMIN_EMAILS = List.of(
            "john@gmail.com",
            "jane@gmail.com"
    );

    // private constructor to prevent instantiation
    private AdminConfig() {}
}