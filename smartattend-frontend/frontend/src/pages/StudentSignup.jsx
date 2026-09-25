import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ScanFace, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button, Input, Select, Card } from '../components/ui'
import { errMsg } from '../api/client'
import { lookupOrgByCode, publicClassSections } from '../api/endpoints'

export default function StudentSignup() {
  const { signupStudent } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ orgCode: '', classSectionId: '', name: '', email: '', password: '', rollNo: '' })
  const [org, setOrg] = useState(null)
  const [sections, setSections] = useState([])
  const [checking, setChecking] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const code = form.orgCode.trim()
    if (code.length < 4) { setOrg(null); setSections([]); return }
    const t = setTimeout(async () => {
      setChecking(true)
      try {
        const o = await lookupOrgByCode(code)
        const cs = await publicClassSections(code)
        setOrg(o)
        setSections(cs)
      } catch {
        setOrg(null)
        setSections([])
      } finally {
        setChecking(false)
      }
    }, 500)
    return () => clearTimeout(t)
  }, [form.orgCode])

  const submit = async (e) => {
    e.preventDefault()
    if (!org) return toast.error('Enter a valid organization code first')
    setLoading(true)
    try {
      await signupStudent(form)
      toast.success('Welcome to SmartAttend!')
      navigate('/student')
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-noise-grid px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="h-9 w-9 rounded-lg bg-volt/10 border border-volt/30 flex items-center justify-center">
            <ScanFace className="h-5 w-5 text-volt" />
          </div>
          <span className="font-display font-bold tracking-tight text-lg">SmartAttend</span>
        </div>

        <Card>
          <p className="font-display font-semibold text-lg mb-1">Join as a student</p>
          <p className="text-sm text-white/40 mb-6">Ask your admin for your institute's join code.</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Input label="Organization code" required value={form.orgCode}
                onChange={(e) => setForm({ ...form, orgCode: e.target.value.toUpperCase() })} placeholder="ORG-XXXXXX" />
              {checking && <p className="text-xs text-white/30 mt-1.5 font-mono">Checking…</p>}
              {!checking && org && <p className="text-xs text-volt mt-1.5 font-mono">✓ {org.name}</p>}
            </div>
            <Select label="Class section" required value={form.classSectionId}
              onChange={(e) => setForm({ ...form, classSectionId: e.target.value })} disabled={!org}>
              <option value="">{org ? 'Select your class' : 'Enter org code first'}</option>
              {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <Input label="Full name" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
            <Input label="Roll number" required value={form.rollNo}
              onChange={(e) => setForm({ ...form, rollNo: e.target.value })} placeholder="21IT045" />
            <Input label="Email" type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@student.edu" />
            <Input label="Password" type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            <Button type="submit" loading={loading} className="w-full mt-2">
              Create account <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-white/35 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-volt hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
