package com.smartattend.service;

import com.smartattend.dto.SubjectRequest;
import com.smartattend.model.Subject;
import com.smartattend.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository repo;

    public List<Subject> listByOrg(String orgId) {
        return repo.findByOrgId(orgId);
    }

    public List<Subject> listBySection(String classSectionId) {
        return repo.findByClassSectionId(classSectionId);
    }

    public Subject create(String orgId, SubjectRequest req) {
        Subject s = new Subject();
        s.setId(UUID.randomUUID().toString());
        s.setOrgId(orgId);
        s.setName(req.getName());
        s.setCode(req.getCode());
        s.setClassSectionId(req.getClassSectionId());
        s.setCreatedAt(Instant.now());
        return repo.save(s);
    }

    public void delete(String id) {
        repo.deleteById(id);
    }
}
