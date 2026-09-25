package com.smartattend.controller;

import com.smartattend.dto.AddStudentRequest;
import com.smartattend.dto.ApiResponse;
import com.smartattend.dto.FaceEncodingRequest;
import com.smartattend.model.Student;
import com.smartattend.security.AuthPrincipal;
import com.smartattend.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService service;

    // ---- used by the FastAPI face-recognition service ----

    @GetMapping("/admin/face/org/{orgId}")
    public ResponseEntity<ApiResponse<List<Student>>> forFaceMatching(@PathVariable String orgId) {
        return ResponseEntity.ok(ApiResponse.ok(service.listByOrg(orgId)));
    }

    @PatchMapping("/admin/{studentId}/face-encoding")
    public ResponseEntity<ApiResponse<Student>> saveFaceEncoding(@PathVariable String studentId,
                                                                   @RequestBody FaceEncodingRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Face encoding saved", service.saveFaceEncodings(studentId, req.getEncodings())));
    }

    // ---- used by the admin / student frontend ----

    @GetMapping
    public ResponseEntity<ApiResponse<List<Student>>> list(@AuthenticationPrincipal AuthPrincipal principal,
                                                             @RequestParam(required = false) String classSectionId) {
        if (classSectionId != null) {
            return ResponseEntity.ok(ApiResponse.ok(service.listBySection(classSectionId)));
        }
        return ResponseEntity.ok(ApiResponse.ok(service.listByOrg(principal.orgId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Student>> add(@AuthenticationPrincipal AuthPrincipal principal,
                                                      @Valid @RequestBody AddStudentRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Student added", service.add(principal.orgId(), req)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Student>> me(@AuthenticationPrincipal AuthPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(service.get(principal.id())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Student>> get(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(service.get(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }
}
