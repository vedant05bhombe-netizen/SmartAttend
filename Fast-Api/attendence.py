
from fastapi import FastAPI, UploadFile, File, Form, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import json
import base64
import threading
import asyncio
import time
import requests
from datetime import datetime
from collections import deque
import pyttsx3
from insightface.app import FaceAnalysis

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


ENABLE_TTS        = True  
WS_THROTTLE_SEC   = 0.3   


print("Loading InsightFace ArcFace model (buffalo_l)...")
face_app = FaceAnalysis(
    name="buffalo_l",
    providers=["CPUExecutionProvider"] 
)
face_app.prepare(ctx_id=-1, det_size=(640, 640))
print("✓ InsightFace loaded!")


# ============================================================
# ANTI-SPOOFING — MiniFASNet V2 + V1SE
# ============================================================
# The ONNX files are expected here:
#   models/anti_spoof_v2.onnx
#   models/anti_spoof_v1.onnx
#
# V2 uses crop scale 2.7. V1SE uses crop scale 4.0.
# These models expect [batch, 3, 80, 80] and output 3 logits.
# Class index 1 is treated as REAL.

from pathlib import Path
import onnxruntime as ort

BASE_DIR = Path(__file__).resolve().parent

ANTI_SPOOF_CONFIG = [
    (BASE_DIR / "models" / "anti_spoof_v2.onnx", 2.7, "MiniFASNetV2"),
    (BASE_DIR / "models" / "anti_spoof_v1.onnx", 4.0, "MiniFASNetV1SE"),
]

anti_spoof_nets = []

for model_path, scale, model_name in ANTI_SPOOF_CONFIG:
    if not model_path.is_file():
        raise FileNotFoundError(
            f"Anti-spoof model not found: {model_path}. "
            "Put the required ONNX file in the models folder."
        )

    try:
        session = ort.InferenceSession(
            str(model_path),
            providers=["CPUExecutionProvider"]
        )

        input_info = session.get_inputs()[0]
        output_info = session.get_outputs()[0]

        print(f"✓ Anti-spoof loaded: {model_name}")
        print(f"  Path   : {model_path}")
        print(f"  Input  : {input_info.shape}")
        print(f"  Output : {output_info.shape}")

        anti_spoof_nets.append({
            "session": session,
            "input_name": input_info.name,
            "output_name": output_info.name,
            "scale": scale,
            "name": model_name,
        })

    except Exception as e:
        raise RuntimeError(
            f"Failed to load anti-spoof model {model_name}: {e}"
        ) from e

if len(anti_spoof_nets) != 2:
    raise RuntimeError(
        f"Expected 2 anti-spoof models, loaded {len(anti_spoof_nets)}."
    )

print("✓ Anti-spoof models loaded: 2/2")


SPRING_BASE_URL        = "http://localhost:8080/api"
SPRING_AUTH_LOGIN      = f"{SPRING_BASE_URL}/auth/login"
SPRING_STUDENTS_BY_ORG = f"{SPRING_BASE_URL}/students/admin/face/org"
SPRING_FACE_ENCODING   = f"{SPRING_BASE_URL}/students/admin"
SPRING_ACTIVE_SESSIONS = f"{SPRING_BASE_URL}/sessions/active"
SPRING_FACE_MARK       = f"{SPRING_BASE_URL}/attendance/face/mark"

_service_token        = None
_service_token_expiry = None


def get_service_token():
    global _service_token, _service_token_expiry
    now = datetime.now().timestamp()
    if _service_token and _service_token_expiry and now < _service_token_expiry:
        return _service_token
    try:
        res = requests.post(SPRING_AUTH_LOGIN,
                            json={"email": "fastapi@system.com", "password": "fastapi123"},
                            timeout=5)
        if res.status_code == 200:
            data                  = res.json().get("data", {})
            _service_token        = data.get("token")
            _service_token_expiry = now + 82800
            print("✓ Authenticated with Spring Boot")
            return _service_token
        print(f"✗ Spring Boot auth failed: {res.status_code}")
        return None
    except Exception as e:
        print(f"✗ Cannot reach Spring Boot: {e}")
        return None


def spring_headers():
    token = get_service_token()
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"} if token \
           else {"Content-Type": "application/json"}



_tts_lock = threading.Lock()

def speak_async(text: str, force: bool = False):
    """force=True bypasses ENABLE_TTS flag (used for critical messages only)."""
    if not ENABLE_TTS and not force:
        return
    def _speak():
        with _tts_lock:
            try:
                engine = pyttsx3.init()
                engine.setProperty("rate", 165)
                engine.setProperty("volume", 1.0)
                voices = engine.getProperty("voices")
                for v in voices:
                    if any(x in v.name.lower() for x in ["mark", "david", "george"]):
                        engine.setProperty("voice", v.id)
                        break
                engine.say(text)
                engine.runAndWait()
                engine.stop()
            except Exception as e:
                print(f"TTS error: {e}")
    threading.Thread(target=_speak, daemon=True).start()



def embedding_to_base64(emb: np.ndarray) -> str:
    return base64.b64encode(json.dumps(emb.tolist()).encode()).decode()

def base64_to_embedding(b64: str) -> np.ndarray:
    return np.array(json.loads(base64.b64decode(b64.encode()).decode()))

def cosine_sim(e1: np.ndarray, e2: np.ndarray) -> float:
    e1 = e1 / (np.linalg.norm(e1) + 1e-8)
    e2 = e2 / (np.linalg.norm(e2) + 1e-8)
    return float(np.dot(e1, e2))  # [-1, 1]



def get_best_face(image: np.ndarray):
    faces = face_app.get(image)
    if not faces:
        return None
    return max(faces, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]))


def is_good_face(face, image: np.ndarray) -> bool:
    """Reject tiny, out-of-bounds, or low-confidence faces."""
    x1, y1, x2, y2 = map(int, face.bbox)
    w = x2 - x1
    h = y2 - y1

   
    if w < 80 or h < 80:
        return False

   
    ih, iw = image.shape[:2]
    if x1 < 0 or y1 < 0 or x2 > iw or y2 > ih:
        return False

   
    if hasattr(face, "det_score") and face.det_score < 0.6:
        return False

    return True


def _crop_for_minifas(image: np.ndarray, face, scale: float) -> np.ndarray | None:
    """
    Crop a face using the MiniFASNet reference crop strategy.

    MiniFASNet V2 uses scale=2.7 and V1SE uses scale=4.0.
    The resulting crop is resized to the model input size (80x80).
    """
    x1, y1, x2, y2 = [float(v) for v in face.bbox]

    box_w = x2 - x1
    box_h = y2 - y1

    if box_w <= 0 or box_h <= 0:
        return None

    src_h, src_w = image.shape[:2]

    # Same scale limiting strategy used by the MiniFASNet ONNX reference.
    actual_scale = min(
        (src_h - 1) / box_h,
        (src_w - 1) / box_w,
        scale,
    )

    new_w = box_w * actual_scale
    new_h = box_h * actual_scale

    center_x = x1 + box_w / 2.0
    center_y = y1 + box_h / 2.0

    crop_x1 = max(0, int(center_x - new_w / 2.0))
    crop_y1 = max(0, int(center_y - new_h / 2.0))
    crop_x2 = min(src_w - 1, int(center_x + new_w / 2.0))
    crop_y2 = min(src_h - 1, int(center_y + new_h / 2.0))

    if crop_x2 <= crop_x1 or crop_y2 <= crop_y1:
        return None

    cropped = image[crop_y1:crop_y2 + 1, crop_x1:crop_x2 + 1]

    if cropped.size == 0:
        return None

    return cv2.resize(cropped, (80, 80))


def _minifas_score(model: dict, image: np.ndarray, face) -> float:
    """
    Run one MiniFASNet ONNX model and return probability of REAL (class 1).

    Important: these specific exported MiniFASNet ONNX models expect raw
    float32 pixel values in BGR/CHW order, not ImageNet-normalized RGB.
    """
    face_crop = _crop_for_minifas(image, face, model["scale"])

    if face_crop is None:
        raise ValueError("Could not create a valid anti-spoof face crop")

    # Reference ONNX preprocessing: float32 -> CHW -> batch.
    # Do NOT divide by 255 and do NOT apply ImageNet normalization here.
    input_tensor = face_crop.astype(np.float32)
    input_tensor = np.transpose(input_tensor, (2, 0, 1))
    input_tensor = np.expand_dims(input_tensor, axis=0)

    outputs = model["session"].run(
        [model["output_name"]],
        {model["input_name"]: input_tensor},
    )

    logits = np.asarray(outputs[0], dtype=np.float32)

    if logits.ndim != 2 or logits.shape[0] != 1 or logits.shape[1] != 3:
        raise ValueError(
            f"Unexpected anti-spoof output shape: {logits.shape}; expected (1, 3)"
        )

    # Numerically stable softmax.
    logits = logits[0]
    logits = logits - np.max(logits)
    probabilities = np.exp(logits)
    probabilities /= np.sum(probabilities) + 1e-12

    # MiniFASNet convention: class 1 = REAL.
    return float(probabilities[1])


def check_anti_spoof(image: np.ndarray, face) -> tuple:
    """
    Run both MiniFASNet models and decide whether the face is live.

    Both models are required. Their REAL probabilities are averaged.
    """
    if len(anti_spoof_nets) != 2:
        return False, "Anti-spoof models are not loaded"

    scores = []

    for model in anti_spoof_nets:
        try:
            score = _minifas_score(model, image, face)
            scores.append(score)
            print(
                f"[ANTI-SPOOF] {model['name']} "
                f"real={score:.3f}"
            )
        except Exception as e:
            print(f"[ANTI-SPOOF ERROR] {model['name']}: {e}")
            return False, "Anti-spoof inference failed"

    average_score = sum(scores) / len(scores)

    print(
        f"[ANTI-SPOOF] "
        f"V2={scores[0]:.3f} "
        f"V1SE={scores[1]:.3f} "
        f"AVG={average_score:.3f}"
    )

    # Initial operating threshold. Calibrate with real webcam samples
    # before treating this as a security-grade threshold.
    if average_score < 0.55:
        return False, f"Spoof detected ({average_score:.2f})"

    return True, f"Live ({average_score:.2f})"



VOTE_WINDOW  = 5
VOTE_NEEDED  = 3
VOTE_MIN_SIM = 0.50  

_vote_buffers: dict = {}
_vote_lock    = threading.Lock()


def vote_result(org_id: str, candidate_id, similarity: float):
    with _vote_lock:
        if org_id not in _vote_buffers:
            _vote_buffers[org_id] = deque(maxlen=VOTE_WINDOW)
        buf = _vote_buffers[org_id]
        buf.append((candidate_id, similarity))

        if len(buf) < VOTE_WINDOW:
            return None

        tally: dict = {}
        for cid, sim in buf:
            if cid is not None and sim >= VOTE_MIN_SIM:
                tally.setdefault(cid, []).append(sim)

        for cid, sims in tally.items():
            if len(sims) >= VOTE_NEEDED:
                buf.clear()
                return cid, sum(sims) / len(sims)

        return None


def reset_votes(org_id: str):
    with _vote_lock:
        _vote_buffers.pop(org_id, None)



SIM_THRESHOLD = 0.45
MIN_GAP       = 0.08


def match_student(emb: np.ndarray, students: list):
    scores = []
    for s in students:
        encs = s.get("faceEncodings") or []
        # backward compat — single encoding field
        if not encs and s.get("faceEncoding"):
            encs = [s["faceEncoding"]]
        if not encs:
            continue

        sims = []
        for enc in encs:
            try:
                sims.append(cosine_sim(emb, base64_to_embedding(enc)))
            except Exception:
                pass

        if sims:
           
            avg_sim = sum(sims) / len(sims)
            scores.append((avg_sim, s))

    scores.sort(reverse=True, key=lambda x: x[0])
    best_sim   = scores[0][0] if scores else -1.0
    best_match = scores[0][1] if scores else None
    second_sim = scores[1][0] if len(scores) > 1 else -1.0
    gap        = best_sim - second_sim

    print(f"[MATCH] best={best_sim:.3f} ({best_match.get('name') if best_match else 'none'}) "
          f"| 2nd={second_sim:.3f} | gap={gap:.3f}")

    return best_match, best_sim, second_sim, gap



def fetch_students(org_id: str):
    res = requests.get(f"{SPRING_STUDENTS_BY_ORG}/{org_id}", headers=spring_headers(), timeout=6)
    raw = res.json()
    return (raw.get("data", raw) if isinstance(raw, dict) else raw) or []


def find_active_session(section_id: str):
    res = requests.get(
        SPRING_ACTIVE_SESSIONS,
        headers=spring_headers(),
        timeout=5
    )

    if res.status_code != 200:
        print(f"[SESSIONS] Spring returned {res.status_code}: {res.text}")
        return None

    raw = res.json()
    sessions = raw.get("data", raw) if isinstance(raw, dict) else raw

    print(f"[SESSIONS] {len(sessions)} active:")

    for s in sessions:
        print(
            f"  id={s.get('id')} "
            f"sectionId={s.get('classSectionId')} "
            f"subject={s.get('subjectName')}"
        )

    matched = [
        s for s in sessions
        if s.get("classSectionId") is not None
        and str(s.get("classSectionId")) == str(section_id)
    ]

    print(
        f"[SESSIONS] matched sectionId={section_id}: "
        f"{len(matched)}"
    )

    return matched[0] if matched else None


def process_frame(image: np.ndarray, org_id: str, use_voting: bool = False,
                  tts_enabled: bool = True) -> dict:
    image = cv2.resize(image, (640, 480))

    
    face = get_best_face(image)
    if face is None:
        return {"status": "fail", "message": "No face detected", "similarity": 0}

    
    if not is_good_face(face, image):
        return {"status": "fail", "message": "Face too small or unclear — move closer", "similarity": 0}

    
    is_live, reason = check_anti_spoof(image, face)
    if not is_live:
        if tts_enabled:
            speak_async(reason)
        return {"status": "fail", "message": reason, "similarity": 0}

   
    try:
        students = fetch_students(org_id)
        if not students:
            return {"status": "fail", "message": "No students with face data", "similarity": 0}
    except Exception as e:
        return {"status": "error", "message": f"Cannot fetch students: {e}", "similarity": 0}

   
    best_match, best_sim, second_sim, gap = match_student(face.embedding, students)
    confident = (best_match is not None
                 and best_sim >= SIM_THRESHOLD
                 and (len(students) < 2 or gap >= MIN_GAP))
    candidate_id = best_match.get("id") if confident else None

  
    if use_voting:
        vote = vote_result(org_id, candidate_id, best_sim)
        if vote is None:
            return {"status": "voting", "message": "Scanning… hold still", "similarity": round(best_sim, 3)}
        confirmed_id, avg_sim = vote
        if not confident or confirmed_id != candidate_id:
            return {"status": "fail", "message": f"Not recognized (best: {best_sim:.1%})",
                    "similarity": round(best_sim, 3)}
        best_sim = avg_sim

    if not confident or best_match is None:
        if tts_enabled:
            speak_async("Face not recognized")
        return {"status": "fail", "message": f"No match (best: {best_sim:.1%})", "similarity": round(best_sim, 3)}

    student_id   = best_match.get("id")
    student_name = best_match.get("name")
    try:
        section_id = int(best_match.get("classSectionId"))
    except (TypeError, ValueError):
        section_id = best_match.get("classSectionId")

    # Session
    try:
        session = find_active_session(section_id)
    except Exception as e:
        return {"status": "error", "message": f"Session fetch failed: {e}", "similarity": round(best_sim, 3)}

    if not session:
        if tts_enabled:
            speak_async(f"No active class for {student_name}")
        return {"status": "fail", "message": f"No active session for {student_name}'s class",
                "student_name": student_name, "similarity": round(best_sim, 3)}

    session_id   = session.get("id")
    subject_name = session.get("subjectName", "class")

    # Mark
    try:
        mark_res = requests.post(
            SPRING_FACE_MARK,
            json={"sessionId": session_id, "studentId": student_id, "confidence": round(best_sim, 3)},
            headers=spring_headers(), timeout=5
        )
        if mark_res.status_code == 200:
            msg = f"Attendance marked for {student_name} in {subject_name}"
            if tts_enabled:
                speak_async(msg)
            return {"status": "success", "student_name": student_name,
                    "subject": subject_name, "similarity": round(best_sim, 3), "message": msg}
        elif mark_res.status_code == 400:
            if tts_enabled:
                speak_async("Attendance already marked")
            return {"status": "fail", "student_name": student_name,
                    "message": "Attendance already marked today", "similarity": round(best_sim, 3)}
        else:
            return {"status": "error", "message": f"Server error {mark_res.status_code}",
                    "similarity": round(best_sim, 3)}
    except Exception as e:
        return {"status": "error", "message": f"Marking failed: {str(e)}", "similarity": round(best_sim, 3)}



@app.get("/health")
async def health():
    return {"status": "online", "message": "SmartAttend GOD MODE v2 — All fixes applied"}



@app.post("/register-face")
async def register_face(student_db_id: str = Form(...), file: UploadFile = File(...)):
    if not get_service_token():
        return {"status": "error", "message": "Authentication failed"}
    try:
        contents = await file.read()
        image    = cv2.imdecode(np.frombuffer(contents, np.uint8), cv2.IMREAD_COLOR)
        if image is None:
            return {"status": "error", "message": "Invalid image"}

        image = cv2.resize(image, (640, 640))

    
        augmented = [
            image,                                                        
            cv2.flip(image, 1),                                          
            cv2.convertScaleAbs(image, alpha=1.1, beta=10),               
            cv2.convertScaleAbs(image, alpha=0.9, beta=-10),              
            cv2.GaussianBlur(image, (3, 3), 0),                            
            image[10:, 10:],                                               
            image[:image.shape[0]-10, :image.shape[1]-10],               
        ]

        embeddings = []
        for aug in augmented:
            try:
                face = get_best_face(aug)
                if face is not None and is_good_face(face, aug):
                    embeddings.append(embedding_to_base64(face.embedding))
            except Exception:
                pass

        if not embeddings:
            speak_async("No face detected")
            return {"status": "error", "message": "No face detected in any augmentation. Ensure face is clearly visible."}

        print(f"[REGISTER] Generated {len(embeddings)} embeddings for student {student_db_id}")


        res = requests.patch(
            f"{SPRING_FACE_ENCODING}/{student_db_id}/face-encoding",
            json={"encodings": embeddings},  
            headers=spring_headers(), timeout=10
        )
        if res.status_code == 200:
            speak_async("Face registered successfully")
            return {"status": "success", "message": f"Face saved with {len(embeddings)} embeddings",
                    "embedding_count": len(embeddings)}
        return {"status": "error", "message": f"Spring Boot error: {res.status_code} — {res.text}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/attendance")
async def attendance(file: UploadFile = File(...), org_id: str = Form(...)):
    if not get_service_token():
        speak_async("Authentication error")
        return {"status": "error", "message": "Auth failed"}
    try:
        contents = await file.read()
        image    = cv2.imdecode(np.frombuffer(contents, np.uint8), cv2.IMREAD_COLOR)
        if image is None:
            return {"status": "error", "message": "Invalid image", "similarity": 0}
    except Exception as e:
        return {"status": "error", "message": str(e), "similarity": 0}
    return process_frame(image, org_id, use_voting=False, tts_enabled=ENABLE_TTS)


@app.get("/active-sessions")
async def get_active_sessions():
    if not get_service_token():
        return {"status": "error", "message": "Auth failed"}
    try:
        return requests.get(SPRING_ACTIVE_SESSIONS, headers=spring_headers(), timeout=5).json()
    except Exception as e:
        return {"status": "error", "message": str(e)}



@app.websocket("/ws/attendance/{org_id}")
async def ws_attendance(websocket: WebSocket, org_id: str):
    await websocket.accept()
    print(f"[WS] Connected — org_id={org_id}")
    reset_votes(org_id)

    last_processed = 0.0  

    try:
        while True:
            data = await websocket.receive_bytes()

            now = time.time()
            if now - last_processed < WS_THROTTLE_SEC:
                continue
            last_processed = now

            image = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
            if image is None:
                await websocket.send_json({"status": "error", "message": "Bad frame"})
                continue

            loop   = asyncio.get_event_loop()
     
            result = await loop.run_in_executor(
                None, process_frame, image, org_id, True, False
            )
            await websocket.send_json(result)

            if result.get("status") in ("success", "error"):
                
                if result.get("status") == "success":
                    speak_async(result.get("message", "Attendance marked"), force=True)
                break

    except WebSocketDisconnect:
        print(f"[WS] Disconnected — org_id={org_id}")
    except Exception as e:
        print(f"[WS] Error: {e}")
        try:
            await websocket.send_json({"status": "error", "message": str(e)})
        except Exception:
            pass
    finally:
        reset_votes(org_id)



if __name__ == "__main__":
    import uvicorn
    print("\n" + "=" * 70)
    print("🔥 SmartAttend — GOD MODE v2 (All 7 fixes applied)")
    print("   ArcFace + Multi-Embed + Avg Sim + Anti-Spoof + Voting + WS")
    print("=" * 70)
    print(f"  Spring Boot → {SPRING_BASE_URL}")
    print(f"  FastAPI     → http://127.0.0.1:8000")
    print(f"  WebSocket   → ws://127.0.0.1:8000/ws/attendance/{{org_id}}")
    print("=" * 70 + "\n")
    uvicorn.run(app, host="127.0.0.1", port=8000)