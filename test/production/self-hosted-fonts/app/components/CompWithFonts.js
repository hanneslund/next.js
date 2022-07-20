import inter from '../fonts/inter.module.css'
import roboto from '../fonts/roboto.module.css'

export default function Component() {
  return (
    <>
      <div id="comp-with-fonts-inter" style={inter.fontStyle}>
        {JSON.stringify(inter)}
      </div>
      <div id="comp-with-fonts-roboto" style={roboto.fontStyle}>
        {JSON.stringify(roboto)}
      </div>
    </>
  )
}
