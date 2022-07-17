import inter from '../fonts/inter.module.css'
import roboto from '../fonts/roboto.module.css'

export default function Component() {
  return (
    <>
      <pre style={inter.fontStyle}>{JSON.stringify(inter, null, 2)}</pre>
      <pre style={roboto.fontStyle}>{JSON.stringify(roboto, null, 2)}</pre>
    </>
  )
}
