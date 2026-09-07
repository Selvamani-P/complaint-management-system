package com.examly.springapp.dto.complaint;

import com.examly.springapp.model.ComplaintStatus;
import lombok.Data;

@Data
public class UpdateStatusRequest {
    private ComplaintStatus status;
    private String comment;
}