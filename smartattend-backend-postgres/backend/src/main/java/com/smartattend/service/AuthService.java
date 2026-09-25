package com.smartattend.service;

import com.smartattend.dto.*;
import com.smartattend.model.*;
import com.smartattend.repository.*;
import com.smartattend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final OrganizationRepository orgRepo;
    private final AdminRepository adminRepo;
    private final StudentRepository studentRepo;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public AuthResponse signupOrg(OrgSignupRequest req) {
        if (adminRepo.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        Organization org = new Organization();
        org.setId(UUID.randomUUID().toString());
        org.setName(req.getOrgName());
        org.setEmail(req.getEmail());
        org.setCode(generateOrgCode());
        org.setCreatedAt(Instant.now());
        orgRepo.save(org);

        Admin admin = new Admin();
        admin.setId(UUID.randomUUID().toString());
        admin.setName(req.getAdminName());
        admin.setEmail(req.getEmail());
        admin.setPassword(encoder.encode(req.getPassword()));
        admin.setOrgId(org.getId());
        admin.setRole(Role.ADMIN);
        admin.setOwner(true);
        admin.setCreatedAt(Instant.now());
        adminRepo.save(admin);

        String token = jwtService.generateToken(admin.getId(), admin.getEmail(), "ADMIN", org.getId());
        return new AuthResponse(token, "ADMIN", admin.getId(), admin.getName(), admin.getEmail(),
                org.getId(), org.getName(), org.getCode(), null);
    }

    public AuthResponse joinAdmin(AdminJoinRequest req) {
        Organization org = orgRepo.findByCode(req.getOrgCode())
                .orElseThrow(() -> new IllegalArgumentException("Invalid organization code"));
        if (adminRepo.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        Admin admin = new Admin();
        admin.setId(UUID.randomUUID().toString());
        admin.setName(req.getName());
        admin.setEmail(req.getEmail());
        admin.setPassword(encoder.encode(req.getPassword()));
        admin.setOrgId(org.getId());
        admin.setRole(Role.ADMIN);
        admin.setCreatedAt(Instant.now());
        adminRepo.save(admin);

        String token = jwtService.generateToken(admin.getId(), admin.getEmail(), "ADMIN", org.getId());
        return new AuthResponse(token, "ADMIN", admin.getId(), admin.getName(), admin.getEmail(),
                org.getId(), org.getName(), org.getCode(), null);
    }

    public AuthResponse signupStudent(StudentSignupRequest req) {
        Organization org = orgRepo.findByCode(req.getOrgCode())
                .orElseThrow(() -> new IllegalArgumentException("Invalid organization code"));
        if (studentRepo.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        Student student = new Student();
        student.setId(UUID.randomUUID().toString());
        student.setOrgId(org.getId());
        student.setClassSectionId(req.getClassSectionId());
        student.setName(req.getName());
        student.setEmail(req.getEmail());
        student.setPassword(encoder.encode(req.getPassword()));
        student.setRollNo(req.getRollNo());
        student.setRole(Role.STUDENT);
        student.setCreatedAt(Instant.now());
        studentRepo.save(student);

        String token = jwtService.generateToken(student.getId(), student.getEmail(), "STUDENT", org.getId());
        return new AuthResponse(token, "STUDENT", student.getId(), student.getName(), student.getEmail(),
                org.getId(), org.getName(), org.getCode(), student.getClassSectionId());
    }

    public AuthResponse login(LoginRequest req) {
        // try admin first, then student
        var adminOpt = adminRepo.findByEmail(req.getEmail());
        if (adminOpt.isPresent() && encoder.matches(req.getPassword(), adminOpt.get().getPassword())) {
            Admin admin = adminOpt.get();
            Organization org = orgRepo.findById(admin.getOrgId()).orElse(null);
            String token = jwtService.generateToken(admin.getId(), admin.getEmail(), "ADMIN", admin.getOrgId());
            return new AuthResponse(token, "ADMIN", admin.getId(), admin.getName(), admin.getEmail(),
                    admin.getOrgId(), org != null ? org.getName() : null, org != null ? org.getCode() : null, null);
        }

        var studentOpt = studentRepo.findByEmail(req.getEmail());
        if (studentOpt.isPresent() && encoder.matches(req.getPassword(), studentOpt.get().getPassword())) {
            Student student = studentOpt.get();
            Organization org = orgRepo.findById(student.getOrgId()).orElse(null);
            String token = jwtService.generateToken(student.getId(), student.getEmail(), "STUDENT", student.getOrgId());
            return new AuthResponse(token, "STUDENT", student.getId(), student.getName(), student.getEmail(),
                    student.getOrgId(), org != null ? org.getName() : null, org != null ? org.getCode() : null, student.getClassSectionId());
        }

        throw new IllegalArgumentException("Invalid email or password");
    }

    private String generateOrgCode() {
        String candidate;
        do {
            candidate = "ORG-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        } while (orgRepo.existsByCode(candidate));
        return candidate;
    }
}
