package com.examly.springapp.repository;

import com.examly.springapp.model.Complaint;
import com.examly.springapp.model.ComplaintUpdate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintUpdateRepository extends JpaRepository<ComplaintUpdate, Long> {

    List<ComplaintUpdate> findByComplaint(Complaint complaint);
}