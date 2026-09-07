package com.examly.springapp.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class PasswordGenerator {

    public static void main(String[] args) {

        BCryptPasswordEncoder encoder =
                new BCryptPasswordEncoder();

        System.out.println(
                "Admin: " +
                        encoder.encode("Admin@123")
        );

        System.out.println(
                "Employee: " +
                        encoder.encode("Employee@123")
        );

        System.out.println(
                "Citizen: " +
                        encoder.encode("Citizen@123")
        );
    }
}