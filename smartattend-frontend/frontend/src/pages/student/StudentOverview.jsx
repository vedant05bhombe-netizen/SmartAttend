import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CalendarCheck, ScanFace, TrendingUp, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import { StatCard, Card, Loader, Badge } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import * as api from '../../api/endpoints'
import { errMsg } from '../../api/client'

export default function StudentOverview() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [records, setRecords] = useState([])

  useEffect(() => {
    (async () => {
      try {
        const [me, mine] = await Promise.all([api.getMyProfile(), api.myAttendance()])
        setProfile(me)
        setRecords(mine.sort((a, b) => new Date(b.markedAt) - new Date(a.markedAt)))
      } catch (err) {
        toast.error(errMsg(err))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <Loader />

  const subjectsCovered = new Set(records.map((r) => r.subjectName)).size

  return (
    <>
      <PageHeader title={`Hey, ${user.name.split(' ')[0]}`} subtitle={`${user.orgName} · Roll No. ${profile?.rollNo || '—'}`} />

      {!profile?.faceRegistered && (
        <Card className="mb-6 border border-warn/30 bg-warn/5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <ScanFace className="h-6 w-6 text-warn" />
            <div>
              <p className="font-display font-semibold text-warn">Face ID not set up</p>
              <p className="text-sm text-white/50">You won't be marked present until your face is registered.</p>
            </div>
          </div>
          <Link to="/student/face" className="inline-flex items-center gap-1.5 bg-warn text-ink font-display font-semibold text-sm px-4 py-2 rounded-lg">
            Set up now <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total attendance marks" value={records.length} icon={CalendarCheck} accent="volt" />
        <StatCard label="Subjects attended" value={subjectsCovered} icon={TrendingUp} accent="cyan" />
        <StatCard label="Face ID" value={profile?.faceRegistered ? 'Active' : 'Missing'} icon={ScanFace} accent={profile?.faceRegistered ? 'volt' : 'magenta'} />
      </div>

      <Card>
        <p className="font-display font-semibold mb-4">Recent marks</p>
        {records.length === 0 ? (
          <p className="text-sm text-white/35">No attendance recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {records.slice(0, 6).map((r) => (
              <div key={r.id} className="flex items-center justify-between border-b border-edge/60 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm text-white font-medium">{r.subjectName}</p>
                  <p className="text-xs text-white/35">{new Date(r.markedAt).toLocaleString()}</p>
                </div>
                <Badge tone="volt">{r.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  )
}
