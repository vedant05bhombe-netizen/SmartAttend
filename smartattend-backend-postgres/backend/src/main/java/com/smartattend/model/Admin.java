package com.smartattend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.Instant;

@Data
@Entity
@Table(name = "admins")
public class Admin {
    @Id
    private String id;
    private String name;
    @Column(unique = true)
    private String email;
    private String password;
    private String orgId;
    @Enumerated(EnumType.STRING)
    private Role role = Role.ADMIN;
    private boolean owner;
    private Instant createdAt;
}
