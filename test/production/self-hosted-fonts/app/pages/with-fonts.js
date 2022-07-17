import openSans from '../fonts/open-sans.module.css' // also in _app
import CompWithFonts from '../components/CompWithFonts'

export default function WithFonts() {
  return (
    <>
      <CompWithFonts />
      <pre id="with-fonts-import" className={openSans.fontClass}>
        {JSON.stringify(openSans, null, 2)}
      </pre>
    </>
  )
}
