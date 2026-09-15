package com.examly.springapp.service.service_impl;

import com.examly.springapp.dto.complaint.ComplaintRequest;
import com.examly.springapp.dto.complaint.ComplaintUpdateRequest;
import com.examly.springapp.exception.BadRequestException;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.model.*;
import com.examly.springapp.repository.AttachmentRepository;
import com.examly.springapp.repository.ComplaintRepository;
import com.examly.springapp.repository.ComplaintUpdateRepository;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.ComplaintService;
import com.examly.springapp.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final ComplaintUpdateRepository complaintUpdateRepository;
    private final NotificationService notificationService;
    private final AttachmentRepository attachmentRepository;

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

        String priority = (request.getPriority() != null && !request.getPriority().isBlank())
                ? request.getPriority().toUpperCase()
                : "MEDIUM";

        Complaint complaint = Complaint.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(priority)
                .complainant(citizen)
                .status(ComplaintStatus.PENDING)
                .submittedAt(LocalDateTime.now())
                .build();

        Complaint saved = complaintRepository.save(complaint);

        // Record history
        ComplaintUpdate update = ComplaintUpdate.builder()
                .complaint(saved)
                .user(citizen)
                .comment("Complaint submitted: " + saved.getTitle())
                .statusChangeFrom(null)
                .statusChangeTo(ComplaintStatus.PENDING.name())
                .timestamp(LocalDateTime.now())
                .build();
        complaintUpdateRepository.save(update);

        // Notify citizen
        notificationService.sendNotification(
                citizen,
                "Your complaint #" + saved.getId() + " has been submitted successfully."
        );

        // Notify admins
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            notificationService.sendNotification(
                    admin,
                    "New complaint #" + saved.getId() + " filed: " + saved.getTitle()
            );
        }

        return saved;
    }

    // =====================================================
    // GET ALL COMPLAINTS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    // =====================================================
    // GET COMPLAINT BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
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
                                "Employee not found with ID: " + employeeId
                        )
                );

        if (employee.getRole() != Role.EMPLOYEE) {
            throw new IllegalArgumentException(
                    "Selected user is not an employee"
            );
        }

        String previousStatus = complaint.getStatus() != null ? complaint.getStatus().name() : "PENDING";
        complaint.setAssignedEmployee(employee);
        complaint.setStatus(ComplaintStatus.ASSIGNED);

        Complaint saved = complaintRepository.save(complaint);

        // Record history
        ComplaintUpdate update = ComplaintUpdate.builder()
                .complaint(saved)
                .user(employee)
                .comment("Assigned to staff: " + employee.getName())
                .statusChangeFrom(previousStatus)
                .statusChangeTo(ComplaintStatus.ASSIGNED.name())
                .timestamp(LocalDateTime.now())
                .build();
        complaintUpdateRepository.save(update);

        // Notify employee
        notificationService.sendNotification(
                employee,
                "You have been assigned to Complaint #" + saved.getId() + ": " + saved.getTitle()
        );

        // Notify citizen
        if (saved.getComplainant() != null) {
            notificationService.sendNotification(
                    saved.getComplainant(),
                    "Your Complaint #" + saved.getId() + " has been assigned to " + employee.getName() + "."
            );
        }

        return saved;
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
        String previousStatus = complaint.getStatus() != null ? complaint.getStatus().name() : "PENDING";

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

            Complaint saved = complaintRepository.save(complaint);

            // Record history
            ComplaintUpdate historyUpdate = ComplaintUpdate.builder()
                    .complaint(saved)
                    .user(saved.getAssignedEmployee() != null ? saved.getAssignedEmployee() : saved.getComplainant())
                    .comment("Status updated from " + previousStatus + " to " + newStatus.name())
                    .statusChangeFrom(previousStatus)
                    .statusChangeTo(newStatus.name())
                    .timestamp(LocalDateTime.now())
                    .build();
            complaintUpdateRepository.save(historyUpdate);

            // Notify citizen
            if (saved.getComplainant() != null) {
                notificationService.sendNotification(
                        saved.getComplainant(),
                        "Your Complaint #" + saved.getId() + " status has changed to " + newStatus.name() + "."
                );
            }

            return saved;

        } catch (IllegalArgumentException e) {

            throw new IllegalArgumentException(
                    "Invalid status value provided: "
                            + status
            );
        }
    }

    // =====================================================
    // UPDATE COMPLAINT (EDIT)
    // =====================================================

    @Override
    public Complaint updateComplaint(
            Long complaintId,
            ComplaintUpdateRequest request,
            String userEmail,
            boolean isAdmin
    ) {
        Complaint complaint = getComplaintById(complaintId);

        if (!isAdmin) {
            // Citizen ownership check
            if (complaint.getComplainant() == null ||
                    !complaint.getComplainant().getEmail().equalsIgnoreCase(userEmail)) {
                throw new AccessDeniedException("You do not have permission to edit this complaint");
            }

            // Cannot edit resolved or closed complaints
            if (complaint.getStatus() == ComplaintStatus.RESOLVED ||
                    complaint.getStatus() == ComplaintStatus.CLOSED) {
                throw new BadRequestException("Cannot edit a complaint that is already " + complaint.getStatus());
            }
        }

        User actingUser = userRepository.findByEmail(userEmail)
                .orElse(complaint.getComplainant());

        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setCategory(request.getCategory());
        if (request.getPriority() != null && !request.getPriority().isBlank()) {
            complaint.setPriority(request.getPriority().toUpperCase());
        }

        Complaint saved = complaintRepository.save(complaint);

        // Record history
        ComplaintUpdate history = ComplaintUpdate.builder()
                .complaint(saved)
                .user(actingUser)
                .comment("Complaint details updated")
                .statusChangeFrom(saved.getStatus() != null ? saved.getStatus().name() : null)
                .statusChangeTo(saved.getStatus() != null ? saved.getStatus().name() : null)
                .timestamp(LocalDateTime.now())
                .build();
        complaintUpdateRepository.save(history);

        // If edited by admin, notify citizen
        if (isAdmin && saved.getComplainant() != null &&
                !saved.getComplainant().getEmail().equalsIgnoreCase(userEmail)) {
            notificationService.sendNotification(
                    saved.getComplainant(),
                    "Your Complaint #" + saved.getId() + " details were updated by Administrator."
            );
        }

        return saved;
    }

    // =====================================================
    // DELETE COMPLAINT
    // =====================================================

    @Override
    public void deleteComplaint(
            Long complaintId,
            String userEmail,
            boolean isAdmin
    ) {
        Complaint complaint = getComplaintById(complaintId);

        if (!isAdmin) {
            // Citizen ownership check
            if (complaint.getComplainant() == null ||
                    !complaint.getComplainant().getEmail().equalsIgnoreCase(userEmail)) {
                throw new AccessDeniedException("You do not have permission to delete this complaint");
            }

            // Citizen cannot delete resolved or closed complaints
            if (complaint.getStatus() == ComplaintStatus.RESOLVED ||
                    complaint.getStatus() == ComplaintStatus.CLOSED) {
                throw new BadRequestException("Cannot delete a complaint that is already " + complaint.getStatus());
            }
        }

        // Clean up child relationships
        complaintUpdateRepository.deleteByComplaint(complaint);
        attachmentRepository.deleteByComplaint(complaint);
        complaintRepository.delete(complaint);
    }

    // =====================================================
    // GET COMPLAINT HISTORY
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<ComplaintUpdate> getComplaintHistory(Long complaintId) {
        Complaint complaint = getComplaintById(complaintId);
        return complaintUpdateRepository.findByComplaintOrderByTimestampAsc(complaint);
    }
}