package com.smartattend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StudentSignupRequest {
    @NotBlank
    private String orgCode;
    @NotBlank
    private String classSectionId;
    @NotBlank
    private String name;
    @NotBlank @Email
    private String email;
    @NotBlank
    private String password;
    @NotBlank
    private String rollNo;
}
