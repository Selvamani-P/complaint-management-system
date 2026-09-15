package com.examly.springapp.service.service_impl;

import com.examly.springapp.dto.user.UserUpdateRequest;
import com.examly.springapp.exception.BadRequestException;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.model.Complaint;
import com.examly.springapp.model.ComplaintStatus;
import com.examly.springapp.model.Role;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.*;
import com.examly.springapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final ComplaintUpdateRepository complaintUpdateRepository;
    private final NotificationRepository notificationRepository;
    private final AttachmentRepository attachmentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with email: " + email));
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getAllEmployees() {
        return userRepository.findByRole(Role.EMPLOYEE);
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getAllCitizens() {
        return userRepository.findByRole(Role.CITIZEN);
    }

    @Override
    public User updateUser(Long id, User updatedUser) {
        User user = getUserById(id);
        user.setName(updatedUser.getName());
        user.setPhone(updatedUser.getPhone());
        return userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        deleteUserAccount(id, null, true);
    }

    @Override
    public User updateUserProfile(Long id, UserUpdateRequest request, String currentUserEmail, boolean isAdmin) {
        User user = getUserById(id);

        if (!isAdmin && !user.getEmail().equalsIgnoreCase(currentUserEmail)) {
            throw new AccessDeniedException("You do not have permission to update this user profile");
        }

        // Email uniqueness check if email has changed
        if (!user.getEmail().equalsIgnoreCase(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email address is already registered to another account");
            }
            user.setEmail(request.getEmail().trim());
        }

        user.setName(request.getName().trim());
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }

        // Role update logic
        if (request.getRole() != null) {
            if (isAdmin) {
                // Prevent admin from demoting themselves to avoid lockout
                if (user.getEmail().equalsIgnoreCase(currentUserEmail) && request.getRole() != Role.ADMIN) {
                    throw new BadRequestException("You cannot remove your own Administrator privileges");
                }
                user.setRole(request.getRole());
            } else if (request.getRole() != user.getRole()) {
                throw new AccessDeniedException("You cannot modify account role authorization");
            }
        }

        return userRepository.save(user);
    }

    @Override
    public void deleteUserAccount(Long id, String currentUserEmail, boolean isAdmin) {
        User user = getUserById(id);

        if (!isAdmin) {
            if (currentUserEmail == null || !user.getEmail().equalsIgnoreCase(currentUserEmail)) {
                throw new AccessDeniedException("You do not have permission to delete this account");
            }
        } else if (currentUserEmail != null && user.getEmail().equalsIgnoreCase(currentUserEmail)) {
            // Admin deleting themselves via user management
            throw new BadRequestException("Administrators cannot delete their own account from user management");
        }

        // 1. Delete all notifications for this user
        notificationRepository.deleteByUserId(user.getId());

        // 2. Handle complaints filed by this user
        List<Complaint> filedComplaints = complaintRepository.findByComplainant(user);
        for (Complaint c : filedComplaints) {
            complaintUpdateRepository.deleteByComplaint(c);
            attachmentRepository.deleteByComplaint(c);
            complaintRepository.delete(c);
        }

        // 3. Handle complaints assigned to this employee (unassign safely)
        List<Complaint> assignedComplaints = complaintRepository.findByAssignedEmployee(user);
        for (Complaint c : assignedComplaints) {
            c.setAssignedEmployee(null);
            c.setStatus(ComplaintStatus.PENDING);
            complaintRepository.save(c);
        }

        // 4. Delete user record
        userRepository.delete(user);
    }
}