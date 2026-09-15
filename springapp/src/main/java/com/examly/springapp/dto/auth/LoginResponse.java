package com.examly.springapp.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private String token;
    private String role;
    private String name;
    private String email;
    private String message;
    private Long id;
    private String phone;

    public LoginResponse(String token, String role, String name, String email, String message) {
        this.token = token;
        this.role = role;
        this.name = name;
        this.email = email;
        this.message = message;
    }
}