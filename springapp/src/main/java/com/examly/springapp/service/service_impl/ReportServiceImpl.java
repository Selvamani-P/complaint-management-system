package com.examly.springapp.service.service_impl;

import com.examly.springapp.model.Complaint;
import com.examly.springapp.repository.ComplaintRepository;
import com.examly.springapp.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ComplaintRepository complaintRepository;

    @Override
    public Map<String, Long> getComplaintSummary() {

        List<Complaint> complaints = complaintRepository.findAll();

        Map<String, Long> report = new HashMap<>();

        long total = complaints.size();
        report.put("Total Complaints", total);
        report.put("total", total);

        return report;
    }

    @Override
    public Map<String, Long> getStatusReport() {

        List<Complaint> complaints = complaintRepository.findAll();

        Map<String, Long> report = new HashMap<>();

        long pending = complaints.stream().filter(c -> c.getStatus() != null && c.getStatus().name().equals("PENDING")).count();
        long assigned = complaints.stream().filter(c -> c.getStatus() != null && c.getStatus().name().equals("ASSIGNED")).count();
        long inProgress = complaints.stream().filter(c -> c.getStatus() != null && c.getStatus().name().equals("IN_PROGRESS")).count();
        long resolved = complaints.stream().filter(c -> c.getStatus() != null && c.getStatus().name().equals("RESOLVED")).count();
        long closed = complaints.stream().filter(c -> c.getStatus() != null && c.getStatus().name().equals("CLOSED")).count();

        report.put("Pending", pending);
        report.put("PENDING", pending);

        report.put("Assigned", assigned);
        report.put("ASSIGNED", assigned);

        report.put("In Progress", inProgress);
        report.put("IN_PROGRESS", inProgress);

        report.put("Resolved", resolved);
        report.put("RESOLVED", resolved);

        report.put("Closed", closed);
        report.put("CLOSED", closed);

        return report;
    }

    @Override
    public Map<String, Long> getEmployeeReport() {

        List<Complaint> complaints = complaintRepository.findAll();

        Map<String, Long> report = new HashMap<>();

        complaints.stream()
                .filter(c -> c.getAssignedEmployee() != null)
                .forEach(c -> {
                    String employee =
                            c.getAssignedEmployee().getName();

                    report.put(
                            employee,
                            report.getOrDefault(employee, 0L) + 1
                    );
                });

        return report;
    }
}