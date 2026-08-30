package com.elkay.taskstream.auth.repository;

import com.elkay.taskstream.auth.model.OAuthCredentials;
import com.elkay.taskstream.auth.oauth.OAuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OAuthCredentialsRepository
        extends JpaRepository<OAuthCredentials, Long> {

    Optional<OAuthCredentials> findByProvider(OAuthProvider provider);
    Optional<OAuthCredentials> findByOauthEnabledTrue();
    List<OAuthCredentials> findAllByOauthEnabledTrue();
}