package com.elkay.taskstream.auth.oauth.gitlab;

import com.elkay.taskstream.auth.oauth.OAuthConfiguration;
import com.elkay.taskstream.auth.oauth.github.model.OAuthUserInfo;
import com.elkay.taskstream.auth.oauth.gitlab.model.GitlabUser;
import com.elkay.taskstream.auth.oauth.gitlab.model.GitlabTokenRequest;
import com.elkay.taskstream.auth.oauth.gitlab.model.GitlabTokenResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class GitlabOAuthClient {

    private final RestClient restClient;

    public GitlabOAuthClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    /**
     * Exchanges the authorization code by sending the token request parameters as JSON.
     */
    public OAuthUserInfo authenticate(
            OAuthConfiguration configuration,
            String code,
            String redirectUri) {
        GitlabTokenRequest tokenRequest = new GitlabTokenRequest(
                configuration.clientId(),
                configuration.clientSecret(),
                code,
                "authorization_code",
                redirectUri
        );
        GitlabTokenResponse token = restClient.post()
                .uri(configuration.serverUrl() + "/oauth/token")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(tokenRequest)
                .retrieve()
                .body(GitlabTokenResponse.class);

        if (token == null || token.accessToken() == null || token.accessToken().isBlank()) {
            throw new IllegalStateException("Failed to obtain GitLab access token");
        }

        GitlabUser user = restClient.get()
                .uri(configuration.serverUrl() + "/api/v4/user")
                .headers(headers -> headers.setBearerAuth(token.accessToken()))
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(GitlabUser.class);

        if (user == null || user.email() == null || user.email().isBlank()) {
            throw new IllegalStateException("GitLab did not return an email address for this account");
        }

        return new OAuthUserInfo(
                String.valueOf(user.id()),
                user.email(),
                user.name() != null && !user.name().isBlank() ? user.name() : user.username(),
                user.avatarUrl()
        );
    }

}
