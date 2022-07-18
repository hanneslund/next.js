import inter from '../fonts/inter.module.css'
import roboto from '../fonts/roboto.module.css'

export default function Component() {
  return (
    <>
      <div style={inter.fontStyle}>{JSON.stringify(inter)}</div>
      <div style={roboto.fontStyle}>{JSON.stringify(roboto)}</div>
    </>
  )
}
