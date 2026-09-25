import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'

import Landing from './pages/Landing'
import Login from './pages/Login'
import OrgSignup from './pages/OrgSignup'
import StudentSignup from './pages/StudentSignup'

import AdminLayout from './pages/admin/AdminLayout'
import AdminOverview from './pages/admin/AdminOverview'
import ClassSections from './pages/admin/ClassSections'
import Subjects from './pages/admin/Subjects'
import Students from './pages/admin/Students'
import Lectures from './pages/admin/Lectures'
import LiveAttendance from './pages/admin/LiveAttendance'
import Reports from './pages/admin/Reports'

import StudentLayout from './pages/student/StudentLayout'
import StudentOverview from './pages/student/StudentOverview'
import MyAttendance from './pages/student/MyAttendance'
import RegisterFace from './pages/student/RegisterFace'

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student'} /> : <Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup/org" element={<OrgSignup />} />
      <Route path="/signup/student" element={<StudentSignup />} />

      <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminOverview />} />
        <Route path="class-sections" element={<ClassSections />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="students" element={<Students />} />
        <Route path="lectures" element={<Lectures />} />
        <Route path="live" element={<LiveAttendance />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      <Route path="/student" element={<ProtectedRoute role="STUDENT"><StudentLayout /></ProtectedRoute>}>
        <Route index element={<StudentOverview />} />
        <Route path="attendance" element={<MyAttendance />} />
        <Route path="face" element={<RegisterFace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
