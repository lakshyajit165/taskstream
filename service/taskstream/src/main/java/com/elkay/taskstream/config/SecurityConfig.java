package com.elkay.taskstream.config;

import com.elkay.taskstream.auth.jwt.CustomAccessDeniedHandler;
import com.elkay.taskstream.auth.jwt.JWTAuthenticationEntryPoint;
import com.elkay.taskstream.auth.jwt.JWTAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JWTAuthenticationFilter jwtAuthenticationFilter;
    private final JWTAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;

    public SecurityConfig(JWTAuthenticationFilter jwtAuthenticationFilter,
                          JWTAuthenticationEntryPoint jwtAuthenticationEntryPoint,
                          CustomAccessDeniedHandler customAccessDeniedHandler) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
        this.customAccessDeniedHandler = customAccessDeniedHandler;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // salt is automatically handled
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // disable CSRF for APIs
                .headers(headers -> headers.frameOptions(frame -> frame.disable())) // allow H2 console frames
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/auth/login", "/api/v1/auth/signup", "/h2-console/**").permitAll()
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(customAccessDeniedHandler)
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
