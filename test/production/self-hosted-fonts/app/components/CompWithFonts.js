import inter from '../fonts/inter.font.css'
import roboto from '../fonts/roboto.font.css'
import robotoAgain from '../fonts/roboto-again.font.css'

export default function Component() {
  return (
    <>
      <div id="comp-with-fonts-inter" className={inter.className}>
        {JSON.stringify(inter)}
      </div>
      <div id="comp-with-fonts-roboto" className={roboto.className}>
        {JSON.stringify(roboto)}
      </div>
      <div id="comp-with-fonts-roboto-again" className={robotoAgain.className}>
        {JSON.stringify(robotoAgain)}
      </div>
      <div id="roboto-with-fallback-fonts" className={roboto.withFallbackFonts}>
        Roboto with fallback fonts
      </div>
    </>
  )
}
