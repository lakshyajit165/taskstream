package com.elkay.taskstream.auth.oauth.github;

import com.elkay.taskstream.auth.model.OAuthCredentials;
import com.elkay.taskstream.auth.oauth.OAuthProvider;
import com.elkay.taskstream.auth.repository.OAuthCredentialsRepository;
import org.springframework.stereotype.Service;

@Service
public class GithubOAuthConfigurationService {
    private final OAuthCredentialsRepository oauthCredentialsRepository;

    public GithubOAuthConfigurationService(
            OAuthCredentialsRepository oauthCredentialsRepository) {
        this.oauthCredentialsRepository = oauthCredentialsRepository;
    }

    public GithubOAuthConfiguration getConfiguration() {

        OAuthCredentials credentials =
                oauthCredentialsRepository
                        .findByProvider(OAuthProvider.GITHUB)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "GitHub OAuth configuration not found"
                                )
                        );

        if (!credentials.isOauthEnabled()) {
            throw new IllegalStateException(
                    "GitHub OAuth is not enabled"
            );
        }

        if (credentials.getClientId() == null
                || credentials.getClientId().isBlank()) {
            throw new IllegalStateException(
                    "GitHub OAuth client ID is not configured"
            );
        }

        if (credentials.getClientSecret() == null
                || credentials.getClientSecret().isBlank()) {
            throw new IllegalStateException(
                    "GitHub OAuth client secret is not configured"
            );
        }

        if (credentials.getServerUrl() == null
                || credentials.getServerUrl().isBlank()) {
            throw new IllegalStateException(
                    "GitHub OAuth server URL is not configured"
            );
        }

        return new GithubOAuthConfiguration(
                credentials.getClientId(),
                credentials.getClientSecret(),
                credentials.getServerUrl()
        );
    }
}
