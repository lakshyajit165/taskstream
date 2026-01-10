package com.elkay.taskstream.auth.service;

import com.elkay.taskstream.auth.repository.UserVerificationCodeRepository;
import com.elkay.taskstream.auth.utils.VerificationCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VerificationCodeService {

    private final UserVerificationCodeRepository userVerificationCodeRepository;

    public VerificationCodeService(UserVerificationCodeRepository userVerificationCodeRepository) {
        this.userVerificationCodeRepository = userVerificationCodeRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void removeCodeDueToFailure(String email) {
        // This transaction commits even if the calling method rolls back
        userVerificationCodeRepository.deleteByEmail(email);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void incrementFailureCount(Long id) {
        // This transaction commits even if the calling method rolls back
        userVerificationCodeRepository.incrementAttempts(id);
    }
}
