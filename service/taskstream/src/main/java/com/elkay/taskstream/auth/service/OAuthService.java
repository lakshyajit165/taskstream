package com.elkay.taskstream.auth.service;

import com.elkay.taskstream.auth.model.OAuthCredentials;
import com.elkay.taskstream.auth.oauth.OAuthProvider;
import com.elkay.taskstream.auth.oauth.github.GithubOAuthConfiguration;
import com.elkay.taskstream.auth.payload.OAuthConfigRequest;
import com.elkay.taskstream.auth.repository.OAuthCredentialsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OAuthService {
    private final OAuthCredentialsRepository oauthCredentialsRepository;

    public OAuthService(
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

    @Transactional
    public void saveOAuthCredentials(OAuthConfigRequest oauthConfigRequest) {

        OAuthCredentials credentials = oauthCredentialsRepository
                .findByProvider(oauthConfigRequest.getOAuthProvider())
                .orElseGet(OAuthCredentials::new);

        boolean newConfiguration = credentials.getId() == null;

        if (newConfiguration) {
            if (oauthConfigRequest.getClientId() == null
                    || oauthConfigRequest.getClientSecret() == null) {
                throw new IllegalArgumentException(
                        "Client ID and Client Secret are required for new OAuth configuration"
                );
            }
        }

        // Disable any currently active OAuth provider
        disableActiveOAuthCredentials();


        credentials.setProvider(oauthConfigRequest.getOAuthProvider());
        credentials.setServerUrl(oauthConfigRequest.getServerUrl());

        if (oauthConfigRequest.getClientId() != null) {
            credentials.setClientId(oauthConfigRequest.getClientId());
        }

        if (oauthConfigRequest.getClientSecret() != null) {
            credentials.setClientSecret(oauthConfigRequest.getClientSecret());
        }

        credentials.setOauthEnabled(true);

        oauthCredentialsRepository.save(credentials);
    }

    @Transactional(readOnly = true)
    public OAuthProvider getConfiguredOAuthProvider() {
        return oauthCredentialsRepository
                .findByOauthEnabledTrue()
                .map(OAuthCredentials::getProvider)
                .orElse(OAuthProvider.LOCAL);
    }

    @Transactional
    public void disableOAuthCredentials() {
        disableActiveOAuthCredentials();
    }

    private void disableActiveOAuthCredentials() {
        oauthCredentialsRepository
                .findAllByOauthEnabledTrue()
                .forEach(activeCredentials ->
                        activeCredentials.setOauthEnabled(false)
                );
    }

}
