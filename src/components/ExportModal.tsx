import { useState } from 'react'
import { normalizeSlug } from '../utils'

interface Props {
  brandSlug: string
  onBrandSlugChange: (v: string) => void
  onClose: () => void
  onExport: (slug: string) => Promise<void>
}

export default function ExportModal({ brandSlug, onBrandSlugChange, onClose, onExport }: Props) {
  const [busy, setBusy] = useState(false)
  const slug = normalizeSlug(brandSlug)
  const valid = slug.length > 0

  async function handleExport() {
    if (!valid || busy) return
    setBusy(true)
    try { await onExport(slug) } finally { setBusy(false) }
  }

  const MONO = 'ui-monospace,"Cascadia Code",Menlo,"Courier New",monospace'

  return (
    <div
      onMouseDown={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        onMouseDown={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 16, padding: '28px 28px 24px', width: 420, maxWidth: 'calc(100vw - 48px)', boxShadow: '0 24px 80px rgba(0,0,0,.28),0 0 0 1px rgba(0,0,0,.06)' }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Export Demo</div>
        <div style={{ fontSize: 13, lineHeight: 1.55, color: '#86868f', marginBottom: 22 }}>
          Name the folder for deployment at{' '}
          <code style={{ fontFamily: MONO, fontSize: 11.5, background: '#f3f3f5', padding: '2px 6px', borderRadius: 4, color: '#1b1b1f' }}>/demo/{'{brand-slug}'}/</code>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          <label style={{ fontSize: 11.5, fontWeight: 500, color: '#86868f' }}>Brand Slug</label>
          <input
            value={brandSlug}
            onChange={e => onBrandSlugChange(e.target.value)}
            placeholder="e.g. bdnews24, ice-audio, mtb-bank"
            autoFocus
            style={{ height: 36, border: '1px solid #e2e2e7', borderRadius: 8, padding: '0 12px', fontSize: 13, color: '#1b1b1f', background: '#fafafb', fontFamily: MONO, width: '100%', outline: 'none', boxSizing: 'border-box' }}
          />
          <div style={{ fontSize: 11, color: '#a0a0a8' }}>Lowercase, hyphens for spaces. No special characters.</div>
        </div>

        {valid && (
          <div style={{ background: '#f6f6f8', border: '1px solid #eaeaea', borderRadius: 10, padding: '12px 14px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#86868f', letterSpacing: '0.03em', textTransform: 'uppercase', marginBottom: 2 }}>Preview</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontFamily: MONO, color: '#1b1b1f' }}>
              <span style={{ color: '#a0a0a8', fontSize: 11 }}>ZIP</span> {slug}.zip
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontFamily: MONO, color: '#1b1b1f' }}>
              <span style={{ color: '#a0a0a8', fontSize: 11 }}>HTML</span> {slug}/index.html
            </div>
            <div style={{ height: 1, background: '#eaeaea', margin: '2px 0' }} />
            <div style={{ fontSize: 12, color: '#2563eb', fontFamily: MONO }}>
              https://horizonexp.com/demo/{slug}/
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ height: 34, padding: '0 14px', border: '1px solid #e2e2e7', borderRadius: 8, background: '#fff', fontSize: 12.5, fontWeight: 500, color: '#1b1b1f', cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={!valid || busy}
            style={{ height: 34, padding: '0 16px', border: 'none', borderRadius: 8, background: valid ? '#2563eb' : '#93c5fd', fontSize: 12.5, fontWeight: 600, color: '#fff', cursor: valid ? 'pointer' : 'not-allowed', fontFamily: 'inherit', opacity: busy ? 0.7 : 1 }}
          >
            {busy ? 'Exporting…' : 'Export ZIP'}
          </button>
        </div>
      </div>
    </div>
  )
}
