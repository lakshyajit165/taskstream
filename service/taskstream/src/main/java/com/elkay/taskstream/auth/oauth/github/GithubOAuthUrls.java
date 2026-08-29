package com.elkay.taskstream.auth.oauth.github;

public final class GithubOAuthUrls {
    private GithubOAuthUrls() {
    }

    public static String normalizeServerUrl(String serverUrl) {
        if (serverUrl == null) {
            return null;
        }

        return serverUrl.endsWith("/")
                ? serverUrl.substring(0, serverUrl.length() - 1)
                : serverUrl;
    }

    public static String authorizationUrl(String serverUrl) {
        return normalizeServerUrl(serverUrl)
                + "/login/oauth/authorize";
    }

    public static String tokenUrl(String serverUrl) {
        return normalizeServerUrl(serverUrl)
                + "/login/oauth/access_token";
    }
}
