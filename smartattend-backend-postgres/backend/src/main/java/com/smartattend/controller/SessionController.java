package com.smartattend.controller;

import com.smartattend.dto.ApiResponse;
import com.smartattend.dto.StartSessionRequest;
import com.smartattend.model.Session;
import com.smartattend.security.AuthPrincipal;
import com.smartattend.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService service;

    // used by the FastAPI face service to find which class is currently in session
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Session>>> active() {
        return ResponseEntity.ok(ApiResponse.ok(service.activeSessions()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Session>>> list(@AuthenticationPrincipal AuthPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(service.listByOrg(principal.orgId())));
    }

    @PostMapping("/start")
    public ResponseEntity<ApiResponse<Session>> start(@AuthenticationPrincipal AuthPrincipal principal,
                                                        @Valid @RequestBody StartSessionRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Lecture started", service.start(principal.orgId(), principal.id(), req)));
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<ApiResponse<Session>> end(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok("Lecture ended", service.end(id)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Session>> get(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(service.get(id)));
    }
}
