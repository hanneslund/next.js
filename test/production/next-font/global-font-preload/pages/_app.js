import { Open_Sans, Oooh_Baby } from '@next/font/google'
Open_Sans({
  variant: '400',
})
Oooh_Baby({
  variant: '400',
  subsets: ['latin'],
  preload: true,
})

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}
