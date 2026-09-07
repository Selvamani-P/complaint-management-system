package com.examly.springapp.dto.complaint;

import com.examly.springapp.model.ComplaintStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ComplaintResponse {

    private Long id;
    private String title;
    private String description;
    private String category;

    private String complainantName;
    private String assignedEmployeeName;

    private ComplaintStatus status;

    private LocalDateTime submittedAt;
    private LocalDateTime resolvedAt;
}