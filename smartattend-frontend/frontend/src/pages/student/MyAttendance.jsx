import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CalendarCheck } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import { Card, Table, Loader, EmptyState, Badge } from '../../components/ui'
import * as api from '../../api/endpoints'
import { errMsg } from '../../api/client'

export default function MyAttendance() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.myAttendance()
      .then((data) => setRows(data.sort((a, b) => new Date(b.markedAt) - new Date(a.markedAt))))
      .catch((err) => toast.error(errMsg(err)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageHeader title="My Attendance" subtitle="Every lecture you've been marked present for" />
      <Card>
        {loading ? <Loader /> : rows.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No attendance yet" subtitle="Once your admin starts a lecture and your face is recognized, records show up here." />
        ) : (
          <Table
            columns={[
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
