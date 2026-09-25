package com.smartattend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StartSessionRequest {
    @NotBlank
    private String classSectionId;
    @NotBlank
    private String subjectId;
}
