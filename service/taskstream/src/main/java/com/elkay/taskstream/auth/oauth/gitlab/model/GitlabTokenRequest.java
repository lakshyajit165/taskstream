package com.elkay.taskstream.auth.oauth.gitlab.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GitlabTokenRequest(
        @JsonProperty("client_id") String clientId,
        @JsonProperty("client_secret") String clientSecret,
        String code,
        @JsonProperty("grant_type") String grantType,
        @JsonProperty("redirect_uri") String redirectUri) {
}
