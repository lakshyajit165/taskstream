package com.elkay.taskstream.auth.service;

import com.elkay.taskstream.auth.jwt.JWTUtil;
import com.elkay.taskstream.auth.model.OAuthCredentials;
import com.elkay.taskstream.auth.model.OAuthIdentity;
import com.elkay.taskstream.auth.model.Role;
import com.elkay.taskstream.auth.model.User;
import com.elkay.taskstream.auth.oauth.OAuthProvider;
import com.elkay.taskstream.auth.oauth.github.GithubOAuthClient;
import com.elkay.taskstream.auth.oauth.github.GithubOAuthConfiguration;
import com.elkay.taskstream.auth.oauth.github.GithubOAuthUrls;
import com.elkay.taskstream.auth.oauth.github.model.GithubEmail;
import com.elkay.taskstream.auth.oauth.github.model.GithubUser;
import com.elkay.taskstream.auth.oauth.github.model.OAuthMode;
import com.elkay.taskstream.auth.oauth.github.model.OAuthUserInfo;
import com.elkay.taskstream.auth.payload.OAuthConfigRequest;
import com.elkay.taskstream.auth.repository.OAuthCredentialsRepository;
import com.elkay.taskstream.auth.repository.OAuthIdentityRepository;
import com.elkay.taskstream.auth.repository.RoleRepository;
import com.elkay.taskstream.auth.repository.UserRepository;
import com.elkay.taskstream.config.AdminConfig;
import com.elkay.taskstream.exception.ResourceAlreadyExistsException;
import com.elkay.taskstream.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
import java.util.Optional;
import java.util.Set;

@Service
public class OAuthService {

    private final OAuthCredentialsRepository oauthCredentialsRepository;
    private final OAuthIdentityRepository oauthIdentityRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JWTUtil jwtUtil;
    private final SecureRandom secureRandom = new SecureRandom();
    private final GithubOAuthClient githubOAuthClient;

    public OAuthService(
            OAuthCredentialsRepository oauthCredentialsRepository,
            OAuthIdentityRepository oauthIdentityRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            JWTUtil jwtUtil, GithubOAuthClient githubOAuthClient) {

        this.oauthCredentialsRepository = oauthCredentialsRepository;
        this.oauthIdentityRepository = oauthIdentityRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.jwtUtil = jwtUtil;
        this.githubOAuthClient = githubOAuthClient;
    }

    /*
     * -------------------------------------------------------------------------
     * OAuth configuration
     * -------------------------------------------------------------------------
     */

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

        OAuthCredentials credentials = oauthCredentialsRepository.findByProvider(oauthConfigRequest.getOAuthProvider())
                                        .orElseGet(OAuthCredentials::new);

        boolean newConfiguration = credentials.getId() == null;

        if (newConfiguration) {
            if (oauthConfigRequest.getClientId() == null || oauthConfigRequest.getClientSecret() == null) {
                throw new IllegalArgumentException(
                        "Client ID and Client Secret are required " +
                                "for new OAuth configuration"
                );
            }
        }

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

        return oauthCredentialsRepository.findByOauthEnabledTrue()
                                            .map(OAuthCredentials::getProvider)
                                            .orElse(OAuthProvider.LOCAL);
    }

    @Transactional
    public void disableOAuthCredentials() {
        disableActiveOAuthCredentials();
    }

    @Transactional
    public User registerUser(OAuthProvider provider, OAuthUserInfo oauthUserInfo) {

        if (oauthUserInfo.providerId() == null || oauthUserInfo.providerId().isBlank()) {
            throw new IllegalStateException("OAuth provider ID is missing");
        }
        if (oauthUserInfo.email() == null || oauthUserInfo.email().isBlank()) {
            throw new IllegalStateException("OAuth email is missing");
        }
        // Check whether this OAuth identity already exists.
        boolean identityExists = oauthIdentityRepository.findByProviderAndProviderId(provider, oauthUserInfo.providerId())
                                                        .isPresent();

        if (identityExists) {
            throw new ResourceAlreadyExistsException("An account already exists with this GitHub account. Please sign in instead.");
        }

        // Check whether a Taskstream account already exists
        // with this email.
        boolean userExists = userRepository.findByEmail(oauthUserInfo.email())
                            .isPresent();

        if (userExists) {
            throw new ResourceAlreadyExistsException("An account already exists with this email. Please sign in instead.");
        }

        // Create new OAuth-only user.
        User user = new User(
                oauthUserInfo.name(),
                oauthUserInfo.email(),
                null
        );

        long roleId;

        if (AdminConfig.getAdminEmails().contains(oauthUserInfo.email())) {
            roleId = 2L;
        } else {
            roleId = 1L;
        }

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Role to be assigned could not be found"
                        )
                );

        user.addRole(role);

        userRepository.save(user);

        OAuthIdentity oauthIdentity = new OAuthIdentity(user, provider, oauthUserInfo.providerId());

        user.addOAuthIdentity(oauthIdentity);

        oauthIdentityRepository.save(oauthIdentity);

        return user;
    }

    private void disableActiveOAuthCredentials() {
        oauthCredentialsRepository.findAllByOauthEnabledTrue().forEach(activeCredentials -> activeCredentials.setOauthEnabled(false));
    }

    /*
     * -------------------------------------------------------------------------
     * OAuth identity resolution
     * -------------------------------------------------------------------------
     */

    @Transactional
    public User resolveUser(OAuthProvider provider, OAuthUserInfo oauthUserInfo) {

        if (oauthUserInfo.providerId() == null || oauthUserInfo.providerId().isBlank()) {
            throw new IllegalStateException(
                    "OAuth provider ID is missing"
            );
        }
        if (oauthUserInfo.email() == null || oauthUserInfo.email().isBlank()) {
            throw new IllegalStateException(
                    "OAuth email is missing"
            );
        }

        // 1. Existing OAuth identity
        Optional<OAuthIdentity> existingIdentity = oauthIdentityRepository
                                                        .findByProviderAndProviderId(
                                                                provider,
                                                                oauthUserInfo.providerId()
                                                        );

        if (existingIdentity.isPresent()) {
            return existingIdentity.get().getUser();
        }

        // 2. Existing Taskstream user with the same email
        Optional<User> existingUser = userRepository.findByEmail(oauthUserInfo.email());

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            OAuthIdentity oauthIdentity = new OAuthIdentity(
                                                    user,
                                                    provider,
                                                    oauthUserInfo.providerId()
                                            );

            user.addOAuthIdentity(oauthIdentity);
            oauthIdentityRepository.save(oauthIdentity);

            return user;
        }

        // 3. Create a new OAuth-only user
        User user = new User(oauthUserInfo.name(), oauthUserInfo.email(), null);

        long roleId;

        if (AdminConfig.getAdminEmails()
                .contains(oauthUserInfo.email())) {
            roleId = 2L;
        } else {
            roleId = 1L;
        }

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Role to be assigned could not be found"
                        )
                );

        user.addRole(role);

        userRepository.save(user);

        OAuthIdentity oauthIdentity = new OAuthIdentity(user, provider, oauthUserInfo.providerId());

        user.addOAuthIdentity(oauthIdentity);

        oauthIdentityRepository.save(oauthIdentity);

        return user;
    }

    private User createOAuthUser(
            String name,
            String email) {

        User user = new User();

        user.setName(
                resolveName(name, email)
        );

        user.setEmail(email);

        /*
         * OAuth-only users do not have a local password.
         */
        user.setPassword(null);

        /*
         * Keep the same role assignment logic
         * that is currently used in AuthService.signup().
         */
        long roleId;

        if (AdminConfig.getAdminEmails().contains(email)) {
            roleId = 2L;
        } else {
            roleId = 1L;
        }

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Role to be assigned could not be found"
                        )
                );

        user.addRole(role);

        return user;
    }

    private String resolveName(
            String name,
            String email) {

        if (name != null && !name.isBlank()) {
            return name;
        }

        int atIndex = email.indexOf('@');

        if (atIndex > 0) {
            return email.substring(0, atIndex);
        }

        return email;
    }

    public String generateOAuthState() {
        byte[] state = new byte[32];
        secureRandom.nextBytes(state);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(state);
    }

    public String buildGithubAuthorizationUrl(
            String state,
            OAuthMode mode) {

        GithubOAuthConfiguration configuration =
                getConfiguration();

        String redirectUri =
                "http://localhost:8000/api/v1/auth/oauth2/github/callback";

        return GithubOAuthUrls.authorizationUrl(
                configuration.serverUrl()
        )
                + "?client_id="
                + urlEncode(configuration.clientId())
                + "&redirect_uri="
                + urlEncode(redirectUri)
                + "&scope="
                + urlEncode("read:user user:email")
                + "&state="
                + urlEncode(state);
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    public void validateOAuthState(
            String state,
            String storedState) {

        if (state == null || storedState == null) {
            throw new IllegalArgumentException(
                    "Invalid OAuth state"
            );
        }

        boolean valid = MessageDigest.isEqual(
                state.getBytes(StandardCharsets.UTF_8),
                storedState.getBytes(StandardCharsets.UTF_8)
        );

        if (!valid) {
            throw new IllegalArgumentException(
                    "Invalid OAuth state"
            );
        }
    }

    public OAuthUserInfo authenticateGithub(String code) {

        GithubOAuthConfiguration configuration =
                getConfiguration();

        String redirectUri =
                "http://localhost:8000/api/v1/auth/oauth2/github/callback";

        String accessToken =
                githubOAuthClient.exchangeCodeForAccessToken(
                        configuration,
                        code,
                        redirectUri
                );

        GithubUser githubUser =
                githubOAuthClient.getUser(
                        configuration,
                        accessToken
                );

        GithubEmail[] githubEmails =
                githubOAuthClient.getUserEmails(
                        configuration,
                        accessToken
                );

        GithubEmail primaryEmail = findPrimaryVerifiedEmail(
                githubEmails
        );

        return new OAuthUserInfo(
                githubUser.id(),
                primaryEmail.email(),
                githubUser.name() != null
                        ? githubUser.name()
                        : githubUser.login(),
                githubUser.avatarUrl()
        );
    }

    private GithubEmail findPrimaryVerifiedEmail(
            GithubEmail[] emails) {

        return Arrays.stream(emails)
                .filter(GithubEmail::verified)
                .filter(GithubEmail::primary)
                .findFirst()
                .orElseThrow(() ->
                        new IllegalStateException(
                                "No verified primary email found on GitHub"
                        )
                );
    }


    @Transactional
    public String authenticateGithubAndGenerateToken(String code) {

        OAuthUserInfo oauthUserInfo = authenticateGithub(code);
        User user = resolveUser(OAuthProvider.GITHUB, oauthUserInfo);
        return jwtUtil.generateToken(user);
    }

    @Transactional
    public String authenticateGithubAndGenerateSignupToken(String code) {

        OAuthUserInfo oauthUserInfo = authenticateGithub(code);
        User user = registerUser(OAuthProvider.GITHUB, oauthUserInfo);
        return jwtUtil.generateToken(user);
    }


}