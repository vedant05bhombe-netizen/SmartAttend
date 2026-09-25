import client, { unwrap } from './client'

// ---- auth ----
export const orgSignup = (payload) => unwrap(client.post('/auth/org/signup', payload))
export const adminJoin = (payload) => unwrap(client.post('/auth/admin/join', payload))
export const studentSignup = (payload) => unwrap(client.post('/auth/student/signup', payload))
export const login = (payload) => unwrap(client.post('/auth/login', payload))

// ---- public (pre-auth) ----
export const lookupOrgByCode = (code) => unwrap(client.get('/public/org', { params: { code } }))
export const publicClassSections = (orgCode) => unwrap(client.get('/public/class-sections', { params: { orgCode } }))

// ---- class sections ----
export const listClassSections = () => unwrap(client.get('/class-sections'))
export const createClassSection = (payload) => unwrap(client.post('/class-sections', payload))
export const deleteClassSection = (id) => unwrap(client.delete(`/class-sections/${id}`))

// ---- subjects ----
export const listSubjects = (classSectionId) =>
  unwrap(client.get('/subjects', { params: classSectionId ? { classSectionId } : {} }))
export const createSubject = (payload) => unwrap(client.post('/subjects', payload))
export const deleteSubject = (id) => unwrap(client.delete(`/subjects/${id}`))

// ---- students ----
export const listStudents = (classSectionId) =>
  unwrap(client.get('/students', { params: classSectionId ? { classSectionId } : {} }))
export const addStudent = (payload) => unwrap(client.post('/students', payload))
export const getMyProfile = () => unwrap(client.get('/students/me'))
export const deleteStudent = (id) => unwrap(client.delete(`/students/${id}`))

// ---- sessions (lectures) ----
export const listActiveSessions = () => unwrap(client.get('/sessions/active'))
export const listSessions = () => unwrap(client.get('/sessions'))
export const startSession = (payload) => unwrap(client.post('/sessions/start', payload))
export const endSession = (id) => unwrap(client.post(`/sessions/${id}/end`))

// ---- attendance ----
export const myAttendance = () => unwrap(client.get('/attendance/me'))
export const orgAttendance = (classSectionId) =>
  unwrap(client.get('/attendance', { params: classSectionId ? { classSectionId } : {} }))
export const sessionAttendance = (sessionId) => unwrap(client.get(`/attendance/session/${sessionId}`))
