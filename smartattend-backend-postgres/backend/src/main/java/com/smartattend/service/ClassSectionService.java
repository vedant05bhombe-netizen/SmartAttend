package com.smartattend.service;

import com.smartattend.dto.ClassSectionRequest;
import com.smartattend.model.ClassSection;
import com.smartattend.repository.ClassSectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClassSectionService {

    private final ClassSectionRepository repo;

    public List<ClassSection> listByOrg(String orgId) {
        return repo.findByOrgId(orgId);
    }

    public ClassSection create(String orgId, ClassSectionRequest req) {
        ClassSection cs = new ClassSection();
        cs.setId(UUID.randomUUID().toString());
        cs.setOrgId(orgId);
        cs.setName(req.getName());
        cs.setDepartment(req.getDepartment());
        cs.setYear(req.getYear());
        cs.setCreatedAt(Instant.now());
        return repo.save(cs);
    }

    public void delete(String id) {
        repo.deleteById(id);
    }
}
