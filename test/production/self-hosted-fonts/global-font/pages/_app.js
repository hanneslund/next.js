import { Open_Sans } from '@next/font/google'
Open_Sans({
  variant: '400',
})

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}
