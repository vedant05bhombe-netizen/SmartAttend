package com.smartattend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClassSectionRequest {
    @NotBlank
    private String name;
    private String department;
    private String year;
}
