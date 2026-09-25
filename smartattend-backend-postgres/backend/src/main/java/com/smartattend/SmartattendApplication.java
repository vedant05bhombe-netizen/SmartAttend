package com.smartattend;

import com.smartattend.model.Admin;
import com.smartattend.model.Organization;
import com.smartattend.model.Role;
import com.smartattend.repository.AdminRepository;
import com.smartattend.repository.OrganizationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.UUID;

@SpringBootApplication
public class SmartattendApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartattendApplication.class, args);
    }

    /**
     * Seeds the internal "SYSTEM" organization and the fastapi service account
     * used by the FastAPI face-recognition service to authenticate against this API.
     */
    @Bean
    CommandLineRunner seedSystemAccount(OrganizationRepository orgRepo,
                                         AdminRepository adminRepo,
                                         PasswordEncoder encoder) {
        return args -> {
            Organization sysOrg = orgRepo.findByCode("SYSTEM").orElseGet(() -> {
                Organization o = new Organization();
                o.setId(UUID.randomUUID().toString());
                o.setName("SmartAttend System");
                o.setCode("SYSTEM");
                o.setEmail("system@smartattend.local");
                o.setCreatedAt(Instant.now());
                return orgRepo.save(o);
            });

            adminRepo.findByEmail("fastapi@system.com").orElseGet(() -> {
                Admin admin = new Admin();
                admin.setId(UUID.randomUUID().toString());
                admin.setName("FastAPI Service");
                admin.setEmail("fastapi@system.com");
                admin.setPassword(encoder.encode("fastapi123"));
                admin.setOrgId(sysOrg.getId());
                admin.setRole(Role.ADMIN);
                admin.setOwner(true);
                admin.setCreatedAt(Instant.now());
                return adminRepo.save(admin);
            });
        };
    }
}
