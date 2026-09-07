package com.examly.springapp.controller;

import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.model.Role;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    // ==============================
    // GET ALL USERS (ADMIN ONLY)
    // ==============================

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // ==============================
    // GET ALL EMPLOYEES (ADMIN / EMPLOYEE)
    // ==============================

    @GetMapping("/employees")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<User>> getEmployees() {
        return ResponseEntity.ok(userRepository.findByRole(Role.EMPLOYEE));
    }

    // ==============================
    // GET USER BY ID (SELF OR ADMIN)
    // ==============================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CITIZEN')")
    public ResponseEntity<User> getUserById(
            @PathVariable Long id,
            Authentication authentication) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !user.getEmail().equalsIgnoreCase(authentication.getName())) {
            throw new AccessDeniedException("You do not have permission to access this user profile");
        }

        return ResponseEntity.ok(user);
    }
}