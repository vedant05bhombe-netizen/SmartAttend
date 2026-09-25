# 🎓 SmartAttend

> **Real-time AI-powered attendance management system using face recognition.**

SmartAttend automatically identifies students from live webcam frames and marks their attendance during active class sessions — no manual roll calls, no proxy attendance.

---

## ✨ Overview

SmartAttend combines three services into a single real-time attendance pipeline:

- **React frontend** — captures webcam frames and manages the user interface
- **Spring Boot backend** — manages students, class sessions, and attendance records
- **FastAPI computer vision service** — handles face detection, embedding, and matching

Student faces are registered as embeddings during onboarding and later compared against live webcam frames for identification. Built-in anti-spoofing helps prevent attendance from being marked using photos, screens, or other presentation attacks.

---

## 🚀 Features

- 🧑‍🎓 Student face registration with multiple augmented samples
- 📷 Real-time webcam-based face recognition
- 🧠 Face embedding generation and similarity matching
- 🛡️ AI-based anti-spoofing (ONNX MiniFASNet)
- ✅ Automatic attendance marking
- 🗓️ Active class session management
- 🔌 Real-time communication via WebSockets
- 🔗 REST API integration between services
- 🧩 Clean separation of frontend, backend, and computer vision services

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React.js |
| **Backend** | Java, Spring Boot |
| **Computer Vision** | Python, FastAPI |
| **Face Recognition** | InsightFace, ArcFace |
| **Image Processing** | OpenCV |
| **Anti-Spoofing** | ONNX Runtime, MiniFASNet |
| **Communication** | REST APIs, WebSockets |

---

## 🏗️ System Architecture

```text
                React Frontend
                      │
                      │  REST / WebSocket
                      ▼
              Spring Boot Backend
                      │
                      │  Student Data / Sessions / Attendance
                      ▼
          FastAPI Computer Vision Service
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
  InsightFace      OpenCV      ONNX Anti-Spoofing
    (ArcFace)
```

---

## 🧠 How It Works

### Face Registration

1. The student's face is detected from the uploaded/captured image.
2. Multiple image variations are generated using augmentation.
3. InsightFace extracts a face embedding from each variation.
4. The embeddings are encoded and sent to the Spring Boot backend.
5. The backend stores the embeddings against the student's profile.

### Face Recognition (Attendance)

1. The React frontend captures live webcam frames.
2. Frames are streamed to the FastAPI service.
3. The face is detected within the frame.
4. InsightFace generates a face embedding for the detected face.
5. The embedding is compared against all registered student embeddings.
6. The best match is identified based on similarity score.
7. The active class session is retrieved from the Spring Boot backend.
8. Attendance is submitted and recorded for the identified student.

### Anti-Spoofing

Every recognition attempt is checked using ONNX-based **MiniFASNet** models before attendance is accepted, preventing spoofing via photos or screens.

```text
models/
├── anti_spoof_v1.onnx
└── anti_spoof_v2.onnx
```

> Model files are kept locally due to size and are excluded from Git tracking.

---

## 📂 Project Structure

```text
SmartAttend/
│
├── backend/
│   └── Spring Boot application
│
├── fast-api/
│   ├── models/
│   ├── main.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    ├── public/
    └── package.json
```

---

## ⚙️ Getting Started

### Prerequisites

- Java 17+ and Maven
- Python 3.9+
- Node.js and npm

### 1. FastAPI (Computer Vision Service)

```bash
cd fast-api
python -m venv face_env
face_env\Scripts\activate      # Windows
# source face_env/bin/activate   # macOS/Linux

pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Spring Boot Backend

```bash
cd backend
mvn spring-boot:run
```

### 3. React Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔮 Future Improvements

- Retry/fallback handling for low-confidence matches
- Attendance analytics dashboard
- Bulk student onboarding
- Mobile-friendly capture flow
- Support for multiple camera feeds per session

---

## 👨‍💻 Author

**Vedant Bhombe**
B.Tech Information Technology
