package com.smartattend.service;

import com.smartattend.dto.StartSessionRequest;
import com.smartattend.model.Session;
import com.smartattend.model.Subject;
import com.smartattend.repository.SessionRepository;
import com.smartattend.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository repo;
    private final SubjectRepository subjectRepo;

    public List<Session> activeSessions() {
        return repo.findByActiveTrue();
    }

    public List<Session> listByOrg(String orgId) {
        return repo.findByOrgId(orgId);
    }

    public Session start(String orgId, String adminId, StartSessionRequest req) {
        Subject subject = subjectRepo.findById(req.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));

        Session s = new Session();
        s.setId(UUID.randomUUID().toString());
        s.setOrgId(orgId);
        s.setClassSectionId(req.getClassSectionId());
        s.setSubjectId(req.getSubjectId());
        s.setSubjectName(subject.getName());
        s.setStartedByAdminId(adminId);
        s.setStartTime(Instant.now());
        s.setActive(true);
        return repo.save(s);
    }

    public Session end(String sessionId) {
        Session s = repo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        s.setActive(false);
        s.setEndTime(Instant.now());
        return repo.save(s);
    }

    public Session get(String sessionId) {
        return repo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
    }
}
