package com.examly.springapp.service;

import com.examly.springapp.dto.auth.LoginRequest;
import com.examly.springapp.dto.auth.LoginResponse;
import com.examly.springapp.dto.auth.RegisterRequest;

public interface AuthService {

    String register(RegisterRequest request);

    LoginResponse login(LoginRequest request);
}