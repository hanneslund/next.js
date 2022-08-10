import { Ballet } from '@next/google-fonts'
const ballet = Ballet({
  weight: '400',
  display: 'swap',
  style: 'normal',
})
console.log({ ballet })

export default function Page() {
  return (
    <>
      {/* <p className={ballet.className}>Ballet sir</p> */}
      {/* <p>{JSON.stringify(inter)}</p> */}
    </>
  )
}
