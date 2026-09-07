package com.examly.springapp.repository;

import com.examly.springapp.model.Complaint;
import com.examly.springapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository
        extends JpaRepository<Complaint, Long> {

    List<Complaint> findByComplainant(User complainant);

    List<Complaint> findByAssignedEmployee(
            User assignedEmployee
    );
}