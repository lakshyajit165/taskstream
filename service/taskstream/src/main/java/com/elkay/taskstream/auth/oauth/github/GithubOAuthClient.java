package com.elkay.taskstream.auth.oauth.github;

import com.elkay.taskstream.auth.oauth.github.model.GithubEmail;
import com.elkay.taskstream.auth.oauth.github.model.GithubUser;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Arrays;
import java.util.Comparator;

@Component
public class GithubOAuthClient {

    private final RestClient restClient;

    public GithubOAuthClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    /**
     * Exchanges the GitHub authorization code for an access token.
     */
    public String exchangeCodeForAccessToken(
            GithubOAuthConfiguration configuration,
            String code,
            String redirectUri) {

        GithubTokenResponse response = restClient
                .post()
                .uri(configuration.serverUrl() + "/login/oauth/access_token")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(new GithubTokenRequest(
                        configuration.clientId(),
                        configuration.clientSecret(),
                        code,
                        redirectUri
                ))
                .retrieve()
                .body(GithubTokenResponse.class);

        if (response == null
                || response.accessToken() == null
                || response.accessToken().isBlank()) {

            throw new IllegalStateException(
                    "Failed to obtain GitHub access token"
            );
        }

        return response.accessToken();
    }

    /**
     * Fetches the authenticated GitHub user's profile.
     */
    public GithubUser getUser(
            GithubOAuthConfiguration configuration,
            String accessToken) {

        return restClient
                .get()
                .uri("https://api.github.com/user")
                .header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + accessToken
                )
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(GithubUser.class);
    }

    /**
     * Fetches the authenticated user's GitHub email addresses.
     *
     * GitHub's user profile email can be null when the email
     * is private, so we use the emails endpoint.
     */
    public GithubEmail[] getUserEmails(
            GithubOAuthConfiguration configuration,
            String accessToken) {

        return restClient
                .get()
                .uri("https://api.github.com/user/emails")
                .header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + accessToken
                )
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(GithubEmail[].class);
    }

    /**
     * Finds the primary verified email.
     */
    public String getPrimaryVerifiedEmail(
            GithubOAuthConfiguration configuration,
            String accessToken) {

        GithubEmail[] emails =
                getUserEmails(configuration, accessToken);

        if (emails == null || emails.length == 0) {
            throw new IllegalStateException(
                    "No email address found for GitHub account"
            );
        }

        return Arrays.stream(emails)
                .filter(GithubEmail::verified)
                .sorted(
                        Comparator.comparing(
                                GithubEmail::primary
                        ).reversed()
                )
                .map(GithubEmail::email)
                .filter(email ->
                        email != null && !email.isBlank()
                )
                .findFirst()
                .orElseThrow(() ->
                        new IllegalStateException(
                                "No verified email address found for GitHub account"
                        )
                );
    }

    /**
     * Internal request payload used to exchange the GitHub
     * authorization code for an access token.
     */
    private record GithubTokenRequest(
            @JsonProperty("client_id")
            String clientId,

            @JsonProperty("client_secret")
            String clientSecret,

            String code,

            @JsonProperty("redirect_uri")
            String redirectUri
    ) {
    }

    /**
     * Internal response payload returned by GitHub after
     * exchanging an authorization code for an access token.
     */
    private record GithubTokenResponse(
            @JsonProperty("access_token")
            String accessToken,

            @JsonProperty("token_type")
            String tokenType,

            String scope
    ) {
    }
}