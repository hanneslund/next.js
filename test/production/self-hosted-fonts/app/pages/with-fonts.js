import openSans from '../fonts/open-sans.module.css' // also in _app
import CompWithFonts from '../components/CompWithFonts'

export default function WithFonts() {
  return (
    <>
      <CompWithFonts />
      <div id="with-fonts-open-sans" className={openSans.fontClass}>
        {JSON.stringify(openSans)}
      </div>
    </>
  )
}
