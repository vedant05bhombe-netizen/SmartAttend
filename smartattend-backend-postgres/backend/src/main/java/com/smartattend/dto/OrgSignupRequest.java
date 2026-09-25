package com.smartattend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrgSignupRequest {
    @NotBlank
    private String orgName;
    @NotBlank
    private String adminName;
    @NotBlank @Email
    private String email;
    @NotBlank
    private String password;
}
