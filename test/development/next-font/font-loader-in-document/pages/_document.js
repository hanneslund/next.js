import { Html, Head, Main, NextScript } from 'next/document'
import { Abel } from '@next/font/google'

const abel = Abel({ variant: '400' })

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
