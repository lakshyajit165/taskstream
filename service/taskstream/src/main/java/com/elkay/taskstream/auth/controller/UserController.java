package com.elkay.taskstream.auth.controller;

import com.elkay.taskstream.auth.payload.SearchUserResponse;
import com.elkay.taskstream.auth.service.UserService;
import com.elkay.taskstream.common_utils.SecurityUtils;
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
    private SecurityUtils securityUtils;

    public UserController(
            UserService userService,
            SecurityUtils securityUtils) {
        this.userService = userService;
        this.securityUtils = securityUtils;
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

    @GetMapping("/isAdmin")
    public ResponseEntity<GenericResponse<Boolean>> isCurrentUserAdmin() {
        Boolean isAdmin = securityUtils.isCurrentUserAnAdmin();
        return ResponseEntity.ok(
                new GenericResponse<>("Admin status fetched successfully", false, isAdmin)
        );
    }
}
