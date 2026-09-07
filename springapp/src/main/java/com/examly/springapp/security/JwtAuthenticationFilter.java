package com.examly.springapp.security;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;

import org.jspecify.annotations.NonNull;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String requestUri = request.getRequestURI();

        System.out.println("====================================");
        System.out.println("Request URI: " + requestUri);

        // =====================================================
        // SKIP JWT FOR LOGIN AND REGISTER
        // =====================================================

        if (requestUri.equals("/api/auth/login")
                || requestUri.equals("/api/auth/register")) {

            System.out.println("Skipping JWT authentication for auth endpoint");

            filterChain.doFilter(request, response);
            return;
        }

        // =====================================================
        // GET AUTHORIZATION HEADER
        // =====================================================

        final String authHeader =
                request.getHeader("Authorization");

        System.out.println(
                "Authorization Header: [" + authHeader + "]"
        );

        // =====================================================
        // NO TOKEN
        // =====================================================

        if (authHeader == null
                || !authHeader.startsWith("Bearer ")) {

            System.out.println("No JWT token found");

            filterChain.doFilter(request, response);
            return;
        }

        // =====================================================
        // EXTRACT TOKEN
        // =====================================================

        String jwt = authHeader.substring(7);

        System.out.println("JWT Token received");

        String email;

        try {

            email = jwtService.extractUsername(jwt);

            System.out.println("JWT Email: " + email);

        } catch (Exception e) {

            System.out.println(
                    "JWT Parsing Error: " + e.getMessage()
            );

            filterChain.doFilter(request, response);
            return;
        }

        // =====================================================
        // AUTHENTICATE USER
        // =====================================================

        if (email != null
                && SecurityContextHolder
                .getContext()
                .getAuthentication() == null) {

            try {

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(email);

                if (jwtService.isTokenValid(
                        jwt,
                        userDetails)) {

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authToken);

                    System.out.println(
                            "JWT Authentication successful for: "
                                    + email
                    );

                } else {

                    System.out.println(
                            "JWT token is invalid"
                    );
                }

            } catch (Exception e) {

                System.out.println(
                        "Authentication Error: "
                                + e.getMessage()
                );
            }
        }

        // =====================================================
        // CONTINUE REQUEST
        // =====================================================

        filterChain.doFilter(request, response);
    }
}