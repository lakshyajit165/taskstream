package com.elkay.taskstream.auth.service;

import com.elkay.taskstream.auth.model.User;
import com.elkay.taskstream.auth.payload.SearchUserResponse;
import com.elkay.taskstream.auth.payload.UserSuggestion;
import com.elkay.taskstream.auth.repository.UserRepository;
import com.elkay.taskstream.exception.BadRequestException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    private UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public SearchUserResponse searchUsers(String name) {
        if(name.isBlank()) {
            throw new BadRequestException("User name is required");
        }
        SearchUserResponse searchUserResponse = new SearchUserResponse();
        List<UserSuggestion> userSuggestions = new ArrayList<>();
        List<User> users = userRepository.searchUsersByName(name);
        for(User user : users) {
            UserSuggestion userSuggestion = new UserSuggestion();
            userSuggestion.setId(user.getId());
            userSuggestion.setName(user.getName());
            userSuggestions.add(userSuggestion);
        }
        searchUserResponse.setUserSuggestions(userSuggestions);
        return searchUserResponse;
    }
}
