package com.elkay.taskstream.auth.model;

import com.elkay.taskstream.auth.oauth.OAuthProvider;
import jakarta.persistence.*;

@Entity
@Table(name = "oauth_credentials")
public class OAuthCredentials {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private OAuthProvider provider;

    @Column(nullable = false)
    private String clientId;

    @Column(nullable = false)
    private String serverUrl;

    @Column
    private String clientSecret;

    @Column(nullable = false)
    private boolean oauthEnabled;

    public OAuthCredentials() {
    }

    public OAuthCredentials(
            OAuthProvider provider,
            String clientId,
            String serverUrl,
            String clientSecret,
            boolean oauthEnabled) {
        this.provider = provider;
        this.clientId = clientId;
        this.serverUrl = serverUrl;
        this.clientSecret = clientSecret;
        this.oauthEnabled = oauthEnabled;
    }

    public Long getId() {
        return id;
    }

    public OAuthProvider getProvider() {
        return provider;
    }

    public void setProvider(OAuthProvider provider) {
        this.provider = provider;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getServerUrl() {
        return serverUrl;
    }

    public void setServerUrl(String serverUrl) {
        this.serverUrl = serverUrl;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }

    public boolean isOauthEnabled() {
        return oauthEnabled;
    }

    public void setOauthEnabled(boolean oauthEnabled) {
        this.oauthEnabled = oauthEnabled;
    }
}