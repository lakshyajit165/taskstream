package com.elkay.taskstream.auth.oauth.gitlab.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GitlabTokenResponse(@JsonProperty("access_token") String accessToken) {
}
