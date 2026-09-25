import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { BarChart3 } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import { Card, Select, Table, Loader, EmptyState, Badge } from '../../components/ui'
import * as api from '../../api/endpoints'
import { errMsg } from '../../api/client'

export default function Reports() {
  const [sections, setSections] = useState([])
  const [sectionId, setSectionId] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.listClassSections().then(setSections).catch((err) => toast.error(errMsg(err)))
  }, [])

  useEffect(() => {
    setLoading(true)
    api.orgAttendance(sectionId || undefined)
      .then((data) => setRows(data.sort((a, b) => new Date(b.markedAt) - new Date(a.markedAt))))
      .catch((err) => toast.error(errMsg(err)))
      .finally(() => setLoading(false))
  }, [sectionId])

  return (
    <>
      <PageHeader
        title="Attendance Reports"
        subtitle="Every face-verified attendance record across your organization"
        action={
          <Select value={sectionId} onChange={(e) => setSectionId(e.target.value)} className="w-56">
            <option value="">All sections</option>
            {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        }
      />

      <Card>
        {loading ? <Loader /> : rows.length === 0 ? (
          <EmptyState icon={BarChart3} title="No attendance records yet" subtitle="Records appear here as lectures happen and faces are matched." />
        ) : (
          <Table
            columns={[
              { key: 'studentName', header: 'Student' },
              { key: 'subjectName', header: 'Subject' },
              { key: 'markedAt', header: 'Marked at', render: (r) => new Date(r.markedAt).toLocaleString() },
              { key: 'confidence', header: 'Confidence', render: (r) => <Badge tone="cyan">{Math.round((r.confidence ?? 0) * 100)}%</Badge> },
              { key: 'status', header: 'Status', render: (r) => <Badge tone="volt">{r.status}</Badge> },
            ]}
            rows={rows}
          />
        )}
      </Card>
    </>
  )
}
