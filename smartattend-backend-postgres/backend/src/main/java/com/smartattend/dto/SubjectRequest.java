package com.smartattend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubjectRequest {
    @NotBlank
    private String name;
    private String code;
    @NotBlank
    private String classSectionId;
}
