package com.elkay.taskstream.common_utils;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class AccessLogFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(AccessLogFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        long start = System.currentTimeMillis();

        filterChain.doFilter(request, response);

        long duration = System.currentTimeMillis() - start;

        log.info(
                "client_ip: {}, method: {}, path: {}, status_code: {}, time_taken: {} ms",
                /**
                 * In real deployments you often have:
                 * Client → Nginx / API Gateway / Load Balancer → Spring Boot
                 * Then request.getRemoteAddr() gives proxy IP, NOT real client IP
                 * */
                request.getRemoteAddr(),
                request.getMethod(),
                request.getRequestURI(),
                response.getStatus(),
                duration
        );
    }
}