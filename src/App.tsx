import { useState, useRef, useEffect } from 'react'
import JSZip from 'jszip'
import type { DemoType, DemoState, Hotspot, EntryPointType } from './types'
import { getLockedHeight, clamp } from './utils'
import TopBar from './components/TopBar'
import HotspotBox from './components/HotspotBox'
import RightPanel from './components/RightPanel'
import ExportModal from './components/ExportModal'

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'

interface DragState {
  id: number
  dir: 'move' | 'e' | 'w'
  sx: number; sy: number
  orig: { x: number; y: number; w: number; h: number }
  scale: number
  demoType: DemoType
}

export default function App() {
  const [demoType, setDemoTypeState] = useState<DemoType>('web')
  const [demos, setDemos] = useState<Record<DemoType, DemoState>>({
    web: { img: null, hotspots: [], selectedId: null },
    app: { img: null, hotspots: [], selectedId: null },
  })
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [brandSlug, setBrandSlug] = useState('')
  const [showExportModal, setShowExportModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const nextId    = useRef(1)
  const stageRef  = useRef<HTMLDivElement>(null)
  const fileRef   = useRef<HTMLInputElement>(null)
  const dsRef     = useRef<DragState | null>(null)
  const toastTmr  = useRef<ReturnType<typeof setTimeout>>()
  const demosRef  = useRef(demos)
  const dtRef     = useRef(demoType)
  const modeRef   = useRef(mode)

  useEffect(() => { demosRef.current = demos }, [demos])
  useEffect(() => { dtRef.current = demoType },   [demoType])
  useEffect(() => { modeRef.current = mode },     [mode])

  const curDemo = demos[demoType]
  const img     = curDemo.img
  const sel     = curDemo.hotspots.find(h => h.id === curDemo.selectedId) ?? null
  const isEdit  = mode === 'edit'

  // ── Toast ──────────────────────────────────────────────────────────────────
  function flash(msg: string) {
    clearTimeout(toastTmr.current)
    setToast(msg)
    toastTmr.current = setTimeout(() => setToast(null), 2600)
  }

  // ── Switch demo type ────────────────────────────────────────────────────────
  function switchDemo(dt: DemoType) { setDemoTypeState(dt); setMode('edit') }

  // ── Patch helpers ───────────────────────────────────────────────────────────
  function patchHs(dt: DemoType, id: number, patch: Partial<Hotspot>) {
    setDemos(d => ({
      ...d,
      [dt]: { ...d[dt], hotspots: d[dt].hotspots.map(h => h.id === id ? { ...h, ...patch } : h) },
    }))
  }

  // ── Hotspot CRUD ────────────────────────────────────────────────────────────
  function addHotspot() {
    const d  = demosRef.current
    const dt = dtRef.current
    const im = d[dt].img
    if (!im) return
    const type: EntryPointType = 'rectangle-row'
    const w   = Math.round(im.w * 0.55)
    const h   = getLockedHeight(type, im.w)
    const off = (d[dt].hotspots.length % 6) * Math.round(im.w * 0.015)
    const id  = nextId.current++
    const hs: Hotspot = {
      id, label: `Horizon Hotspot ${id}`, embedCode: '', entryPointType: type,
      x: clamp(Math.round((im.w - w) / 2) + off, 0, im.w - w),
      y: clamp(Math.round((im.h - h) / 2) + off, 0, Math.max(0, im.h - h)),
      w, h,
    }
    setDemos(p => ({ ...p, [dt]: { ...p[dt], hotspots: [...p[dt].hotspots, hs], selectedId: id } }))
  }

  function deleteHotspot(id: number) {
    const dt = dtRef.current
    setDemos(d => ({
      ...d,
      [dt]: {
        ...d[dt],
        hotspots: d[dt].hotspots.filter(h => h.id !== id),
        selectedId: d[dt].selectedId === id ? null : d[dt].selectedId,
      },
    }))
  }

  function duplicateHotspot(id: number) {
    const dt = dtRef.current
    const d  = demosRef.current[dt]
    const im = d.img
    const src = d.hotspots.find(h => h.id === id)
    if (!src || !im) return
    const newId = nextId.current++
    const copy: Hotspot = {
      ...src, id: newId, label: src.label + ' copy',
      x: clamp(src.x + 24, 0, im.w - src.w),
      y: clamp(src.y + 24, 0, im.h - src.h),
    }
    setDemos(p => ({ ...p, [dt]: { ...p[dt], hotspots: [...p[dt].hotspots, copy], selectedId: newId } }))
  }

  // ── File loading ────────────────────────────────────────────────────────────
  function loadFile(file: File) {
    if (!file.type.startsWith('image/')) { flash('Please choose a PNG or JPG image'); return }
    const reader = new FileReader()
    reader.onload = () => {
      const src = reader.result as string
      const im  = new Image()
      im.onload = () => {
        const dt = dtRef.current
        setDemos(d => ({ ...d, [dt]: { ...d[dt], img: { src, w: im.naturalWidth, h: im.naturalHeight } } }))
        flash(`Loaded ${dt === 'app' ? 'app screenshot' : 'screenshot'} — click Add Hotspot`)
      }
      im.src = src
    }
    reader.readAsDataURL(file)
  }

  // ── Drag ─────────────────────────────────────────────────────────────────────
  function beginDrag(id: number, dir: DragState['dir'], dt: DemoType, e: React.MouseEvent) {
    e.stopPropagation(); e.preventDefault()
    const d = demosRef.current[dt]
    if (!d.img || !stageRef.current) return
    const rect = stageRef.current.getBoundingClientRect()
    const hs   = d.hotspots.find(h => h.id === id)
    if (!hs) return
    dsRef.current = {
      id, dir, sx: e.clientX, sy: e.clientY,
      orig: { x: hs.x, y: hs.y, w: hs.w, h: hs.h },
      scale: rect.width / d.img.w, demoType: dt,
    }
    setDemos(p => ({ ...p, [dt]: { ...p[dt], selectedId: id } }))
  }

  // ── Global mouse/key handlers ────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const ds = dsRef.current
      if (!ds) return
      e.preventDefault()
      setDemos(prev => {
        const im = prev[ds.demoType].img
        if (!im) return prev
        const dx = (e.clientX - ds.sx) / ds.scale
        const dy = (e.clientY - ds.sy) / ds.scale
        const o  = ds.orig
        const MIN = Math.max(48, Math.round(im.w * 0.05))
        let x = o.x, y = o.y, w = o.w
        if (ds.dir === 'move') {
          x = clamp(o.x + dx, 0, im.w - w)
          y = clamp(o.y + dy, 0, im.h - o.h)
        } else if (ds.dir === 'e') {
          w = Math.max(MIN, o.w + dx)
          if (x + w > im.w) w = im.w - x
        } else if (ds.dir === 'w') {
          const nW = o.w - dx
          if (nW >= MIN) { x = clamp(o.x + dx, 0, o.x + o.w - MIN); w = o.x + o.w - x }
        }
        return {
          ...prev,
          [ds.demoType]: {
            ...prev[ds.demoType],
            hotspots: prev[ds.demoType].hotspots.map(h =>
              h.id === ds.id ? { ...h, x: Math.round(x), y: Math.round(y), w: Math.round(w) } : h
            ),
          },
        }
      })
    }

    const onUp = () => { dsRef.current = null }

    const onKey = (e: KeyboardEvent) => {
      const t   = e.target as HTMLElement
      const tag = t?.tagName?.toLowerCase() ?? ''
      const typing = ['input','textarea','select'].includes(tag) || !!t?.isContentEditable
      if (e.key === 'Escape') {
        if (modeRef.current === 'preview') { setMode('edit'); return }
        if (!typing) {
          const dt = dtRef.current
          setDemos(d => ({ ...d, [dt]: { ...d[dt], selectedId: null } }))
        }
        return
      }
      if (typing || modeRef.current !== 'edit') return
      const demo = demosRef.current[dtRef.current]
      const id   = demo.selectedId
      if (id == null) return
      const hs = demo.hotspots.find(h => h.id === id)
      const im = demo.img
      if (!hs || !im) return
      const step = e.shiftKey ? 10 : 1
      const arrows: Record<string, [number,number]> = {
        ArrowLeft: [-step,0], ArrowRight: [step,0], ArrowUp: [0,-step], ArrowDown: [0,step],
      }
      if (arrows[e.key]) {
        e.preventDefault()
        const [dx,dy] = arrows[e.key]
        const dt = dtRef.current
        setDemos(d => ({
          ...d,
          [dt]: {
            ...d[dt],
            hotspots: d[dt].hotspots.map(h => h.id === id ? {
              ...h,
              x: clamp(h.x + dx, 0, im.w - h.w),
              y: clamp(h.y + dy, 0, im.h - h.h),
            } : h),
          },
        }))
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault(); deleteHotspot(id)
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault(); duplicateHotspot(id)
      }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    window.addEventListener('keydown',   onKey)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
      window.removeEventListener('keydown',   onKey)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Export builders ──────────────────────────────────────────────────────────
  function buildWebHtml() {
    const im = demos.web.img!
    const pc = (v: number, t: number) => ((v / t) * 100).toFixed(4)
    const spots = demos.web.hotspots.map(hs => {
      const pos = `left:${pc(hs.x,im.w)}%;top:${pc(hs.y,im.h)}%;width:${pc(hs.w,im.w)}%;height:${pc(hs.h,im.h)}%`
      return `  <div class="hz-hotspot" data-type="${hs.entryPointType}" style="position:absolute;overflow:hidden;${pos}">\n    ${hs.embedCode || ''}\n  </div>`
    }).join('\n')
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Horizon Demo</title>
  <style>
    *,*::before,*::after{box-sizing:border-box}
    body{margin:0;background:#fff}
    .hz-stage{position:relative;max-width:${im.w}px;margin:0 auto}
    .hz-stage>img{width:100%;display:block}
  </style>
</head>
<body>
  <div class="hz-stage">
    <img src="${im.src}" alt="">
${spots}
  </div>
</body>
</html>`
  }

  function buildAppHtml() {
    const im = demos.app.img!
    const screenH = Math.round(im.h * 390 / im.w)
    const pc = (v: number, t: number) => ((v / t) * 100).toFixed(4)
    const spots = demos.app.hotspots.map(hs => {
      const pos = `left:${pc(hs.x,im.w)}%;top:${pc(hs.y,im.h)}%;width:${pc(hs.w,im.w)}%;height:${pc(hs.h,im.h)}%`
      return `    <div class="hz-spot" data-type="${hs.entryPointType}" style="position:absolute;overflow:hidden;${pos}">\n      ${hs.embedCode || ''}\n    </div>`
    }).join('\n')
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Horizon App Demo</title>
  <style>
    *,*::before,*::after{box-sizing:border-box}
    body{margin:0;background:#ededf0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:60px 24px}
    .phone{position:relative;background:linear-gradient(170deg,#3a3a3c,#1c1c1e);border-radius:50px;padding:52px 11px 36px;box-shadow:0 0 0 1px rgba(255,255,255,.08),0 0 0 1.5px #141414,0 30px 80px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.12);display:inline-block}
    .btn{position:absolute;background:#2c2c2e}
    .btn-vm{left:-3.5px;top:130px;width:3.5px;height:36px;border-radius:3px 0 0 3px}
    .btn-vu{left:-3.5px;top:180px;width:3.5px;height:62px;border-radius:3px 0 0 3px}
    .btn-vd{left:-3.5px;top:254px;width:3.5px;height:62px;border-radius:3px 0 0 3px}
    .btn-pw{right:-3.5px;top:180px;width:3.5px;height:80px;border-radius:0 3px 3px 0}
    .screen{position:relative;width:390px;height:${screenH}px;overflow:hidden;border-radius:42px;background:#000;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)}
    .screen>img{width:100%;display:block}
    .home{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);width:134px;height:5px;background:rgba(255,255,255,.36);border-radius:3px}
  </style>
</head>
<body>
  <div class="phone">
    <div class="btn btn-vm"></div><div class="btn btn-vu"></div>
    <div class="btn btn-vd"></div><div class="btn btn-pw"></div>
    <div class="screen">
      <img src="${im.src}" alt="">
${spots}
    </div>
    <div class="home"></div>
  </div>
</body>
</html>`
  }

  async function handleExport(slug: string) {
    const dt = dtRef.current
    const d  = demosRef.current[dt]
    if (!d.img) return
    const html = dt === 'app' ? buildAppHtml() : buildWebHtml()
    const zip  = new JSZip()
    const folder = zip.folder(slug)!
    folder.file('index.html', html)
    folder.file('assets/.gitkeep', '')
    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = slug + '.zip'
    document.body.appendChild(a); a.click()
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 400)
    setShowExportModal(false)
    flash(`Exported ${slug}.zip — ${d.hotspots.length} hotspot${d.hotspots.length !== 1 ? 's' : ''}`)
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function deselect() {
    if (curDemo.selectedId != null)
      setDemos(d => ({ ...d, [demoType]: { ...d[demoType], selectedId: null } }))
  }
  const appScreenH = demos.app.img ? Math.round(demos.app.img.h * 390 / demos.app.img.w) : 844

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#ededf0', fontFamily: FONT, color: '#1b1b1f', WebkitFontSmoothing: 'antialiased', overflow: 'hidden' }}>
      <TopBar
        demoType={demoType}
        isPreview={!isEdit}
        isEditEmpty={isEdit && !img}
        isEditActive={isEdit && !!img}
        onSwitchDemo={switchDemo}
        onUpload={() => fileRef.current?.click()}
        onAddHotspot={addHotspot}
        onPreview={() => { setMode('preview'); setDemos(d => ({ ...d, [demoType]: { ...d[demoType], selectedId: null } })) }}
        onExitPreview={() => setMode('edit')}
        onExport={() => { if (img) setShowExportModal(true) }}
      />

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* ── Canvas ── */}
        <div
          onMouseDown={deselect}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) loadFile(f) }}
          style={{ flex: 1, minWidth: 0, overflow: 'auto', display: 'flex', padding: 44 }}
        >
          {demoType === 'web' ? (
            !img
              ? <EmptyState type="web" onUpload={() => fileRef.current?.click()} />
              : (
                <div
                  ref={stageRef}
                  onMouseDown={e => { e.stopPropagation(); deselect() }}
                  style={{ position: 'relative', margin: 'auto', width: img.w, maxWidth: '100%', background: '#fff', borderRadius: 6, boxShadow: '0 0 0 1px rgba(0,0,0,.05),0 12px 40px rgba(0,0,0,.10)' }}
                >
                  <img src={img.src} alt="" draggable={false} style={{ width: '100%', display: 'block', borderRadius: 6, userSelect: 'none' }} />
                  {curDemo.hotspots.map(hs => (
                    <HotspotBox key={hs.id} hotspot={hs} imgW={img.w} imgH={img.h} isEdit={isEdit}
                      isSelected={isEdit && hs.id === curDemo.selectedId}
                      onMouseDown={e => beginDrag(hs.id, 'move', 'web', e)}
                      onResizeE={e => beginDrag(hs.id, 'e', 'web', e)}
                      onResizeW={e => beginDrag(hs.id, 'w', 'web', e)} />
                  ))}
                </div>
              )
          ) : (
            !img
              ? <EmptyState type="app" onUpload={() => fileRef.current?.click()} />
              : (
                <div style={{ margin: 'auto', flexShrink: 0, padding: '20px 0 40px' }}>
                  <div style={{ position: 'relative', background: 'linear-gradient(170deg,#3a3a3c 0%,#1c1c1e 100%)', borderRadius: 50, padding: '52px 11px 36px', boxShadow: '0 0 0 1px rgba(255,255,255,.08),0 0 0 1.5px #141414,0 30px 80px rgba(0,0,0,.7),0 10px 30px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.12)', display: 'inline-block' }}>
                    <div style={{ position: 'absolute', left: -3.5, top: 130, width: 3.5, height: 36, background: '#2c2c2e', borderRadius: '3px 0 0 3px' }} />
                    <div style={{ position: 'absolute', left: -3.5, top: 180, width: 3.5, height: 62, background: '#2c2c2e', borderRadius: '3px 0 0 3px' }} />
                    <div style={{ position: 'absolute', left: -3.5, top: 254, width: 3.5, height: 62, background: '#2c2c2e', borderRadius: '3px 0 0 3px' }} />
                    <div style={{ position: 'absolute', right: -3.5, top: 180, width: 3.5, height: 80, background: '#2c2c2e', borderRadius: '0 3px 3px 0' }} />
                    <div
                      ref={stageRef}
                      onMouseDown={e => { e.stopPropagation(); deselect() }}
                      style={{ position: 'relative', width: 390, height: appScreenH, overflow: 'hidden', borderRadius: 42, background: '#000', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.06)' }}
                    >
                      <img src={img.src} alt="" draggable={false} style={{ width: '100%', display: 'block', userSelect: 'none' }} />
                      {curDemo.hotspots.map(hs => (
                        <HotspotBox key={hs.id} hotspot={hs} imgW={img.w} imgH={img.h} isEdit={isEdit}
                          isSelected={isEdit && hs.id === curDemo.selectedId}
                          onMouseDown={e => beginDrag(hs.id, 'move', 'app', e)}
                          onResizeE={e => beginDrag(hs.id, 'e', 'app', e)}
                          onResizeW={e => beginDrag(hs.id, 'w', 'app', e)} />
                      ))}
                    </div>
                    <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', width: 134, height: 5, background: 'rgba(255,255,255,.36)', borderRadius: 3, pointerEvents: 'none' }} />
                  </div>
                </div>
              )
          )}
        </div>

        {/* ── Right panel ── */}
        {isEdit && sel && (
          <RightPanel
            hotspot={sel}
            imgW={img?.w ?? 1920}
            onChange={patch => patchHs(demoType, sel.id, patch)}
            onDelete={() => deleteHotspot(sel.id)}
            onDuplicate={() => duplicateHotspot(sel.id)}
          />
        )}
      </div>

      {showExportModal && (
        <ExportModal
          brandSlug={brandSlug}
          onBrandSlugChange={setBrandSlug}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
        />
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1b1b1f', color: '#fff', fontSize: 12.5, fontWeight: 500, padding: '9px 16px', borderRadius: 99, boxShadow: '0 8px 24px rgba(0,0,0,.25)', zIndex: 120, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
          {toast}
        </div>
      )}

      <input type="file" accept="image/png,image/jpeg,image/webp" ref={fileRef}
        onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = '' }}
        style={{ display: 'none' }} />
    </div>
  )
}

function EmptyState({ type, onUpload }: { type: DemoType; onUpload: () => void }) {
  return (
    <div style={{ margin: 'auto', width: 'min(560px, 100%)', background: '#fff', border: '1.5px dashed #d8d8e0', borderRadius: 18, padding: '56px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,.03)' }}>
      <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(37,99,235,.09)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 8 }}>
        {type === 'app' ? '📱' : '↑'}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600 }}>
        {type === 'app' ? 'Upload a mobile app screenshot' : 'Upload a website screenshot'}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.55, color: '#86868f', maxWidth: 390 }}>
        {type === 'app'
          ? 'Export the prepared app screenshot from Figma — with blank areas for Horizon placements — then upload. It will appear inside a phone frame.'
          : 'Export the prepared screenshot from Figma — with blank areas where Horizon placements should appear — then upload it here.'}
      </div>
      <button onClick={onUpload} style={{ height: 34, padding: '0 16px', border: 'none', borderRadius: 8, background: '#2563eb', fontSize: 12.5, fontWeight: 500, color: '#fff', cursor: 'pointer', marginTop: 14, fontFamily: 'inherit' }}>
        {type === 'app' ? 'Upload App Screenshot' : 'Upload Screenshot'}
      </button>
      <div style={{ fontSize: 12, color: '#a0a0a8', marginTop: 2 }}>or drag &amp; drop a PNG / JPG</div>
    </div>
  )
}
