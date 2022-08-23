import { createNext } from 'e2e-utils'
import { NextInstance } from 'test/lib/next-modes/base'
import { check, getRedboxSource, waitFor } from 'next-test-utils'
import webdriver from 'next-webdriver'

describe('import-errors, fontModules enabled', () => {
  let next: NextInstance

  beforeAll(async () => {
    next = await createNext({
      files: {},
      nextConfig: {
        experimental: {
          fontModules: true,
        },
      },
    })
  })
  beforeEach(async () => {
    await next.patchFile(
      'pages/_app.js',
      `
    function MyApp({ Component, pageProps }) {
      return <Component {...pageProps} />
    }

    export default MyApp
    `
    )
    await next.patchFile(
      'pages/index.js',
      `export default () => <p>Hello world!</p>`
    )
  })
  afterAll(() => next.destroy())

  test('@font-face in CSS import', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/styles.css',
        `
      @font-face {
        font-family: 'Inter';
        src: url(/Inter.woff);
      }
      `
      )
      await next.patchFile(
        'pages/_app.js',
        `
       import "./styles.css"

       function MyApp({ Component, pageProps }) {
         return <Component {...pageProps} />
       }
   
       export default MyApp
       `
      )

      await check(() => getRedboxSource(browser), /Found @font-face/)
      expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/styles.css:2:7
Syntax error: Found @font-face in CSS file
Read more: https://www.nextjs.org/fontmodules

  1 | 
> 2 |       @font-face {
    |       ^
  3 |         font-family: 'Inter';
  4 |         src: url(/Inter.woff);"
`)
    } finally {
      await browser.close()
    }
  })

  test('@font-face in CSS module import', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/styles.module.css',
        `
      @font-face {
        font-family: 'Inter';
        src: url(/Inter.woff);
      }
      `
      )
      await next.patchFile(
        'pages/_app.js',
        `
     import './styles.module.css'
 
     function MyApp({ Component, pageProps }) {
       return <Component {...pageProps} />
     }
 
     export default MyApp
     `
      )

      await check(() => getRedboxSource(browser), /Found @font-face/)
      expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/styles.module.css:2:7
Syntax error: Found @font-face in CSS file
Read more: https://www.nextjs.org/fontmodules

  1 | 
> 2 |       @font-face {
    |       ^
  3 |         font-family: 'Inter';
  4 |         src: url(/Inter.woff);"
`)
    } finally {
      await browser.close()
    }
  })
})

describe('import-errors, fontModules disabled', () => {
  let next: NextInstance

  beforeAll(async () => {
    next = await createNext({
      files: {},
      dependencies: {
        '@next/google-fonts': '*',
      },
      nextConfig: {
        experimental: {
          urlImports: ['https://fonts.gstatic.com/'],
          fontLoaders: ['@next/google-fonts'],
        },
      },
    })
  })
  beforeEach(async () => {
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
        import { Arvo } from '@next/google-fonts'

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

  test('@font-face in CSS import', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/_app.js',
        `
     import './styles.css'
 
     function MyApp({ Component, pageProps }) {
       return <Component {...pageProps} />
     }
 
     export default MyApp
     `
      )
      await next.patchFile(
        'pages/styles.css',
        `
      @font-face {
        font-family: 'Inter';
        src: url(/Inter.woff);
      }
      `
      )

      await check(() => browser.elementByCss('p').text(), /Hello world/)
    } finally {
      await browser.close()
    }
  })
})
