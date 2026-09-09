package com.elkay.taskstream.auth.utils;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

public final class OAuthUtils {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private OAuthUtils() {
    }

    public static String generateOAuthState() {
        byte[] state = new byte[32];
        SECURE_RANDOM.nextBytes(state);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(state);
    }

    public static String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    public static void validateState(String state, String storedState) {

        if (state == null || storedState == null) {
            throw new IllegalArgumentException("Invalid OAuth state");
        }

        boolean valid = MessageDigest.isEqual(
                state.getBytes(StandardCharsets.UTF_8),
                storedState.getBytes(StandardCharsets.UTF_8)
        );

        if (!valid) {
            throw new IllegalArgumentException("Invalid OAuth state");
        }
    }
}