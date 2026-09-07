package com.examly.springapp.controller;

import com.examly.springapp.model.Role;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin("*")
public class UserController {

    private final UserRepository userRepository;

    // ==============================
    // GET ALL USERS
    // ==============================

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ==============================
    // GET ALL EMPLOYEES
    // ==============================

    @GetMapping("/employees")
    public List<User> getEmployees() {

        return userRepository.findByRole(Role.EMPLOYEE);
    }

    // ==============================
    // GET USER BY ID
    // ==============================

    @GetMapping("/{id}")
    public User getUserById(
            @PathVariable Long id) {

        return userRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );
    }
}