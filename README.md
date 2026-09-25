# SmartAttend

SmartAttend is a real-time AI-based attendance management system that uses face recognition to identify students and automatically mark attendance during active class sessions.

## Overview

The system combines a React frontend, Spring Boot backend, and FastAPI computer vision service. Student faces are registered as embeddings and later compared with live webcam frames for identification.

The system also includes anti-spoofing to help prevent attendance from being marked using photographs or other presentation attacks.

## Features

- Student face registration
- Real-time webcam-based face recognition
- Face embedding generation and similarity matching
- Multiple face samples during registration
- AI-based anti-spoofing
- Automatic attendance marking
- Active class session management
- Real-time communication using WebSockets
- REST API integration between services
- Separate frontend, backend, and computer vision services

## Technologies Used

- Java
- Spring Boot
- Python
- FastAPI
- React.js
- InsightFace
- ArcFace-based face recognition
- OpenCV
- ONNX Runtime
- MiniFASNet
- REST APIs
- WebSockets

## System Architecture

React Frontend
        |
        | REST / WebSocket
        |
Spring Boot Backend
        |
        | Student Data / Sessions / Attendance
        |
FastAPI Computer Vision Service
        |
        +-- InsightFace / ArcFace
        |
        +-- OpenCV
        |
        +-- ONNX Anti-Spoofing

## Face Registration

During registration, multiple versions of the student's face image are generated using image augmentation.

The FastAPI service:

1. Detects the student's face.
2. Extracts the face embedding using InsightFace.
3. Generates multiple face embeddings from different image variations.
4. Encodes the embeddings.
5. Sends the embeddings to the Spring Boot backend for storage.

## Face Recognition

During attendance:

1. The React frontend captures webcam frames.
2. Frames are sent to the FastAPI service.
3. The face is detected from the frame.
4. InsightFace generates a face embedding.
5. The embedding is compared with registered student embeddings.
6. The matching student is identified based on similarity.
7. The active class session is retrieved from the Spring Boot backend.
8. Attendance is submitted to the backend.
9. The backend records the attendance.

## Anti-Spoofing

SmartAttend uses ONNX-based MiniFASNet models for face anti-spoofing.

The models are kept locally because of their size:

models/
├── anti_spoof_v1.onnx
└── anti_spoof_v2.onnx

The model files are excluded from Git tracking.

## Project Structure

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

## Running the Project

### FastAPI

```bash
cd fast-api
python -m venv face_env
face_env\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
