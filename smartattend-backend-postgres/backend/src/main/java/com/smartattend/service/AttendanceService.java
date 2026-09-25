package com.smartattend.service;

import com.smartattend.dto.MarkAttendanceRequest;
import com.smartattend.model.Attendance;
import com.smartattend.model.Session;
import com.smartattend.model.Student;
import com.smartattend.repository.AttendanceRepository;
import com.smartattend.repository.SessionRepository;
import com.smartattend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepo;
    private final SessionRepository sessionRepo;
    private final StudentRepository studentRepo;

    /** Returns empty Optional if attendance was already marked for this session+student. */
    public Optional<Attendance> markFromFace(MarkAttendanceRequest req) {
        boolean already = attendanceRepo.findBySessionIdAndStudentId(req.getSessionId(), req.getStudentId()).isPresent();
        if (already) {
            return Optional.empty();
        }
        Session session = sessionRepo.findById(req.getSessionId())
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        Student student = studentRepo.findById(req.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        Attendance a = new Attendance();
        a.setId(UUID.randomUUID().toString());
        a.setOrgId(session.getOrgId());
        a.setSessionId(session.getId());
        a.setClassSectionId(session.getClassSectionId());
        a.setStudentId(student.getId());
        a.setStudentName(student.getName());
        a.setSubjectName(session.getSubjectName());
        a.setConfidence(req.getConfidence());
        a.setStatus("PRESENT");
        a.setMarkedAt(Instant.now());
        return Optional.of(attendanceRepo.save(a));
    }

    public List<Attendance> bySession(String sessionId) {
        return attendanceRepo.findBySessionId(sessionId);
    }

    public List<Attendance> byStudent(String studentId) {
        return attendanceRepo.findByStudentId(studentId);
    }

    public List<Attendance> byOrg(String orgId) {
        return attendanceRepo.findByOrgId(orgId);
    }

    public List<Attendance> bySection(String classSectionId) {
        return attendanceRepo.findByClassSectionId(classSectionId);
    }
}
