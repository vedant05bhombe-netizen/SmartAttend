package com.smartattend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.Instant;

@Data
@Entity
@Table(name = "class_sections")
public class ClassSection {
    @Id
    private String id;
    private String orgId;
    private String name;        // e.g. "TY-IT-A"
    private String department;
    private String year;
    private Instant createdAt;
}
