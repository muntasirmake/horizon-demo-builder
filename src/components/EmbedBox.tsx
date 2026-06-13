import { useRef, useEffect } from 'react'

export default function EmbedBox({ code }: { code: string }) {
  const elRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return
    el.innerHTML = ''
    if (!code) return
    const tmp = document.createElement('div')
    tmp.innerHTML = code
    Array.from(tmp.childNodes).forEach(node => {
      if (node.nodeName === 'SCRIPT') {
        const src = node as HTMLScriptElement
        const s = document.createElement('script')
        Array.from(src.attributes).forEach(attr => s.setAttribute(attr.name, attr.value))
        if (!src.getAttribute('src')) s.textContent = src.textContent
        el.appendChild(s)
      } else {
        el.appendChild(node.cloneNode(true))
      }
    })
  }, [code])

  return <div ref={elRef} style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }} />
}
