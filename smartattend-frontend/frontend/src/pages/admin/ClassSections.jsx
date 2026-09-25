import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Layers, Trash2 } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import { Button, Card, Input, Modal, Table, Loader, EmptyState } from '../../components/ui'
import * as api from '../../api/endpoints'
import { errMsg } from '../../api/client'

export default function ClassSections() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', department: '', year: '' })

  const load = async () => {
    setLoading(true)
    try {
      setSections(await api.listClassSections())
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.createClassSection(form)
      toast.success('Class section created')
      setOpen(false)
      setForm({ name: '', department: '', year: '' })
      load()
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    try {
      await api.deleteClassSection(id)
      toast.success('Deleted')
      load()
    } catch (err) {
      toast.error(errMsg(err))
    }
  }

  return (
    <>
      <PageHeader
        title="Class Sections"
        subtitle="Organize students into sections lectures can target"
        action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New section</Button>}
      />

      <Card>
        {loading ? <Loader /> : sections.length === 0 ? (
          <EmptyState icon={Layers} title="No class sections yet" subtitle="Create one to start adding students and subjects." />
        ) : (
          <Table
            columns={[
              { key: 'name', header: 'Name' },
              { key: 'department', header: 'Department' },
              { key: 'year', header: 'Year' },
              { key: 'actions', header: '', render: (r) => (
                <button onClick={() => remove(r.id)} className="text-white/30 hover:text-danger transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              ) },
            ]}
            rows={sections}
          />
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="New class section">
        <form onSubmit={submit} className="space-y-4">
          <Input label="Section name" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="TY-IT-A" />
          <Input label="Department" value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Information Technology" />
          <Input label="Year" value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="3rd Year" />
          <Button type="submit" loading={saving} className="w-full">Create</Button>
        </form>
      </Modal>
    </>
  )
}
