import React, { ReactNode, useEffect, useState } from 'react'

const preloaded: Set<string> = new Set()

export function preloadFont(font: string) {
  if (typeof window === 'object' && !preloaded.has(font)) {
    // preloaded.add(font)
    // const link = document.createElement('link')
    // link.rel = 'preload'
    // link.as = 'font'
    // link.href = font
    // console.log(link)
    // document.head.appendChild(link)
    fetch(font)
      .then(console.log)
      .catch(() => {})
  }
  // transform to Head?
}

type FontProps = {
  name: string
  children: ReactNode
}
let loadedFonts: Set<string> = new Set()
export function Font({ name, children }: FontProps) {
  // console.log({ name, children })
  // cache
  const [loaded, setLoaded] = useState(loadedFonts.has(name))
  useEffect(() => {
    // console.log({ loaded })
    if (loaded) return
    document.fonts.ready
      .then((e) => {
        loadedFonts.add(name)
        setLoaded(true)
      })
      .catch(console.log)
  }, [])
  if (!loaded) {
    return <div style={{ fontFamily: 'Inter' }}>Loading...</div>
  }

  return children
}
