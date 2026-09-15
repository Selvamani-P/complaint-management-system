package com.examly.springapp.service;

import com.examly.springapp.model.User;

import java.util.List;

public interface UserService {

    List<User> getAllUsers();

    User getUserById(Long id);

    List<User> getAllEmployees();

    List<User> getAllCitizens();

    User updateUser(Long id, User updatedUser);

    void deleteUser(Long id);

    User getUserByEmail(String email);

    User updateUserProfile(Long id, com.examly.springapp.dto.user.UserUpdateRequest request, String currentUserEmail, boolean isAdmin);

    void deleteUserAccount(Long id, String currentUserEmail, boolean isAdmin);
}