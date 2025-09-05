package com.elkay.taskstream.auth.jwt;

import com.elkay.taskstream.auth.model.Role;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.MacAlgorithm;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;
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

    public Long extractUserId(String authHeader) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(authHeader.replace("Bearer ", ""))
                .getPayload()
                .get("userId", Long.class);
    }
}
