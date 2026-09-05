package com.elkay.taskstream.auth.controller;

import com.elkay.taskstream.auth.oauth.OAuthProvider;
import com.elkay.taskstream.auth.oauth.github.model.OAuthMode;
import com.elkay.taskstream.auth.payload.OAuthConfigRequest;
import com.elkay.taskstream.auth.service.OAuthService;
import com.elkay.taskstream.exception.ResourceAlreadyExistsException;
import com.elkay.taskstream.payload.GenericResponse;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@RestController
@RequestMapping("/api/v1/auth")
public class OAuthController {

    private final OAuthService oAuthService;

    public OAuthController(
            OAuthService oAuthService) {
        this.oAuthService = oAuthService;
    }

    @GetMapping("/oauth2/provider")
    public ResponseEntity<GenericResponse<OAuthProvider>> getOAuthProvider() throws InterruptedException {
        OAuthProvider provider =
                oAuthService.getConfiguredOAuthProvider();

        return ResponseEntity.ok(
                new GenericResponse<>(
                        "OAuth provider fetched successfully",
                        false,
                        provider
                )
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/oauth2/config/save")
    public ResponseEntity<GenericResponse<Void>> saveOAuthCredentials(
            @Valid @RequestBody OAuthConfigRequest oauthConfigRequest) {

        oAuthService.saveOAuthCredentials(oauthConfigRequest);

        return ResponseEntity.ok(
                new GenericResponse<>(
                        "OAuth configuration saved successfully",
                        false,
                        null
                )
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/oauth2/config/disable")
    public ResponseEntity<GenericResponse<Void>> disableOAuthCredentials() {

        oAuthService.disableOAuthCredentials();
        return ResponseEntity.ok(
                new GenericResponse<>(
                        "OAuth configuration disabled successfully",
                        false,
                        null
                )
        );
    }

    @GetMapping("/oauth2/github")
    public ResponseEntity<Void> githubLogin(
            @RequestParam(defaultValue = "LOGIN") OAuthMode mode, HttpServletResponse response) {

        String state = oAuthService.generateOAuthState();

        ResponseCookie stateCookie = ResponseCookie.from("oauth_state", state)
                                        .httpOnly(true)
                                        .secure(false) // true in production
                                        .sameSite("Lax")
                                        .path("/api/v1/auth/oauth2/github")
                                        .maxAge(Duration.ofMinutes(5))
                                        .build();

        ResponseCookie modeCookie = ResponseCookie.from("oauth_mode", mode.name())
                                        .httpOnly(true)
                                        .secure(false) // true in production
                                        .sameSite("Lax")
                                        .path("/api/v1/auth/oauth2/github")
                                        .maxAge(Duration.ofMinutes(5))
                                        .build();

        response.addHeader(HttpHeaders.SET_COOKIE, stateCookie.toString());

        response.addHeader(HttpHeaders.SET_COOKIE, modeCookie.toString());

        String authorizationUrl = oAuthService.buildGithubAuthorizationUrl(state, mode);

        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(authorizationUrl)).build();
    }

    @GetMapping("/oauth2/github/callback")
    public ResponseEntity<Void> githubCallback(
            @RequestParam String code, @RequestParam String state,
            @CookieValue(name = "oauth_state", required = false) String storedState,
            @CookieValue(name = "oauth_mode", required = false) String storedMode, HttpServletResponse response) {

        oAuthService.validateOAuthState(state, storedState);
        OAuthMode mode;
        try {
            mode = OAuthMode.valueOf(storedMode);
        } catch (Exception ex) {
            throw new IllegalArgumentException(
                    "Invalid OAuth mode"
            );
        }
        try {
            String jwt;
            if (mode == OAuthMode.SIGNUP) {
                jwt = oAuthService.authenticateGithubAndGenerateSignupToken(code);
            } else {
                jwt = oAuthService.authenticateGithubAndGenerateToken(code);
            }
            clearOAuthCookies(response);
            String frontendUrl =
                    "http://localhost:5173/oauth2/callback?token="
                            + URLEncoder.encode(
                            jwt,
                            StandardCharsets.UTF_8
                    );
            return ResponseEntity
                    .status(HttpStatus.FOUND)
                    .location(URI.create(frontendUrl))
                    .build();

        } catch (ResourceAlreadyExistsException ex) {

            clearOAuthCookies(response);

            String frontendUrl =
                    "http://localhost:5173/signup?oauthError="
                            + URLEncoder.encode(
                            ex.getMessage(),
                            StandardCharsets.UTF_8
                    );

            return ResponseEntity
                    .status(HttpStatus.FOUND)
                    .location(URI.create(frontendUrl))
                    .build();
        }
    }


    private void clearOAuthCookies(
            HttpServletResponse response) {

        ResponseCookie deleteStateCookie =
                ResponseCookie.from(
                                "oauth_state",
                                ""
                        )
                        .httpOnly(true)
                        .secure(false)
                        .sameSite("Lax")
                        .path("/api/v1/auth/oauth2/github")
                        .maxAge(0)
                        .build();

        ResponseCookie deleteModeCookie =
                ResponseCookie.from(
                                "oauth_mode",
                                ""
                        )
                        .httpOnly(true)
                        .secure(false)
                        .sameSite("Lax")
                        .path("/api/v1/auth/oauth2/github")
                        .maxAge(0)
                        .build();

        response.addHeader(
                HttpHeaders.SET_COOKIE,
                deleteStateCookie.toString()
        );

        response.addHeader(
                HttpHeaders.SET_COOKIE,
                deleteModeCookie.toString()
        );
    }
}
