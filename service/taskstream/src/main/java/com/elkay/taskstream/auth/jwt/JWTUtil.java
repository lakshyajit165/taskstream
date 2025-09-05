package com.elkay.taskstream.auth.jwt;

import com.elkay.taskstream.auth.model.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.MacAlgorithm;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class JWTUtil {
    private final MacAlgorithm signatureAlgorithm = Jwts.SIG.HS256;
    private final SecretKey secretKey = signatureAlgorithm.key().build();

    public String generateToken(Long userId, String email, Set<Role> roles) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + 3600_000); // 1 hour

        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("roles", roles.stream().map(Role::getName).collect(Collectors.toList()))
                .issuedAt(now)
                .expiration(expiration)
                .signWith(secretKey, signatureAlgorithm)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            getAllClaims(token); // just try parsing, will throw if invalid
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    /**
     * Extract relevant details from the token
     * */

    private Claims getAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long extractUserId(String token) {
        return getAllClaims(token).get("userId", Long.class);
    }

    public String extractEmail(String token) {
        return getAllClaims(token).getSubject();
    }

    public List<String> extractRoles(String token) {
        return getAllClaims(token).get("roles", List.class);
    }
}
