package com.examly.springapp.controller;

import com.examly.springapp.dto.complaint.ComplaintRequest;
import com.examly.springapp.model.Complaint;
import com.examly.springapp.service.ComplaintService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ComplaintController {

    private final ComplaintService complaintService;

    // =====================================================
    // CREATE COMPLAINT
    // CITIZEN ONLY
    // =====================================================

    @PostMapping
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<Complaint> createComplaint(
            @RequestBody ComplaintRequest request,
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
    public ResponseEntity<List<Complaint>> getAllComplaints() {

        return ResponseEntity.ok(
                complaintService.getAllComplaints()
        );
    }

    // =====================================================
    // GET COMPLAINT BY ID
    // =====================================================

    @GetMapping("/{id}")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'EMPLOYEE', 'CITIZEN')"
    )
    public ResponseEntity<Complaint> getComplaintById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                complaintService.getComplaintById(id)
        );
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
    // ADMIN / EMPLOYEE
    // =====================================================

    @PutMapping("/{complaintId}/status")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'EMPLOYEE')"
    )
    public ResponseEntity<Complaint> updateStatus(
            @PathVariable Long complaintId,
            @RequestParam String status
    ) {

        Complaint complaint =
                complaintService.updateStatus(
                        complaintId,
                        status
                );

        return ResponseEntity.ok(complaint);
    }
}