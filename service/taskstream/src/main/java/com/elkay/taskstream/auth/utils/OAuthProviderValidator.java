package com.elkay.taskstream.auth.utils;

import com.elkay.taskstream.auth.oauth.OAuthProvider;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class OAuthProviderValidator
        implements ConstraintValidator<ValidOAuthProvider, OAuthProvider> {

    @Override
    public boolean isValid(
            OAuthProvider oAuthProvider,
            ConstraintValidatorContext context) {
        return oAuthProvider == OAuthProvider.GITHUB
                || oAuthProvider == OAuthProvider.GITLAB;
    }
}