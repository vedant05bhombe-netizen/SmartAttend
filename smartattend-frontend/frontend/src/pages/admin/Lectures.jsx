import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Play, Square, CalendarClock, Radio } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import { Button, Card, Select, Table, Loader, EmptyState, Badge } from '../../components/ui'
import * as api from '../../api/endpoints'
import { errMsg } from '../../api/client'

export default function Lectures() {
  const [sessions, setSessions] = useState([])
  const [sections, setSections] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [form, setForm] = useState({ classSectionId: '', subjectId: '' })

  const load = async () => {
    setLoading(true)
    try {
      const [sess, secs] = await Promise.all([api.listSessions(), api.listClassSections()])
      setSessions(sess.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)))
      setSections(secs)
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!form.classSectionId) { setSubjects([]); return }
    api.listSubjects(form.classSectionId).then(setSubjects).catch(() => setSubjects([]))
  }, [form.classSectionId])

  const sectionName = (id) => sections.find((s) => s.id === id)?.name || '—'

  const start = async (e) => {
    e.preventDefault()
    setStarting(true)
    try {
      await api.startSession(form)
      toast.success('Lecture started — live attendance is now open')
      setForm({ classSectionId: '', subjectId: '' })
      load()
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setStarting(false)
    }
  }

  const end = async (id) => {
    try {
      await api.endSession(id)
      toast.success('Lecture ended')
      load()
    } catch (err) {
      toast.error(errMsg(err))
    }
  }

  return (
    <>
      <PageHeader title="Lectures" subtitle="Start a session so students can be marked present by face" />

      <Card className="mb-6">
        <p className="font-display font-semibold mb-4">Start a new lecture</p>
        <form onSubmit={start} className="grid sm:grid-cols-3 gap-4 items-end">
          <Select label="Class section" required value={form.classSectionId}
            onChange={(e) => setForm({ classSectionId: e.target.value, subjectId: '' })}>
            <option value="">Select section</option>
            {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Select label="Subject" required value={form.subjectId} disabled={!form.classSectionId}
            onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
            <option value="">{form.classSectionId ? 'Select subject' : 'Choose section first'}</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Button type="submit" loading={starting} disabled={!form.subjectId}>
            <Play className="h-4 w-4" /> Start lecture
          </Button>
        </form>
      </Card>

      <Card>
        {loading ? <Loader /> : sessions.length === 0 ? (
          <EmptyState icon={CalendarClock} title="No lectures yet" subtitle="Start one above to begin taking attendance." />
        ) : (
          <Table
            columns={[
              { key: 'subjectName', header: 'Subject' },
              { key: 'section', header: 'Section', render: (r) => <Badge>{sectionName(r.classSectionId)}</Badge> },
              { key: 'startTime', header: 'Started', render: (r) => new Date(r.startTime).toLocaleString() },
              { key: 'status', header: 'Status', render: (r) => r.active ? <Badge tone="volt">Live</Badge> : <Badge>Ended</Badge> },
              { key: 'actions', header: '', render: (r) => r.active ? (
                <div className="flex items-center gap-3">
                  <Link to="/admin/live" className="text-white/40 hover:text-volt transition-colors" title="Open live view">
                    <Radio className="h-4 w-4" />
                  </Link>
                  <button onClick={() => end(r.id)} className="text-white/30 hover:text-danger transition-colors" title="End lecture">
                    <Square className="h-4 w-4" />
                  </button>
                </div>
              ) : null },
            ]}
            rows={sessions}
          />
        )}
      </Card>
    </>
  )
}
