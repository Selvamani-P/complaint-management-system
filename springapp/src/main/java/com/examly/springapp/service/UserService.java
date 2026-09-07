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
}