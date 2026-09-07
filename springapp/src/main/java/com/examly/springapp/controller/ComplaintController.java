package com.examly.springapp.controller;

import com.examly.springapp.dto.complaint.ComplaintRequest;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.model.Complaint;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.ComplaintRepository;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    // =====================================================
    // CREATE COMPLAINT
    // CITIZEN ONLY
    // =====================================================

    @PostMapping
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<Complaint> createComplaint(
            @Valid @RequestBody ComplaintRequest request,
            Authentication authentication
    ) {

        String userEmail = authentication.getName();

        Complaint complaint =
                complaintService.createComplaint(
                        request,
                        userEmail
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(complaint);
    }

    // =====================================================
    // GET COMPLAINTS
    // =====================================================

    @GetMapping
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'EMPLOYEE', 'CITIZEN')"
    )
    public ResponseEntity<List<Complaint>> getAllComplaints(
            Authentication authentication
    ) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isEmployee = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_EMPLOYEE"));

        if (!isAdmin && !isEmployee) {
            // Citizen: return only their own complaints
            String userEmail = authentication.getName();
            User citizen = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));
            return ResponseEntity.ok(complaintRepository.findByComplainant(citizen));
        }

        return ResponseEntity.ok(
                complaintService.getAllComplaints()
        );
    }

    // =====================================================
    // GET COMPLAINT BY ID (IDOR PROTECTED)
    // =====================================================

    @GetMapping("/{id}")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'EMPLOYEE', 'CITIZEN')"
    )
    public ResponseEntity<Complaint> getComplaintById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Complaint complaint = complaintService.getComplaintById(id);

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isEmployee = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_EMPLOYEE"));

        if (!isAdmin && !isEmployee) {
            // Citizen: can only view own complaint
            if (complaint.getComplainant() == null ||
                    !complaint.getComplainant().getEmail().equalsIgnoreCase(authentication.getName())) {
                throw new AccessDeniedException("You do not have permission to view this complaint");
            }
        }

        return ResponseEntity.ok(complaint);
    }

    // =====================================================
    // ASSIGN COMPLAINT
    // ADMIN ONLY
    // =====================================================

    @PutMapping(
            "/{complaintId}/assign/{employeeId}"
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Complaint> assignComplaint(
            @PathVariable Long complaintId,
            @PathVariable Long employeeId
    ) {

        Complaint complaint =
                complaintService.assignComplaint(
                        complaintId,
                        employeeId
                );

        return ResponseEntity.ok(complaint);
    }

    // =====================================================
    // UPDATE STATUS
    // ADMIN / EMPLOYEE (EMPLOYEE CAN ONLY UPDATE ASSIGNED)
    // =====================================================

    @PutMapping("/{complaintId}/status")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'EMPLOYEE')"
    )
    public ResponseEntity<Complaint> updateStatus(
            @PathVariable Long complaintId,
            @RequestParam String status,
            Authentication authentication
    ) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            // Employee check
            Complaint complaint = complaintService.getComplaintById(complaintId);
            if (complaint.getAssignedEmployee() == null ||
                    !complaint.getAssignedEmployee().getEmail().equalsIgnoreCase(authentication.getName())) {
                throw new AccessDeniedException("Employees can only update complaints assigned to them");
            }
        }

        Complaint complaint =
                complaintService.updateStatus(
                        complaintId,
                        status
                );

        return ResponseEntity.ok(complaint);
    }
}