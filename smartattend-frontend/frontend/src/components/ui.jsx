import React from 'react'

export function Button({ children, variant = 'primary', className = '', loading, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-display font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'
  const variants = {
    primary: 'bg-volt text-ink hover:shadow-volt hover:bg-volt2',
    ghost: 'bg-transparent border border-edge text-white hover:border-volt/60 hover:text-volt',
    danger: 'bg-danger/10 border border-danger/40 text-danger hover:bg-danger/20',
    subtle: 'bg-panel2 border border-edge text-white/80 hover:text-white hover:border-white/20',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> : children}
    </button>
  )
}

export function Card({ children, className = '' }) {
  return <div className={`glass rounded-2xl shadow-glass p-6 ${className}`}>{children}</div>
}

export function Input({ label, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-mono uppercase tracking-wider text-white/50 mb-1.5">{label}</span>}
      <input
        className={`w-full bg-panel2 border border-edge rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-volt/60 focus:ring-1 focus:ring-volt/30 transition-colors ${className}`}
        {...props}
      />
    </label>
  )
}

export function Select({ label, className = '', children, ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-mono uppercase tracking-wider text-white/50 mb-1.5">{label}</span>}
      <select
        className={`w-full bg-panel2 border border-edge rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-volt/60 focus:ring-1 focus:ring-volt/30 transition-colors ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  )
}

export function Badge({ children, tone = 'default' }) {
  const tones = {
    default: 'bg-white/5 text-white/70 border-white/10',
    volt: 'bg-volt/10 text-volt border-volt/30',
    danger: 'bg-danger/10 text-danger border-danger/30',
    warn: 'bg-warn/10 text-warn border-warn/30',
    cyan: 'bg-cyan/10 text-cyan border-cyan/30',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wide border ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function StatCard({ label, value, sub, icon: Icon, accent = 'volt' }) {
  const accents = { volt: 'text-volt', cyan: 'text-cyan', magenta: 'text-magenta', warn: 'text-warn' }
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-white/40 mb-2">{label}</p>
          <p className="font-display text-3xl font-bold text-white">{value}</p>
          {sub && <p className="text-xs text-white/40 mt-1">{sub}</p>}
        </div>
        {Icon && <Icon className={`h-8 w-8 ${accents[accent]} opacity-80`} strokeWidth={1.5} />}
      </div>
    </Card>
  )
}

export function EmptyState({ title, subtitle, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && <Icon className="h-10 w-10 text-white/20 mb-3" strokeWidth={1.5} />}
      <p className="font-display font-semibold text-white/70">{title}</p>
      {subtitle && <p className="text-sm text-white/35 mt-1 max-w-sm">{subtitle}</p>}
    </div>
  )
}

export function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-white/40">
      <span className="h-5 w-5 rounded-full border-2 border-volt border-t-transparent animate-spin" />
      <span className="text-sm font-mono">{label}</span>
    </div>
  )
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl shadow-glass w-full max-w-md p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Table({ columns, rows, keyField = 'id' }) {
  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-white/40 font-mono text-xs uppercase tracking-wider border-b border-edge">
            {columns.map((c) => (
              <th key={c.key} className="px-2 py-3 font-medium">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[keyField]} className="border-b border-edge/60 hover:bg-white/[0.02] transition-colors">
              {columns.map((c) => (
                <td key={c.key} className="px-2 py-3 text-white/85">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
