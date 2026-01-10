package com.elkay.taskstream.auth.model;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "user_verification_codes")
public class UserVerificationCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(name = "verification_code", nullable = false, length = 6)
    private String verificationCode;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "attempts", nullable = false)
    private Integer attempts = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        expiresAt = Instant.now().plus(1, ChronoUnit.MINUTES); // 5 min expiry
    }

    // Business logic methods
    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public void incrementAttempts() {
        this.attempts++;
    }

    public boolean hasExceededMaxAttempts(int maxAttempts) {
        return this.attempts >= maxAttempts;
    }

    // Constructors
    public UserVerificationCode() {}

    public UserVerificationCode(String email, String verificationCode) {
        this.email = email;
        this.verificationCode = verificationCode;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Integer getAttempts() {
        return attempts;
    }

    public void setAttempts(Integer attempts) {
        this.attempts = attempts;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "UserVerificationCode{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", expiresAt=" + expiresAt +
                ", attempts=" + attempts +
                ", createdAt=" + createdAt +
                '}';
    }
}