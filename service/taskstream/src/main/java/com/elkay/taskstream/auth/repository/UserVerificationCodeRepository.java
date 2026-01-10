package com.elkay.taskstream.auth.repository;

import com.elkay.taskstream.auth.model.UserVerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserVerificationCodeRepository extends JpaRepository<UserVerificationCode, Long> {

    Optional<UserVerificationCode> findByEmailAndVerificationCode(String email, String verificationCode);

    List<UserVerificationCode> findByEmail(String email);

    void deleteByEmail(String email);

    void deleteByExpiresAtBefore(Instant timestamp);

    boolean existsByEmail(String email);
}
