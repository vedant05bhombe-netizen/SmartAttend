package com.smartattend.controller;

import com.smartattend.dto.ApiResponse;
import com.smartattend.dto.SubjectRequest;
import com.smartattend.model.Subject;
import com.smartattend.security.AuthPrincipal;
import com.smartattend.service.SubjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Subject>>> list(@AuthenticationPrincipal AuthPrincipal principal,
                                                             @RequestParam(required = false) String classSectionId) {
        if (classSectionId != null) {
            return ResponseEntity.ok(ApiResponse.ok(service.listBySection(classSectionId)));
        }
        return ResponseEntity.ok(ApiResponse.ok(service.listByOrg(principal.orgId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Subject>> create(@AuthenticationPrincipal AuthPrincipal principal,
                                                         @Valid @RequestBody SubjectRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Subject created", service.create(principal.orgId(), req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }
}
