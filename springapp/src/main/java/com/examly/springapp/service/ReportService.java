package com.examly.springapp.service;

import java.util.Map;

public interface ReportService {

    Map<String, Long> getComplaintSummary();

    Map<String, Long> getStatusReport();

    Map<String, Long> getEmployeeReport();
}