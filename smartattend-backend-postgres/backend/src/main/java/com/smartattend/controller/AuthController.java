package com.smartattend.controller;

import com.smartattend.dto.*;
import com.smartattend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/org/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> orgSignup(@Valid @RequestBody OrgSignupRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Organization created", authService.signupOrg(req)));
    }

    @PostMapping("/admin/join")
    public ResponseEntity<ApiResponse<AuthResponse>> adminJoin(@Valid @RequestBody AdminJoinRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Admin joined", authService.joinAdmin(req)));
    }

    @PostMapping("/student/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> studentSignup(@Valid @RequestBody StudentSignupRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Student registered", authService.signupStudent(req)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Login successful", authService.login(req)));
    }
}
