import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, ScanFace } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ items }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col border-r border-edge glass">
      <div className="px-6 py-6 flex items-center gap-2.5 border-b border-edge">
        <div className="h-9 w-9 rounded-lg bg-volt/10 border border-volt/30 flex items-center justify-center">
          <ScanFace className="h-5 w-5 text-volt" strokeWidth={2} />
        </div>
        <div>
          <p className="font-display font-bold text-white leading-none tracking-tight">SmartAttend</p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/30 mt-1">{user?.role}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-volt/10 text-volt border border-volt/30'
                  : 'text-white/55 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`
            }
          >
            <item.icon className="h-4 w-4" strokeWidth={2} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-5 border-t border-edge">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-volt to-cyan flex items-center justify-center text-ink font-display font-bold text-xs">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/35 truncate">{user?.orgName}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="w-full flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-white/40 hover:text-danger border border-edge hover:border-danger/40 rounded-lg py-2 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </aside>
  )
}
