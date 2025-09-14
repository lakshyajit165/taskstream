package com.elkay.taskstream.auth.payload;

import java.util.List;

public class SearchUserResponse {
    List<UserSuggestion> userSuggestions;

    public SearchUserResponse() {
    }

    public SearchUserResponse(List<UserSuggestion> userSuggestions) {
        this.userSuggestions = userSuggestions;
    }

    public List<UserSuggestion> getUserSuggestions() {
        return userSuggestions;
    }

    public void setUserSuggestions(List<UserSuggestion> userSuggestions) {
        this.userSuggestions = userSuggestions;
    }
}
