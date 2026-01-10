package com.elkay.taskstream.auth.payload;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class InitiateResetPasswordRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    public InitiateResetPasswordRequest(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
