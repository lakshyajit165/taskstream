package com.elkay.taskstream.auth.payload;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ResetPasswordRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Verification code is required")
    private String verificationCode;

    @NotBlank(message = "Password is required")
    private String password;

    public ResetPasswordRequest() {}

    public ResetPasswordRequest(String email, String verificationCode, String password) {
        this.email = email;
        this.verificationCode = verificationCode;
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
