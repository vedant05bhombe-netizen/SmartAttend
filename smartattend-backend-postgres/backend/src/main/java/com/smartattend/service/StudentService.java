package com.smartattend.service;

import com.smartattend.dto.AddStudentRequest;
import com.smartattend.model.Role;
import com.smartattend.model.Student;
import com.smartattend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepo;
    private final PasswordEncoder encoder;

    public List<Student> listByOrg(String orgId) {
        return studentRepo.findByOrgId(orgId);
    }

    public List<Student> listBySection(String classSectionId) {
        return studentRepo.findByClassSectionId(classSectionId);
    }

    public Student add(String orgId, AddStudentRequest req) {
        if (studentRepo.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        Student s = new Student();
        s.setId(UUID.randomUUID().toString());
        s.setOrgId(orgId);
        s.setClassSectionId(req.getClassSectionId());
        s.setName(req.getName());
        s.setEmail(req.getEmail());
        s.setPassword(encoder.encode(req.getPassword()));
        s.setRollNo(req.getRollNo());
        s.setRole(Role.STUDENT);
        s.setCreatedAt(Instant.now());
        return studentRepo.save(s);
    }

    public Student saveFaceEncodings(String studentId, List<String> encodings) {
        Student s = studentRepo.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        s.setFaceEncodings(encodings);
        s.setFaceRegistered(encodings != null && !encodings.isEmpty());
        return studentRepo.save(s);
    }

    public Student get(String studentId) {
        return studentRepo.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
    }

    public void delete(String studentId) {
        studentRepo.deleteById(studentId);
    }
}
