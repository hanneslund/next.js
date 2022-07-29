import openSans from '../fonts/open-sans.font.css' // also in _app
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
