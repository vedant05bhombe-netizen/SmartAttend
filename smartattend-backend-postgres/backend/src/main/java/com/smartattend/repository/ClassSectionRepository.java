package com.smartattend.repository;

import com.smartattend.model.ClassSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassSectionRepository extends JpaRepository<ClassSection, String> {
    List<ClassSection> findByOrgId(String orgId);
}
