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

        report.put("Total Complaints", (long) complaints.size());

        return report;
    }

    @Override
    public Map<String, Long> getStatusReport() {

        List<Complaint> complaints = complaintRepository.findAll();

        Map<String, Long> report = new HashMap<>();

        report.put(
                "Pending",
                complaints.stream()
                        .filter(c -> c.getStatus().name().equals("PENDING"))
                        .count()
        );

        report.put(
                "Assigned",
                complaints.stream()
                        .filter(c -> c.getStatus().name().equals("ASSIGNED"))
                        .count()
        );

        report.put(
                "Resolved",
                complaints.stream()
                        .filter(c -> c.getStatus().name().equals("RESOLVED"))
                        .count()
        );

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