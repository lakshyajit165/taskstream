package com.elkay.taskstream.auth.oauth.github.model;

public record GithubEmail( String email, boolean primary, boolean verified ) { }