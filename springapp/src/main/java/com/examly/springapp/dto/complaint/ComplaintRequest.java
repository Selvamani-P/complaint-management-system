package com.examly.springapp.dto.complaint;

import lombok.Data;

@Data
public class ComplaintRequest {

    private String title;

    private String description;

    private String category;

    private String email;
}