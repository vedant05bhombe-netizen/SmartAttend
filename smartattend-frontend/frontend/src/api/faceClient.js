import axios from 'axios'

export const FACE_API_URL = import.meta.env.VITE_FACE_API_URL || 'http://localhost:8000'
export const FACE_WS_URL = FACE_API_URL.replace(/^http/, 'ws')

export const faceClient = axios.create({ baseURL: FACE_API_URL })

export async function registerFace(studentId, blob) {
  const form = new FormData()
  form.append('student_db_id', studentId)
  form.append('file', blob, 'face.jpg')
  const res = await faceClient.post('/register-face', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function markAttendanceOnce(orgId, blob) {
  const form = new FormData()
  form.append('org_id', orgId)
  form.append('file', blob, 'frame.jpg')
  const res = await faceClient.post('/attendance', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export function openAttendanceSocket(orgId) {
  return new WebSocket(`${FACE_WS_URL}/ws/attendance/${orgId}`)
}
