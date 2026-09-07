package com.examly.springapp.repository;

import com.examly.springapp.model.Attachment;
import com.examly.springapp.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    List<Attachment> findByComplaint(Complaint complaint);
}