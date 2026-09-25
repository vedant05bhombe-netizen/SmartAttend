import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, BookOpen, Trash2 } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import { Button, Card, Input, Select, Modal, Table, Loader, EmptyState, Badge } from '../../components/ui'
import * as api from '../../api/endpoints'
import { errMsg } from '../../api/client'

export default function Subjects() {
  const [subjects, setSubjects] = useState([])
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', code: '', classSectionId: '' })

  const load = async () => {
    setLoading(true)
    try {
      const [subs, secs] = await Promise.all([api.listSubjects(), api.listClassSections()])
      setSubjects(subs)
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
      await api.createSubject(form)
      toast.success('Subject created')
      setOpen(false)
      setForm({ name: '', code: '', classSectionId: '' })
      load()
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    try {
      await api.deleteSubject(id)
      toast.success('Deleted')
      load()
    } catch (err) {
      toast.error(errMsg(err))
    }
  }

  return (
    <>
      <PageHeader
        title="Subjects"
        subtitle="Subjects taught to each class section"
        action={<Button onClick={() => setOpen(true)} disabled={sections.length === 0}><Plus className="h-4 w-4" /> New subject</Button>}
      />

      <Card>
        {loading ? <Loader /> : subjects.length === 0 ? (
          <EmptyState icon={BookOpen} title="No subjects yet" subtitle={sections.length === 0 ? 'Create a class section first.' : 'Add subjects to start scheduling lectures.'} />
        ) : (
          <Table
            columns={[
              { key: 'name', header: 'Subject' },
              { key: 'code', header: 'Code', render: (r) => r.code || '—' },
              { key: 'section', header: 'Section', render: (r) => <Badge>{sectionName(r.classSectionId)}</Badge> },
              { key: 'actions', header: '', render: (r) => (
                <button onClick={() => remove(r.id)} className="text-white/30 hover:text-danger transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              ) },
            ]}
            rows={subjects}
          />
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="New subject">
        <form onSubmit={submit} className="space-y-4">
          <Input label="Subject name" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Data Structures" />
          <Input label="Code" value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CS201" />
          <Select label="Class section" required value={form.classSectionId}
            onChange={(e) => setForm({ ...form, classSectionId: e.target.value })}>
            <option value="">Select section</option>
            {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Button type="submit" loading={saving} className="w-full">Create</Button>
        </form>
      </Modal>
    </>
  )
}
