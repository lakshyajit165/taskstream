package com.elkay.taskstream.auth.payload;

import com.elkay.taskstream.auth.oauth.OAuthProvider;
import com.elkay.taskstream.auth.utils.ValidOAuthProvider;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class OAuthConfigRequest {

    @NotNull(message = "Provider is required")
    @ValidOAuthProvider
    private OAuthProvider oauthProvider;

    @NotBlank(message = "Server URL is required")
    private String serverUrl;

    @NotBlank(message = "Client ID is required")
    private String clientId;

    @NotBlank(message = "Client Secret is required")
    private String clientSecret;

    public OAuthConfigRequest() {
    }

    public OAuthConfigRequest(
            OAuthProvider oauthProvider,
            String serverUrl,
            String clientId,
            String clientSecret) {

        this.oauthProvider = oauthProvider;
        this.serverUrl = serverUrl;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    public OAuthProvider getOAuthProvider() {
        return oauthProvider;
    }

    public void setOAuthProvider(OAuthProvider oauthProvider) {
        this.oauthProvider = oauthProvider;
    }

    public String getServerUrl() {
        return serverUrl;
    }

    public void setServerUrl(String serverUrl) {
        this.serverUrl = serverUrl;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }
}