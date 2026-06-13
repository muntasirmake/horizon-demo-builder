import type { DemoType } from '../types'

interface Props {
  demoType: DemoType
  isPreview: boolean
  isEditEmpty: boolean
  isEditActive: boolean
  onSwitchDemo: (dt: DemoType) => void
  onUpload: () => void
  onAddHotspot: () => void
  onPreview: () => void
  onExitPreview: () => void
  onExport: () => void
}

const BTN_GHOST: React.CSSProperties = { height: 32, padding: '0 12px', border: '1px solid #e2e2e7', borderRadius: 8, background: '#fff', fontSize: 12.5, fontWeight: 500, color: '#1b1b1f', cursor: 'pointer', fontFamily: 'inherit' }
const BTN_PRIMARY: React.CSSProperties = { height: 32, padding: '0 14px', border: 'none', borderRadius: 8, background: '#2563eb', fontSize: 12.5, fontWeight: 500, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }

export default function TopBar({ demoType, isPreview, isEditEmpty, isEditActive, onSwitchDemo, onUpload, onAddHotspot, onPreview, onExitPreview, onExport }: Props) {
  const tabOn: React.CSSProperties = { height: 26, padding: '0 12px', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: '#fff', color: '#1b1b1f', boxShadow: '0 1px 3px rgba(0,0,0,.12)', fontFamily: 'inherit', whiteSpace: 'nowrap' }
  const tabOff: React.CSSProperties = { height: 26, padding: '0 12px', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'transparent', color: '#86868f', fontFamily: 'inherit', whiteSpace: 'nowrap' }

  return (
    <div style={{ height: 52, flexShrink: 0, background: '#fff', borderBottom: '1px solid #e6e6ea', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', zIndex: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, paddingLeft: 2, boxShadow: '0 1px 4px rgba(37,99,235,.35)' }}>▶</div>
        <span style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: -0.01 * 13.5 }}>Horizon</span>
        <div style={{ width: 1, height: 16, background: '#e6e6ea', margin: '0 2px' }} />
        <div style={{ display: 'flex', alignItems: 'center', background: '#f3f3f5', borderRadius: 8, padding: 3, gap: 2 }}>
          <button style={demoType === 'web' ? tabOn : tabOff} onClick={() => onSwitchDemo('web')}>Web Demo</button>
          <button style={demoType === 'app' ? tabOn : tabOff} onClick={() => onSwitchDemo('app')}>App Demo</button>
        </div>
        {isPreview && (
          <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#2563eb', background: 'rgba(37,99,235,.10)', padding: '4px 9px', borderRadius: 99 }}>Preview</span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {isEditEmpty && (
          <button style={BTN_PRIMARY} onClick={onUpload}>
            {demoType === 'app' ? 'Upload App Screenshot' : 'Upload Screenshot'}
          </button>
        )}
        {isEditEmpty && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.4, pointerEvents: 'none' }}>
            <button style={BTN_GHOST}>Add Hotspot</button>
            <button style={BTN_GHOST}>Preview</button>
            <button style={BTN_PRIMARY}>Export HTML</button>
          </div>
        )}
        {isEditActive && (
          <>
            <button style={BTN_GHOST} onClick={onUpload}>Replace Screenshot</button>
            <button style={{ ...BTN_GHOST, display: 'flex', alignItems: 'center', gap: 6 }} onClick={onAddHotspot}>
              <span style={{ color: '#2563eb', fontSize: 14, fontWeight: 600 }}>+</span>
              <span>Add Hotspot</span>
            </button>
            <div style={{ width: 1, height: 20, background: '#e6e6ea' }} />
            <button style={BTN_GHOST} onClick={onPreview}>Preview</button>
            <button style={BTN_PRIMARY} onClick={onExport}>Export HTML</button>
          </>
        )}
        {isPreview && (
          <>
            <button style={BTN_GHOST} onClick={onExitPreview}>Back to Editor</button>
            <button style={BTN_PRIMARY} onClick={onExport}>Export HTML</button>
          </>
        )}
      </div>
    </div>
  )
}
