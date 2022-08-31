import { ABeeZee } from '@next/font/google'

const abeezee = ABeeZee()

export default function Index() {
  return <p className={abeezee.className}>Hello world</p>
}
