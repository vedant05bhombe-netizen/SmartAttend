package com.smartattend.repository;

import com.smartattend.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SessionRepository extends JpaRepository<Session, String> {
    List<Session> findByActiveTrue();
    List<Session> findByOrgId(String orgId);
    List<Session> findByOrgIdAndActiveTrue(String orgId);
    List<Session> findByClassSectionId(String classSectionId);
}
