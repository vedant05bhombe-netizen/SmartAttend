package com.smartattend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.Instant;

@Data
@Entity
@Table(name = "attendance")
public class Attendance {
    @Id
    private String id;
    private String orgId;
    private String sessionId;
    private String classSectionId;
    private String studentId;
    private String studentName;
    private String subjectName;
    private double confidence;
    private String status = "PRESENT";
    private Instant markedAt;
}
