import React from 'react'
import { Outlet } from 'react-router-dom'
import { LayoutGrid, Layers, BookOpen, Users, CalendarClock, Radio, BarChart3 } from 'lucide-react'
import Sidebar from '../../components/Sidebar'

const items = [
  { to: '/admin', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/admin/class-sections', label: 'Class Sections', icon: Layers },
  { to: '/admin/subjects', label: 'Subjects', icon: BookOpen },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/lectures', label: 'Lectures', icon: CalendarClock },
  { to: '/admin/live', label: 'Live Attendance', icon: Radio },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
]

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-noise-grid">
      <Sidebar items={items} />
      <main className="flex-1 px-8 py-8 max-w-6xl">
        <Outlet />
      </main>
    </div>
  )
}
