package com.elkay.taskstream.common_utils;

import com.elkay.taskstream.auth.jwt.CustomUserDetails;
import com.elkay.taskstream.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {


    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new UnauthorizedException("User not authenticated");
        }
        return userDetails.getUserId();
    }
}
