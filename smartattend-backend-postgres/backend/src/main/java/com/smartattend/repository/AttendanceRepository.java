package com.smartattend.repository;

import com.smartattend.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, String> {
    Optional<Attendance> findBySessionIdAndStudentId(String sessionId, String studentId);
    List<Attendance> findBySessionId(String sessionId);
    List<Attendance> findByStudentId(String studentId);
    List<Attendance> findByOrgId(String orgId);
    List<Attendance> findByClassSectionId(String classSectionId);
}
