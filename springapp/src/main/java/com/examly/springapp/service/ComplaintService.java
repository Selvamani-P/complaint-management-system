package com.examly.springapp.service;

import com.examly.springapp.dto.complaint.ComplaintRequest;
import com.examly.springapp.model.Complaint;

import java.util.List;

public interface ComplaintService {

    Complaint createComplaint(
            ComplaintRequest request,
            String userEmail
    );

    List<Complaint> getAllComplaints();

    Complaint getComplaintById(Long id);

    Complaint assignComplaint(
            Long complaintId,
            Long employeeId
    );

    Complaint updateStatus(
            Long complaintId,
            String status
    );

    Complaint updateComplaint(
            Long complaintId,
            com.examly.springapp.dto.complaint.ComplaintUpdateRequest request,
            String userEmail,
            boolean isAdmin
    );

    void deleteComplaint(
            Long complaintId,
            String userEmail,
            boolean isAdmin
    );

    List<com.examly.springapp.model.ComplaintUpdate> getComplaintHistory(Long complaintId);
}