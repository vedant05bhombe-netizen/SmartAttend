package com.smartattend.controller;

import com.smartattend.dto.ApiResponse;
import com.smartattend.dto.MarkAttendanceRequest;
import com.smartattend.model.Attendance;
import com.smartattend.security.AuthPrincipal;
import com.smartattend.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService service;

    // used by the FastAPI face service once a face is confidently matched
    @PostMapping("/face/mark")
    public ResponseEntity<ApiResponse<Attendance>> markFromFace(@Valid @RequestBody MarkAttendanceRequest req) {
        Optional<Attendance> saved = service.markFromFace(req);
        if (saved.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("Attendance already marked for this session"));
        }
        return ResponseEntity.ok(ApiResponse.ok("Attendance marked", saved.get()));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<ApiResponse<List<Attendance>>> bySession(@PathVariable String sessionId) {
        return ResponseEntity.ok(ApiResponse.ok(service.bySession(sessionId)));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<Attendance>>> byStudent(@PathVariable String studentId) {
        return ResponseEntity.ok(ApiResponse.ok(service.byStudent(studentId)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<Attendance>>> mine(@AuthenticationPrincipal AuthPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(service.byStudent(principal.id())));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Attendance>>> byOrg(@AuthenticationPrincipal AuthPrincipal principal,
                                                                 @RequestParam(required = false) String classSectionId) {
        if (classSectionId != null) {
            return ResponseEntity.ok(ApiResponse.ok(service.bySection(classSectionId)));
        }
        return ResponseEntity.ok(ApiResponse.ok(service.byOrg(principal.orgId())));
    }
}
