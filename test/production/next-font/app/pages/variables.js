import { Fira_Code, Albert_Sans, Inter, Roboto } from '@next/font/google'
const firaCode = Fira_Code()
const albertSans = Albert_Sans({ variant: 'variable-italic' })
const inter = Inter({ variant: '900', display: 'swap' }) // Don't preload by default when swap
const roboto = Roboto({
  variant: '100-italic',
  display: 'swap',
  preload: true,
})

export default function WithFonts() {
  return (
    <>
      {/* Fira Code Variable */}
      <div
        id="variables-fira-code"
        className={firaCode.variables}
        style={{ fontFamily: 'var(--next-font-fira-code)' }}
      >
        With variables
      </div>
      <div
        id="without-variables-fira-code"
        style={{ fontFamily: 'var(--next-font-fira-code)' }}
      >
        Without variables
      </div>

      {/* Albert Sant Variable Italic */}
      <div
        id="variables-albert-sans-italic"
        className={albertSans.variables}
        style={{ fontFamily: 'var(--next-font-albert-sans-italic)' }}
      >
        With variables
      </div>
      <div
        id="without-variables-albert-sans-italic"
        style={{ fontFamily: 'var(--next-font-albert-sans-italic)' }}
      >
        Without variables
      </div>

      {/* Inter 900 */}
      <div
        id="variables-inter-900"
        className={inter.variables}
        style={{ fontFamily: 'var(--next-font-inter-900)' }}
      >
        With variables
      </div>
      <div
        id="without-variables-inter-900"
        style={{ fontFamily: 'var(--next-font-inter-900)' }}
      >
        Without variables
      </div>

      {/* Roboto 100 Italic */}
      <div
        id="variables-roboto-100-italic"
        className={roboto.variables}
        style={{ fontFamily: 'var(--next-font-roboto-100-italic)' }}
      >
        With variables
      </div>
      <div
        id="without-variables-roboto-100-italic"
        style={{ fontFamily: 'var(--next-font-roboto-100-italic)' }}
      >
        Without variables
      </div>
    </>
  )
}
