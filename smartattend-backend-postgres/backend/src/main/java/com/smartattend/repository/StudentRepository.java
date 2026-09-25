package com.smartattend.repository;

import com.smartattend.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, String> {
    Optional<Student> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Student> findByOrgId(String orgId);
    List<Student> findByClassSectionId(String classSectionId);
}
