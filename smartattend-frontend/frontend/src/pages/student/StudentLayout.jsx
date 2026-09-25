import React from 'react'
import { Outlet } from 'react-router-dom'
import { LayoutGrid, CalendarCheck, ScanFace } from 'lucide-react'
import Sidebar from '../../components/Sidebar'

const items = [
  { to: '/student', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/student/attendance', label: 'My Attendance', icon: CalendarCheck },
  { to: '/student/face', label: 'Face ID', icon: ScanFace },
]

export default function StudentLayout() {
  return (
    <div className="flex min-h-screen bg-noise-grid">
      <Sidebar items={items} />
      <main className="flex-1 px-8 py-8 max-w-5xl">
        <Outlet />
      </main>
    </div>
  )
}
