package com.elkay.taskstream.auth.utils;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = OAuthProviderValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidOAuthProvider {

    String message() default "Invalid OAuth provider";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}