package com.examly.springapp.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "complaint_updates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Complaint complaint;

    @ManyToOne
    private User user;

    @Column(columnDefinition = "TEXT")
    private String comment;

    private String statusChangeFrom;

    private String statusChangeTo;

    private LocalDateTime timestamp;
}