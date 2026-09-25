package com.smartattend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.Instant;

/** A single lecture/class session during which attendance can be marked. */
@Data
@Entity
@Table(name = "sessions")
public class Session {
    @Id
    private String id;
    private String orgId;
    private String classSectionId;
    private String subjectId;
    private String subjectName;
    private String startedByAdminId;
    private Instant startTime;
    private Instant endTime;
    private boolean active = true;
}
