import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Users, Trash2, ScanFace, CheckCircle2, XCircle } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import { Button, Card, Input, Select, Modal, Table, Loader, EmptyState, Badge } from '../../components/ui'
import WebcamCapture from '../../components/WebcamCapture'
import * as api from '../../api/endpoints'
import { errMsg } from '../../api/client'
import { registerFace } from '../../api/faceClient'

export default function Students() {
  const [students, setStudents] = useState([])
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [faceOpen, setFaceOpen] = useState(false)
  const [activeStudent, setActiveStudent] = useState(null)
  const [saving, setSaving] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', rollNo: '', classSectionId: '' })
  const camRef = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const [studs, secs] = await Promise.all([api.listStudents(), api.listClassSections()])
      setStudents(studs)
      setSections(secs)
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const sectionName = (id) => sections.find((s) => s.id === id)?.name || '—'

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.addStudent(form)
      toast.success('Student added')
      setAddOpen(false)
      setForm({ name: '', email: '', password: '', rollNo: '', classSectionId: '' })
      load()
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    try {
      await api.deleteStudent(id)
      toast.success('Removed')
      load()
    } catch (err) {
      toast.error(errMsg(err))
    }
  }

  const openFaceModal = (student) => {
    setActiveStudent(student)
    setFaceOpen(true)
  }

  const capture = async () => {
    if (!activeStudent) return
    setCapturing(true)
    try {
      const blob = await camRef.current?.captureBlob()
      if (!blob) throw new Error('Could not capture frame')
      const res = await registerFace(activeStudent.id, blob)
      if (res.status === 'success') {
        toast.success(res.message || 'Face registered')
        setFaceOpen(false)
        load()
      } else {
        toast.error(res.message || 'Registration failed')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setCapturing(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Students"
        subtitle="Roster and face-registration status"
        action={<Button onClick={() => setAddOpen(true)} disabled={sections.length === 0}><Plus className="h-4 w-4" /> Add student</Button>}
      />

      <Card>
        {loading ? <Loader /> : students.length === 0 ? (
          <EmptyState icon={Users} title="No students yet" subtitle={sections.length === 0 ? 'Create a class section first.' : 'Add students or share your org join code.'} />
        ) : (
          <Table
            columns={[
              { key: 'name', header: 'Name' },
              { key: 'rollNo', header: 'Roll No' },
              { key: 'section', header: 'Section', render: (r) => <Badge>{sectionName(r.classSectionId)}</Badge> },
              { key: 'face', header: 'Face', render: (r) => r.faceRegistered
                  ? <Badge tone="volt"><CheckCircle2 className="h-3 w-3 inline -mt-0.5 mr-1" />Registered</Badge>
                  : <Badge tone="warn"><XCircle className="h-3 w-3 inline -mt-0.5 mr-1" />Missing</Badge> },
              { key: 'actions', header: '', render: (r) => (
                <div className="flex items-center gap-3">
                  <button onClick={() => openFaceModal(r)} className="text-white/40 hover:text-volt transition-colors" title="Register face">
                    <ScanFace className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(r.id)} className="text-white/30 hover:text-danger transition-colors" title="Remove">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) },
            ]}
            rows={students}
          />
        )}
      </Card>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add student">
        <form onSubmit={submit} className="space-y-4">
          <Select label="Class section" required value={form.classSectionId}
            onChange={(e) => setForm({ ...form, classSectionId: e.target.value })}>
            <option value="">Select section</option>
            {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Input label="Full name" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Student name" />
          <Input label="Roll number" required value={form.rollNo}
            onChange={(e) => setForm({ ...form, rollNo: e.target.value })} placeholder="21IT045" />
          <Input label="Email" type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="student@institute.edu" />
          <Input label="Temporary password" type="password" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          <Button type="submit" loading={saving} className="w-full">Add student</Button>
        </form>
      </Modal>

      <Modal open={faceOpen} onClose={() => setFaceOpen(false)} title={`Register face — ${activeStudent?.name || ''}`}>
        <div className="space-y-4">
          <WebcamCapture ref={camRef} active={faceOpen} className="aspect-video w-full" />
          <p className="text-xs text-white/40">Center the face, ensure good lighting, then capture. Multiple angles improve matching.</p>
          <Button onClick={capture} loading={capturing} className="w-full">Capture &amp; save</Button>
        </div>
      </Modal>
    </>
  )
}
