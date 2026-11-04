package com.elkay.taskstream.auth.oauth.gitlab.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GitlabUser(
        Long id,
        String username,
        String name,
        String email,
        @JsonProperty("avatar_url") String avatarUrl) {
}
