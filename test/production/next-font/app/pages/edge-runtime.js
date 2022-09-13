import { Roboto } from '@next/font/google'
const roboto = Roboto({
  variant: '100-italic',
  display: 'swap',
  preload: true,
})

export default function EdgeRuntime() {
  return (
    <>
      <div id="edge-runtime-roboto" className={roboto.className}>
        {JSON.stringify(roboto)}
      </div>
    </>
  )
}

export const config = {
  runtime: 'experimental-edge',
}
