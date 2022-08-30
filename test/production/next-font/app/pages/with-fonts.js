import { Open_Sans } from '@next/font/google'
const openSans = Open_Sans() // also in _app

import CompWithFonts from '../components/CompWithFonts'

export default function WithFonts() {
  return (
    <>
      <CompWithFonts />
      <div id="with-fonts-open-sans" className={openSans.className}>
        {JSON.stringify(openSans)}
      </div>
      <div id="with-fonts-open-sans-style" style={openSans.style} />
    </>
  )
}
