package com.elkay.taskstream.auth.repository;

import com.elkay.taskstream.auth.model.UserVerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserVerificationCodeRepository extends JpaRepository<UserVerificationCode, Long> {

    Optional<UserVerificationCode> findByEmailAndVerificationCode(String email, String verificationCode);

    Optional<UserVerificationCode> findByEmail(String email);

    void deleteByEmail(String email);

    void deleteByExpiresAtBefore(Instant timestamp);

    boolean existsByEmail(String email);

    @Modifying
    @Query("UPDATE UserVerificationCode u SET u.attempts = u.attempts + 1 WHERE u.id = :id")
    void incrementAttempts(@Param("id") Long id);
}
