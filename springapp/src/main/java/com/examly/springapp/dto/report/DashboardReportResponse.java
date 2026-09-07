package com.examly.springapp.dto.report;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardReportResponse {

    private Long totalComplaints;
    private Long pendingComplaints;
    private Long assignedComplaints;
    private Long inProgressComplaints;
    private Long resolvedComplaints;
    private Long closedComplaints;
}