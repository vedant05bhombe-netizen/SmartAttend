package com.smartattend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.Instant;

@Data
@Entity
@Table(name = "subjects")
public class Subject {
    @Id
    private String id;
    private String orgId;
    private String name;
    private String code;
    private String classSectionId;
    private Instant createdAt;
}
