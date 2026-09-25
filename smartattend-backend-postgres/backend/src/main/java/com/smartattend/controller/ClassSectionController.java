package com.smartattend.controller;

import com.smartattend.dto.ApiResponse;
import com.smartattend.dto.ClassSectionRequest;
import com.smartattend.model.ClassSection;
import com.smartattend.security.AuthPrincipal;
import com.smartattend.service.ClassSectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/class-sections")
@RequiredArgsConstructor
public class ClassSectionController {

    private final ClassSectionService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClassSection>>> list(@AuthenticationPrincipal AuthPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(service.listByOrg(principal.orgId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ClassSection>> create(@AuthenticationPrincipal AuthPrincipal principal,
                                                              @Valid @RequestBody ClassSectionRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Class section created", service.create(principal.orgId(), req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }
}
