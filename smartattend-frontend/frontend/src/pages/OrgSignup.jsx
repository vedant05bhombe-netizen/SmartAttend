import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ScanFace, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button, Input, Card } from '../components/ui'
import { errMsg } from '../api/client'

export default function OrgSignup() {
  const { signupOrg } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ orgName: '', adminName: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await signupOrg(form)
      toast.success(`Organization created! Your join code is ${data.orgId ? '' : ''}`)
      navigate('/admin')
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
          <p className="font-display font-semibold text-lg mb-1">Register your institute</p>
          <p className="text-sm text-white/40 mb-6">This creates your organization and your first admin account.</p>
          <form onSubmit={submit} className="space-y-4">
            <Input label="Institute name" required value={form.orgName}
              onChange={(e) => setForm({ ...form, orgName: e.target.value })} placeholder="Prof. Ram Meghe Institute" />
            <Input label="Your name" required value={form.adminName}
              onChange={(e) => setForm({ ...form, adminName: e.target.value })} placeholder="Admin full name" />
            <Input label="Email" type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@institute.edu" />
            <Input label="Password" type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            <Button type="submit" loading={loading} className="w-full mt-2">
              Create organization <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-white/35 mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-volt hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
