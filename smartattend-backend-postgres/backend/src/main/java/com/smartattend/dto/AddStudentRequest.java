package com.smartattend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Used by an admin to add a student directly (student can set/reset password on first login page too). */
@Data
public class AddStudentRequest {
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
