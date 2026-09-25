package com.smartattend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.Instant;

@Data
@Entity
@Table(name = "organizations")
public class Organization {
    @Id
    private String id;
    private String name;
    @Column(unique = true)
    private String code;      // unique join code, shared with admins & students
    private String email;
    private Instant createdAt;
}
