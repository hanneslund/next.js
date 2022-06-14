import { preloadFont } from 'next/font'

export default function Page() {
  preloadFont('main')
  return <p>hello</p>
}
