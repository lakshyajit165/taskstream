package com.elkay.taskstream.config;

import java.util.List;

public final class AdminConfig {

    // List of emails that should be assigned ROLE_ADMIN
    private static List<String> adminEmails = List.of(
            "lakshyajit165@gmail.com"
    );

    public static List<String> getAdminEmails() {
        return adminEmails;
    }

    public static void setAdminEmails(List<String> adminEmails) {
        AdminConfig.adminEmails = adminEmails;
    }

    // private constructor to prevent instantiation
    private AdminConfig() {}
}