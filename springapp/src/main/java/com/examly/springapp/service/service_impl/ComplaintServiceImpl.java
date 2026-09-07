package com.examly.springapp.service.service_impl;

import com.examly.springapp.dto.complaint.ComplaintRequest;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.model.Complaint;
import com.examly.springapp.model.ComplaintStatus;
import com.examly.springapp.model.Role;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.ComplaintRepository;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    // =====================================================
    // CREATE COMPLAINT
    // =====================================================

    @Override
    public Complaint createComplaint(
            ComplaintRequest request,
            String userEmail
    ) {

        User citizen = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: " + userEmail
                        )
                );

        Complaint complaint = Complaint.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .complainant(citizen)
                .status(ComplaintStatus.PENDING)
                .submittedAt(LocalDateTime.now())
                .build();

        return complaintRepository.save(complaint);
    }

    // =====================================================
    // GET ALL COMPLAINTS
    // =====================================================

    @Override
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    // =====================================================
    // GET COMPLAINT BY ID
    // =====================================================

    @Override
    public Complaint getComplaintById(Long id) {

        return complaintRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Complaint not found with ID: " + id
                        )
                );
    }

    // =====================================================
    // ASSIGN COMPLAINT
    // =====================================================

    @Override
    public Complaint assignComplaint(
            Long complaintId,
            Long employeeId
    ) {

        Complaint complaint = getComplaintById(complaintId);

        User employee = userRepository.findById(employeeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found with ID: "
                                        + employeeId
                        )
                );

        if (employee.getRole() != Role.EMPLOYEE) {
            throw new IllegalArgumentException(
                    "Selected user is not an employee"
            );
        }

        complaint.setAssignedEmployee(employee);
        complaint.setStatus(ComplaintStatus.ASSIGNED);

        return complaintRepository.save(complaint);
    }

    // =====================================================
    // UPDATE STATUS
    // =====================================================

    @Override
    public Complaint updateStatus(
            Long complaintId,
            String status
    ) {

        Complaint complaint = getComplaintById(complaintId);

        try {

            ComplaintStatus newStatus =
                    ComplaintStatus.valueOf(
                            status.toUpperCase()
                    );

            complaint.setStatus(newStatus);

            if (newStatus == ComplaintStatus.RESOLVED) {
                complaint.setResolvedAt(
                        LocalDateTime.now()
                );
            }

        } catch (IllegalArgumentException e) {

            throw new IllegalArgumentException(
                    "Invalid status value provided: "
                            + status
            );
        }

        return complaintRepository.save(complaint);
    }
}