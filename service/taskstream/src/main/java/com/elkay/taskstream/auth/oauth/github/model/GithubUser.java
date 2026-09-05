package com.elkay.taskstream.auth.oauth.github.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GithubUser(
        String id,
        String login,
        String name,
        String email,
        @JsonProperty("avatar_url")
        String avatarUrl ) { }