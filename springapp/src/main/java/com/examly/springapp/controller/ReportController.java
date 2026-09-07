package com.examly.springapp.controller;

import com.examly.springapp.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/summary")
    public Map<String, Long> getSummary() {
        return reportService.getComplaintSummary();
    }

    @GetMapping("/status")
    public Map<String, Long> getStatusReport() {
        return reportService.getStatusReport();
    }

    @GetMapping("/employees")
    public Map<String, Long> getEmployeeReport() {
        return reportService.getEmployeeReport();
    }
}