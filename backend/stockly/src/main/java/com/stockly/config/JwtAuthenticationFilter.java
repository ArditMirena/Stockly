package com.stockly.config;

import com.stockly.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final HandlerExceptionResolver handlerExceptionResolver;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserDetailsService userDetailsService,
            HandlerExceptionResolver handlerExceptionResolver
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.handlerExceptionResolver = handlerExceptionResolver;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getServletPath();

        if (path.startsWith("/api/v1/auth") &&
                (path.equals("/api/v1/auth/login") ||
                        path.equals("/api/v1/auth/signup") ||
                        path.equals("/api/v1/auth/refresh") ||
                        path.equals("/api/v1/auth/verify") ||
                        path.equals("/api/v1/auth/resend"))) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = extractJwtFromHeader(request);

        if (token == null) {
            token = extractJwtFromCookie(request);
        }

        if (token != null) {
            try {
                final String userEmail = jwtService.extractUsername(token);

                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

                if (userEmail != null && authentication == null) {
                    UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                    // Enhanced validation - check if token is valid and user account is in good standing
                    if (jwtService.isTokenValid(token, userDetails) &&
                            userDetails.isEnabled() &&
                            userDetails.isAccountNonExpired() &&
                            userDetails.isAccountNonLocked() &&
                            userDetails.isCredentialsNonExpired()) {

                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    } else {
                        // Clear any existing authentication and return unauthorized
                        SecurityContextHolder.clearContext();
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"error\":\"Invalid or expired token\"}");
                        return;
                    }
                }
            } catch (Exception exception) {
                SecurityContextHolder.clearContext();
                handlerExceptionResolver.resolveException(request, response, null, exception);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractJwtFromHeader(HttpServletRequest request) {
        final String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    private String extractJwtFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("accessToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
