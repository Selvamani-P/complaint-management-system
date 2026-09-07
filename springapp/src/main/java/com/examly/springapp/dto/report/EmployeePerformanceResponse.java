package com.examly.springapp.dto.report;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmployeePerformanceResponse {

    private Long employeeId;
    private String employeeName;
    private Long resolvedCount;
}