package com.smartattend.controller;

import com.smartattend.dto.ApiResponse;
import com.smartattend.model.ClassSection;
import com.smartattend.model.Organization;
import com.smartattend.repository.ClassSectionRepository;
import com.smartattend.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Unauthenticated endpoints needed before a user has a JWT (e.g. during signup). */
@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class PublicController {

    private final OrganizationRepository orgRepo;
    private final ClassSectionRepository classSectionRepo;

    @GetMapping("/org")
    public ResponseEntity<ApiResponse<Map<String, String>>> lookupOrg(@RequestParam String code) {
        Organization org = orgRepo.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Invalid organization code"));
        return ResponseEntity.ok(ApiResponse.ok(Map.of("id", org.getId(), "name", org.getName())));
    }

    @GetMapping("/class-sections")
    public ResponseEntity<ApiResponse<List<ClassSection>>> classSections(@RequestParam String orgCode) {
        Organization org = orgRepo.findByCode(orgCode)
                .orElseThrow(() -> new IllegalArgumentException("Invalid organization code"));
        return ResponseEntity.ok(ApiResponse.ok(classSectionRepo.findByOrgId(org.getId())));
    }
}
