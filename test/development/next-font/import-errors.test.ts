import { createNext } from 'e2e-utils'
import { NextInstance } from 'test/lib/next-modes/base'
import { check, getRedboxSource } from 'next-test-utils'
import webdriver from 'next-webdriver'

describe('@next/font/google import errors', () => {
  let next: NextInstance

  beforeAll(async () => {
    next = await createNext({
      files: {},
      dependencies: {
        '@next/font': '*',
      },
    })
  })
  beforeEach(async () => {
    await next.patchFile(
      'pages/_document.js',
      `
    import { Html, Head, Main, NextScript } from 'next/document'

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
    `
    )
    await next.patchFile(
      'pages/_app.js',
      `
    function MyApp({ Component, pageProps }) {
      return <Component {...pageProps} />
    }

    export default MyApp
    `
    )
    await next.patchFile('pages/styles.css', ``)
    await next.patchFile(
      'pages/index.js',
      `export default () => <p>Hello world!</p>`
    )
  })
  afterAll(() => next.destroy())

  test('font loader outside _app', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/index.js',
        `
        import { Arvo } from '@next/font/google'

        Arvo({
          variant: '700-italic',
        })

        export default () => <p>Hello world!</p>`
      )

      await check(() => getRedboxSource(browser), /Font loaders/)
      expect(await getRedboxSource(browser)).toInclude(
        'Font loaders cannot be used in any other file than your Custom <App>.'
      )
    } finally {
      await browser.close()
    }
  })

  test('font loader inside _document', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/_document.js',
        `
      import { Html, Head, Main, NextScript } from 'next/document'
      import { Inder } from '@next/font/google'

      Inder({
        variant: '400',
      })

  
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
      `
      )

      await check(() => getRedboxSource(browser), /Font loaders/)
      expect(await getRedboxSource(browser)).toInclude(
        'Font loaders cannot be used within pages/_document.js'
      )
    } finally {
      await browser.close()
    }
  })
})
