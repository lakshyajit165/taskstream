package com.elkay.taskstream.auth.repository;

import com.elkay.taskstream.auth.model.OAuthIdentity;
import com.elkay.taskstream.auth.model.User;
import com.elkay.taskstream.auth.oauth.OAuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OAuthIdentityRepository extends JpaRepository<OAuthIdentity, Long> {
    Optional<OAuthIdentity> findByProviderAndProviderId(OAuthProvider provider, String providerId );
    Optional<OAuthIdentity> findByUserAndProvider(User user, OAuthProvider provider );
}