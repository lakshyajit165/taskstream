package com.elkay.taskstream.auth.model;

import com.elkay.taskstream.auth.oauth.OAuthProvider;
import jakarta.persistence.*;

@Entity
@Table(
        name = "oauth_identities",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_oauth_identity_provider_provider_id",
                        columnNames = {"provider", "provider_id"}
                ),
                @UniqueConstraint(
                        name = "uq_oauth_identity_user_provider",
                        columnNames = {"user_id", "provider"}
                )
        }
)
public class OAuthIdentity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OAuthProvider provider;

    @Column(name = "provider_id", nullable = false)
    private String providerId;

    public OAuthIdentity() {
    }

    public OAuthIdentity(
            User user,
            OAuthProvider provider,
            String providerId) {
        this.user = user;
        this.provider = provider;
        this.providerId = providerId;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public OAuthProvider getProvider() {
        return provider;
    }

    public void setProvider(OAuthProvider provider) {
        this.provider = provider;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }
}

