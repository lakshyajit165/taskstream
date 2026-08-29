package com.elkay.taskstream.auth.controller;

import com.elkay.taskstream.auth.oauth.github.GithubOAuthConfiguration;
import com.elkay.taskstream.auth.payload.OAuthConfigRequest;
import com.elkay.taskstream.auth.service.OAuthService;
import com.elkay.taskstream.auth.oauth.github.GithubOAuthUrls;
import com.elkay.taskstream.payload.GenericResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/auth")
public class OAuthController {

    private final OAuthService oAuthService;

    public OAuthController(
            OAuthService oAuthService) {
        this.oAuthService = oAuthService;
    }

    @GetMapping("/oauth2/github")
    public ResponseEntity<Void> githubLogin() {

        GithubOAuthConfiguration githubOAuthConfiguration =
                oAuthService.getConfiguration();

        String authorizationUrl =
                GithubOAuthUrls.authorizationUrl(
                        githubOAuthConfiguration.serverUrl()
                );

        String redirectUri =
                "http://localhost:8080/api/v1/auth/oauth2/github/callback";

        String url = authorizationUrl
                + "?client_id=" + githubOAuthConfiguration.clientId()
                + "&redirect_uri=" + redirectUri
                + "&scope=user:email%20read:user";

        return ResponseEntity
                .status(302)
                .location(URI.create(url))
                .build();
    }

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
}
