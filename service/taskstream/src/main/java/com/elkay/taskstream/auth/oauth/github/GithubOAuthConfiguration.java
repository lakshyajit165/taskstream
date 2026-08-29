package com.elkay.taskstream.auth.oauth.github;

public record GithubOAuthConfiguration(String clientId,
                                       String clientSecret,
                                       String serverUrl) {
}
