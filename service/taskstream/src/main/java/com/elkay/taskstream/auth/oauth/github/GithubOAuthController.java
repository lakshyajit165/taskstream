package com.elkay.taskstream.auth.oauth.github;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/auth/oauth2")
public class GithubOAuthController {

    private final GithubOAuthConfigurationService configurationService;

    public GithubOAuthController(
            GithubOAuthConfigurationService configurationService) {
        this.configurationService = configurationService;
    }

    @GetMapping("/github")
    public ResponseEntity<Void> githubLogin() {

        GithubOAuthConfiguration configuration =
                configurationService.getConfiguration();

        String authorizationUrl =
                GithubOAuthUrls.authorizationUrl(
                        configuration.serverUrl()
                );

        String redirectUri =
                "http://localhost:8080/api/v1/auth/oauth2/github/callback";

        String url = authorizationUrl
                + "?client_id=" + configuration.clientId()
                + "&redirect_uri=" + redirectUri
                + "&scope=user:email%20read:user";

        return ResponseEntity
                .status(302)
                .location(URI.create(url))
                .build();
    }
}
