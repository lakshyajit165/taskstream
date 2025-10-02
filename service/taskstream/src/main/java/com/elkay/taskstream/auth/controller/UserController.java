package com.elkay.taskstream.auth.controller;

import com.elkay.taskstream.auth.payload.SearchUserResponse;
import com.elkay.taskstream.auth.service.UserService;
import com.elkay.taskstream.payload.GenericResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/search")
    public ResponseEntity<GenericResponse<SearchUserResponse>> searchUsers(
            @RequestParam("name") String name
    ) {
        SearchUserResponse searchUserResponse = userService.searchUsers(name);
        return ResponseEntity.ok(
                new GenericResponse<>("Users fetched successfully", false, searchUserResponse)
        );
    }
}
