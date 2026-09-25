package com.smartattend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MarkAttendanceRequest {
    @NotBlank
    private String sessionId;
    @NotBlank
    private String studentId;
    private double confidence;
}
