import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ScanFace, Building2, GraduationCap, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button, Input, Card } from '../components/ui'
import { errMsg } from '../api/client'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('ADMIN')
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await login(form)
      toast.success(`Welcome back, ${data.name.split(' ')[0]}`)
      navigate(data.role === 'ADMIN' ? '/admin' : '/student')
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-noise-grid px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="h-9 w-9 rounded-lg bg-volt/10 border border-volt/30 flex items-center justify-center">
            <ScanFace className="h-5 w-5 text-volt" />
          </div>
          <span className="font-display font-bold tracking-tight text-lg">SmartAttend</span>
        </div>

        <Card>
          <div className="flex bg-panel2 border border-edge rounded-xl p-1 mb-6">
            {[
              { key: 'ADMIN', label: 'Admin', icon: Building2 },
              { key: 'STUDENT', label: 'Student', icon: GraduationCap },
            ].map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRole(r.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  role === r.key ? 'bg-volt text-ink' : 'text-white/50 hover:text-white'
                }`}
              >
                <r.icon className="h-3.5 w-3.5" /> {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@institute.edu"
            />
            <Input
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
            <Button type="submit" loading={loading} className="w-full mt-2">
              Sign in as {role === 'ADMIN' ? 'Admin' : 'Student'} <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-white/35 mt-6">
          New here?{' '}
          <Link to="/signup/org" className="text-volt hover:underline">Register institute</Link>
          {' '}or{' '}
          <Link to="/signup/student" className="text-volt hover:underline">join as student</Link>
        </p>
      </div>
    </div>
  )
}
