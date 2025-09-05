package com.elkay.taskstream.auth.service;

import com.elkay.taskstream.auth.jwt.JWTUtil;
import com.elkay.taskstream.auth.model.Role;
import com.elkay.taskstream.auth.model.User;
import com.elkay.taskstream.auth.payload.LoginRequest;
import com.elkay.taskstream.auth.payload.SignupRequest;
import com.elkay.taskstream.auth.repository.RoleRepository;
import com.elkay.taskstream.auth.repository.UserRepository;
import com.elkay.taskstream.config.AdminConfig;
import com.elkay.taskstream.exception.BadRequestException;
import com.elkay.taskstream.exception.InternalServerError;
import com.elkay.taskstream.exception.ResourceAlreadyExistsException;
import com.elkay.taskstream.exception.ResourceNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTUtil jwtUtil;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, JWTUtil jwtUtil) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Checks if the user already exists
     * if not, saves the user with appropriate role
     * and returns a success message
     * */
    public String signup(SignupRequest signupRequest) {
        // Check if user already exists
        userRepository.findByEmail(signupRequest.getEmail()).ifPresent(u -> {
            throw new ResourceAlreadyExistsException("User email already exists");
        });

        // Encode password
        String encodedPassword = passwordEncoder.encode(signupRequest.getPassword());
        User user = new User(signupRequest.getName(),
                signupRequest.getEmail(),
                encodedPassword);

        // Determine role
        long roleId;
        if (AdminConfig.ADMIN_EMAILS.contains(signupRequest.getEmail())) {
            // Admin
            roleId = 2L; // assuming ROLE_ADMIN seeded with ID 2
        } else {
            // Regular user
            roleId = 1L; // ROLE_USER seeded with ID 1
        }

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role to be assigned could not be found"));

        user.addRole(role);

        userRepository.save(user);
        return "User registered successfully";
    }

    /**
     * Checks if the password is valid
     * if yes, logs the user in and returns a jwt token
     * */
    public String login(LoginRequest loginRequest) {
        // Fetch user by email
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User email not found"));

        // Validate password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new BadRequestException("Password doesn't match");
        }

        // Generate JWT token
        Set<Role> roles = user.getRoles();
        return jwtUtil.generateToken(user.getId(), user.getEmail(), roles);
    }
}
