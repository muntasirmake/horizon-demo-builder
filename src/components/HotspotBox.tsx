import type { Hotspot } from '../types'
import { getTypeName } from '../utils'
import EmbedBox from './EmbedBox'

interface Props {
  hotspot: Hotspot
  imgW: number
  imgH: number
  isEdit: boolean
  isSelected: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onResizeE: (e: React.MouseEvent) => void
  onResizeW: (e: React.MouseEvent) => void
}

export default function HotspotBox({ hotspot: hs, imgW, imgH, isEdit, isSelected, onMouseDown, onResizeE, onResizeW }: Props) {
  const hasCode = !!(hs.embedCode?.trim())

  const base: React.CSSProperties = {
    position: 'absolute',
    left: `${(hs.x / imgW) * 100}%`,
    top: `${(hs.y / imgH) * 100}%`,
    width: `${(hs.w / imgW) * 100}%`,
    height: `${(hs.h / imgH) * 100}%`,
  }

  if (isEdit) {
    return (
      <div
        style={{
          ...base,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 10, cursor: 'move', userSelect: 'none',
          border: isSelected ? '2px solid #2563eb' : '1.5px dashed rgba(37,99,235,.45)',
          background: isSelected ? 'rgba(37,99,235,.07)' : 'rgba(37,99,235,.03)',
          boxShadow: isSelected ? '0 0 0 4px rgba(37,99,235,.10)' : 'none',
          zIndex: isSelected ? 3 : 2,
        }}
        onMouseDown={onMouseDown}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, pointerEvents: 'none', padding: '6px 10px', maxWidth: '100%', overflow: 'hidden' }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#2563eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
            {hs.label || 'Horizon Hotspot'}
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 500, color: '#86868f', background: 'rgba(37,99,235,.08)', padding: '2px 8px', borderRadius: 99, whiteSpace: 'nowrap' }}>
            {getTypeName(hs.entryPointType)}
          </div>
          {hasCode && (
            <div style={{ fontSize: 10.5, fontWeight: 500, color: '#22c55e', background: 'rgba(34,197,94,.10)', padding: '2px 8px', borderRadius: 99 }}>
              Code ready
            </div>
          )}
        </div>

        {isSelected && (
          <>
            <div style={{ position: 'absolute', top: -26, left: -2, background: '#2563eb', color: '#fff', fontSize: 10.5, fontWeight: 600, padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap', pointerEvents: 'none', boxShadow: '0 2px 8px rgba(37,99,235,.3)' }}>
              {getTypeName(hs.entryPointType)}
            </div>
            <div
              style={{ position: 'absolute', width: 9, height: 32, background: '#fff', border: '1.5px solid #2563eb', borderRadius: 4, cursor: 'ew-resize', zIndex: 4, top: 'calc(50% - 16px)', right: -5 }}
              onMouseDown={e => { e.stopPropagation(); onResizeE(e) }}
            />
            <div
              style={{ position: 'absolute', width: 9, height: 32, background: '#fff', border: '1.5px solid #2563eb', borderRadius: 4, cursor: 'ew-resize', zIndex: 4, top: 'calc(50% - 16px)', left: -5 }}
              onMouseDown={e => { e.stopPropagation(); onResizeW(e) }}
            />
          </>
        )}
      </div>
    )
  }

  return (
    <div style={{ ...base, overflow: 'hidden', zIndex: 2, borderRadius: hasCode ? 0 : 10 }}>
      {hasCode ? (
        <EmbedBox code={hs.embedCode} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f6f8', border: '1.5px dashed #d8d8e0', borderRadius: 10, pointerEvents: 'none' }}>
          <div style={{ fontSize: 11.5, fontWeight: 500, color: '#a0a0a8', textAlign: 'center', padding: 8 }}>No embed code</div>
        </div>
      )}
    </div>
  )
}
