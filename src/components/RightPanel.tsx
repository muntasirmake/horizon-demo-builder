import type { Hotspot, EntryPointType } from '../types'
import { getLockedHeight } from '../utils'

interface Props {
  hotspot: Hotspot
  imgW: number
  onChange: (patch: Partial<Hotspot>) => void
  onDelete: () => void
  onDuplicate: () => void
}

const F: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 }
const LBL: React.CSSProperties = { fontSize: 11.5, fontWeight: 500, color: '#86868f' }
const INPUT: React.CSSProperties = { height: 32, border: '1px solid #e2e2e7', borderRadius: 8, padding: '0 10px', fontSize: 12.5, background: '#fafafb', color: '#1b1b1f', width: '100%', fontFamily: 'inherit', outline: 'none' }
const HINT: React.CSSProperties = { fontSize: 11, color: '#a0a0a8' }

export default function RightPanel({ hotspot: hs, imgW, onChange, onDelete, onDuplicate }: Props) {
  const lockedH = getLockedHeight(hs.entryPointType, imgW)

  function numChange(field: 'x' | 'y' | 'w') {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseInt(e.target.value, 10)
      if (isNaN(v)) return
      if (field === 'x') onChange({ x: Math.max(0, v) })
      if (field === 'y') onChange({ y: Math.max(0, v) })
      if (field === 'w') onChange({ w: Math.max(48, v) })
    }
  }

  function setType(e: React.ChangeEvent<HTMLSelectElement>) {
    const t = e.target.value as EntryPointType
    onChange({ entryPointType: t, h: getLockedHeight(t, imgW) })
  }

  return (
    <div style={{ width: 272, flexShrink: 0, background: '#fff', borderLeft: '1px solid #e6e6ea', overflowY: 'auto', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif' }}>
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f0f0f3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Hotspot</div>
        <div style={{ fontSize: 11, color: '#a0a0a8' }}>#{hs.id}</div>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Entry Point Type */}
        <div style={F}>
          <label style={LBL}>Entry Point Type</label>
          <select value={hs.entryPointType} onChange={setType} style={{ ...INPUT, height: 32, cursor: 'pointer' }}>
            <option value="rectangle-row">Rectangle Row</option>
            <option value="circle-row">Circle Row</option>
          </select>
          <div style={HINT}>Height is locked automatically by type.</div>
        </div>

        {/* Label */}
        <div style={F}>
          <label style={LBL}>Label</label>
          <input value={hs.label} onChange={e => onChange({ label: e.target.value })} style={INPUT} />
        </div>

        {/* Embed Code */}
        <div style={F}>
          <label style={LBL}>Horizon Embed Code</label>
          <textarea
            value={hs.embedCode}
            onChange={e => onChange({ embedCode: e.target.value })}
            placeholder="Paste the full Horizon code snippet here…"
            style={{ width: '100%', minHeight: 120, border: '1px solid #e2e2e7', borderRadius: 8, padding: '9px 10px', fontSize: 11.5, lineHeight: 1.55, background: '#fafafb', color: '#1b1b1f', resize: 'vertical', fontFamily: 'ui-monospace,"Cascadia Code",Menlo,"Courier New",monospace', outline: 'none' }}
          />
          <div style={{ ...HINT, lineHeight: 1.55 }}>Paste the full Horizon code snippet for this placement. It will render inside this hotspot in preview and exported HTML.</div>
        </div>

        {/* Position & Size */}
        <div style={F}>
          <label style={LBL}>Position &amp; size (px)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {(['x','y','w'] as const).map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', height: 32, border: '1px solid #e2e2e7', borderRadius: 8, background: '#fafafb', overflow: 'hidden' }}>
                <span style={{ fontSize: 11, color: '#a0a0a8', paddingLeft: 10, width: 24, flexShrink: 0 }}>{f.toUpperCase()}</span>
                <input type="number" value={hs[f]} onChange={numChange(f)} style={{ border: 0, background: 'transparent', height: '100%', width: '100%', fontSize: 12.5, padding: '0 8px 0 2px', color: '#1b1b1f', fontFamily: 'inherit', outline: 'none', fontVariantNumeric: 'tabular-nums' }} />
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', height: 32, border: '1px solid #e2e2e7', borderRadius: 8, background: '#f3f3f5', overflow: 'hidden' }} title="Height locked by entry point type">
              <span style={{ fontSize: 11, color: '#a0a0a8', paddingLeft: 10, width: 24, flexShrink: 0 }}>H</span>
              <span style={{ fontSize: 12.5, padding: '0 8px', color: '#86868f', fontVariantNumeric: 'tabular-nums', userSelect: 'none' }}>{lockedH}</span>
              <span style={{ fontSize: 9.5, color: '#b0b0b8', marginLeft: 'auto', paddingRight: 8, fontWeight: 500 }}>lock</span>
            </div>
          </div>
          <div style={HINT}>Height locked by entry point type. Drag left/right edges to resize width.</div>
        </div>

        <div style={{ height: 1, background: '#f0f0f3', margin: '2px 0' }} />

        <button onClick={onDuplicate} style={{ height: 32, border: '1px solid #e2e2e7', borderRadius: 8, background: '#fff', color: '#1b1b1f', fontSize: 12.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
          Duplicate Hotspot
        </button>
        <button onClick={onDelete} style={{ height: 32, border: '1px solid rgba(220,38,38,.25)', borderRadius: 8, background: '#fff', color: '#dc2626', fontSize: 12.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
          Delete Hotspot
        </button>
        <div style={{ ...HINT, lineHeight: 1.6 }}>Arrow keys nudge · ⇧ for 10 px · ⌘D duplicates · ⌫ deletes</div>
      </div>
    </div>
  )
}
