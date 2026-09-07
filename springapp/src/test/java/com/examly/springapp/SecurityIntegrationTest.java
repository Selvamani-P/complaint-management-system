package com.examly.springapp;

import com.examly.springapp.dto.auth.LoginRequest;
import com.examly.springapp.dto.auth.RegisterRequest;
import com.examly.springapp.dto.complaint.ComplaintRequest;
import com.examly.springapp.model.Complaint;
import com.examly.springapp.model.ComplaintStatus;
import com.examly.springapp.model.Role;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.ComplaintRepository;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private User citizen1;
    private User citizen2;
    private User employee1;
    private User employee2;
    private User admin;

    private String citizen1Token;
    private String citizen2Token;
    private String employee1Token;
    private String adminToken;

    @BeforeEach
    void setUp() {
        complaintRepository.deleteAll();
        userRepository.deleteAll();

        // Create Users
        citizen1 = userRepository.save(User.builder()
                .name("Citizen One")
                .email("citizen1@example.com")
                .password(passwordEncoder.encode("Password123"))
                .role(Role.CITIZEN)
                .createdAt(LocalDateTime.now())
                .build());

        citizen2 = userRepository.save(User.builder()
                .name("Citizen Two")
                .email("citizen2@example.com")
                .password(passwordEncoder.encode("Password123"))
                .role(Role.CITIZEN)
                .createdAt(LocalDateTime.now())
                .build());

        employee1 = userRepository.save(User.builder()
                .name("Employee One")
                .email("employee1@example.com")
                .password(passwordEncoder.encode("Password123"))
                .role(Role.EMPLOYEE)
                .createdAt(LocalDateTime.now())
                .build());

        employee2 = userRepository.save(User.builder()
                .name("Employee Two")
                .email("employee2@example.com")
                .password(passwordEncoder.encode("Password123"))
                .role(Role.EMPLOYEE)
                .createdAt(LocalDateTime.now())
                .build());

        admin = userRepository.save(User.builder()
                .name("Admin User")
                .email("admin@example.com")
                .password(passwordEncoder.encode("Password123"))
                .role(Role.ADMIN)
                .createdAt(LocalDateTime.now())
                .build());

        // Generate Tokens
        citizen1Token = generateToken(citizen1);
        citizen2Token = generateToken(citizen2);
        employee1Token = generateToken(employee1);
        adminToken = generateToken(admin);
    }

    private String generateToken(User user) {
        org.springframework.security.core.userdetails.UserDetails userDetails =
                org.springframework.security.core.userdetails.User.builder()
                        .username(user.getEmail())
                        .password(user.getPassword())
                        .roles(user.getRole().name())
                        .build();
        return jwtService.generateToken(userDetails);
    }

    // =========================================================================
    // 1. AUTHENTICATION & REGISTRATION
    // =========================================================================

    @Test
    void testSuccessfulLoginReturnsTokenAndMasksPassword() throws Exception {
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("citizen1@example.com");
        loginReq.setPassword("Password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.role", is("CITIZEN")))
                .andExpect(jsonPath("$.email", is("citizen1@example.com")))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void testInvalidLoginCredentialsReturnsUnauthorized() throws Exception {
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("citizen1@example.com");
        loginReq.setPassword("WrongPassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error", containsString("Invalid email or password")));
    }

    @Test
    void testRegistrationValidationFailure() throws Exception {
        RegisterRequest regReq = new RegisterRequest();
        regReq.setName("");
        regReq.setEmail("invalid-email");
        regReq.setPassword("123"); // < 6 chars

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("Validation failed")))
                .andExpect(jsonPath("$.errors", notNullValue()));
    }

    // =========================================================================
    // 2. ROLE AUTHORIZATION
    // =========================================================================

    @Test
    void testCitizenForbiddenFromAccessingUserManagement() throws Exception {
        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAdminCanAccessUserManagement() throws Exception {
        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(5)))
                // Verify passwords are NOT exposed in user listings
                .andExpect(jsonPath("$[0].password").doesNotExist());
    }

    @Test
    void testCitizenForbiddenFromReports() throws Exception {
        mockMvc.perform(get("/api/reports/summary")
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isForbidden());
    }

    // =========================================================================
    // 3. IDOR PROTECTION (COMPLAINTS)
    // =========================================================================

    @Test
    void testCitizenCannotViewAnotherCitizensComplaint() throws Exception {
        // Save complaint owned by citizen2
        Complaint c2 = complaintRepository.save(Complaint.builder()
                .title("Citizen 2 Secret Issue")
                .description("Sensitive citizen 2 complaint description")
                .category("INFRASTRUCTURE")
                .status(ComplaintStatus.PENDING)
                .complainant(citizen2)
                .submittedAt(LocalDateTime.now())
                .build());

        // Citizen1 tries to view Citizen2's complaint -> 403 Forbidden
        mockMvc.perform(get("/api/complaints/" + c2.getId())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", containsString("permission")));

        // Citizen2 views their own complaint -> 200 OK
        mockMvc.perform(get("/api/complaints/" + c2.getId())
                        .header("Authorization", "Bearer " + citizen2Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Citizen 2 Secret Issue")));
    }

    @Test
    void testCitizenGetAllComplaintsReturnsOnlyOwnComplaints() throws Exception {
        // Create 1 complaint for citizen1 and 1 for citizen2
        complaintRepository.save(Complaint.builder()
                .title("Complaint for Citizen 1")
                .description("Description for citizen 1")
                .category("SERVICE")
                .status(ComplaintStatus.PENDING)
                .complainant(citizen1)
                .submittedAt(LocalDateTime.now())
                .build());

        complaintRepository.save(Complaint.builder()
                .title("Complaint for Citizen 2")
                .description("Description for citizen 2")
                .category("SERVICE")
                .status(ComplaintStatus.PENDING)
                .complainant(citizen2)
                .submittedAt(LocalDateTime.now())
                .build());

        // Citizen1 only gets their 1 complaint
        mockMvc.perform(get("/api/complaints")
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Complaint for Citizen 1")));

        // Admin gets both
        mockMvc.perform(get("/api/complaints")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    // =========================================================================
    // 4. STATUS UPDATE AUTHORIZATION
    // =========================================================================

    @Test
    void testEmployeeCannotUpdateUnassignedComplaintStatus() throws Exception {
        // Complaint assigned to employee2
        Complaint c = complaintRepository.save(Complaint.builder()
                .title("Assigned to Emp 2")
                .description("Description of assigned task")
                .category("SERVICE")
                .status(ComplaintStatus.ASSIGNED)
                .complainant(citizen1)
                .assignedEmployee(employee2)
                .submittedAt(LocalDateTime.now())
                .build());

        // Employee1 tries to update status -> 403 Forbidden
        mockMvc.perform(put("/api/complaints/" + c.getId() + "/status")
                        .header("Authorization", "Bearer " + employee1Token)
                        .param("status", "IN_PROGRESS"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", containsString("assigned to them")));

        // Admin can update status -> 200 OK
        mockMvc.perform(put("/api/complaints/" + c.getId() + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("status", "IN_PROGRESS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("IN_PROGRESS")));
    }

    @Test
    void testInvalidStatusUpdateReturnsBadRequest() throws Exception {
        Complaint c = complaintRepository.save(Complaint.builder()
                .title("Valid Complaint")
                .description("Description for status test")
                .category("SERVICE")
                .status(ComplaintStatus.ASSIGNED)
                .complainant(citizen1)
                .assignedEmployee(employee1)
                .submittedAt(LocalDateTime.now())
                .build());

        mockMvc.perform(put("/api/complaints/" + c.getId() + "/status")
                        .header("Authorization", "Bearer " + employee1Token)
                        .param("status", "NON_EXISTENT_STATUS"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", containsString("Invalid status value")));
    }
}
