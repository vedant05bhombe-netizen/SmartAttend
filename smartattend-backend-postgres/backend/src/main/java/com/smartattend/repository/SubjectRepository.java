package com.smartattend.repository;

import com.smartattend.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject, String> {
    List<Subject> findByOrgId(String orgId);
    List<Subject> findByClassSectionId(String classSectionId);
}
