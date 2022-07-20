import inter from '../fonts/inter.module.css'
import roboto from '../fonts/roboto.module.css'

export default function Component() {
  return (
    <>
      <div id="comp-with-fonts-inter" className={inter.fontClass}>
        {JSON.stringify(inter)}
      </div>
      <div id="comp-with-fonts-roboto" className={roboto.fontClass}>
        {JSON.stringify(roboto)}
      </div>
    </>
  )
}
