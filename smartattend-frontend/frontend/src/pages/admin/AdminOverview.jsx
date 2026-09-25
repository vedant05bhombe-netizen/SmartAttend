import React, { useEffect, useState } from 'react'
import { Layers, Users, CalendarClock, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/PageHeader'
import { StatCard, Card, Loader } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import * as api from '../../api/endpoints'
import { errMsg } from '../../api/client'

export default function AdminOverview() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ sections: 0, students: 0, active: 0 })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const [sections, students, active] = await Promise.all([
          api.listClassSections(),
          api.listStudents(),
          api.listActiveSessions(),
        ])
        setStats({ sections: sections.length, students: students.length, active: active.length })
      } catch (err) {
        toast.error(errMsg(err))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const copyCode = () => {
    navigator.clipboard.writeText(user.orgCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <PageHeader title={`Welcome back, ${user.name.split(' ')[0]}`} subtitle={user.orgName} />

      <Card className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-white/40 mb-1.5">Organization join code</p>
          <p className="font-display text-2xl font-bold text-volt tracking-wider">{user.orgCode}</p>
          <p className="text-xs text-white/35 mt-1">Share this with other admins and students so they can join.</p>
        </div>
        <button onClick={copyCode} className="flex items-center gap-2 border border-edge hover:border-volt/50 rounded-lg px-4 py-2.5 text-sm text-white/70 hover:text-volt transition-colors">
          {copied ? <Check className="h-4 w-4 text-volt" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy code'}
        </button>
      </Card>

      {loading ? <Loader /> : (
        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard label="Class sections" value={stats.sections} icon={Layers} accent="volt" />
          <StatCard label="Students enrolled" value={stats.students} icon={Users} accent="cyan" />
          <StatCard label="Lectures live now" value={stats.active} icon={CalendarClock} accent="magenta" />
        </div>
      )}
    </>
  )
}
