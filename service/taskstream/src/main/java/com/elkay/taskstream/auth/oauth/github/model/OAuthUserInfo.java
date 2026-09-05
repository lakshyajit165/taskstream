package com.elkay.taskstream.auth.oauth.github.model;

public record OAuthUserInfo( String providerId, String email, String name, String avatarUrl ) { }