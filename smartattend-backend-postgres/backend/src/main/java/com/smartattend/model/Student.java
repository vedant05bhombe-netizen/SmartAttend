package com.smartattend.model;

import jakarta.persistence.Column;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "students")
public class Student {
    @Id
    private String id;
    private String orgId;
    private String classSectionId;
    private String name;
    @Column(unique = true)
    private String email;
    private String password;
    private String rollNo;
    @Enumerated(EnumType.STRING)
    private Role role = Role.STUDENT;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "student_face_encodings", joinColumns = @JoinColumn(name = "student_id"))
    @Column(name = "encoding", columnDefinition = "TEXT")
    private List<String> faceEncodings = new ArrayList<>();

    private boolean faceRegistered;
    private Instant createdAt;
}