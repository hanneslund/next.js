import { createNext } from 'e2e-utils'
import { NextInstance } from 'test/lib/next-modes/base'
import { check, getRedboxSource, renderViaHTTP, waitFor } from 'next-test-utils'
import webdriver from 'next-webdriver'

describe('import-errors, missing urlImports', () => {
  let next: NextInstance

  beforeAll(async () => {
    next = await createNext({
      files: {},
      nextConfig: {
        experimental: {},
      },
    })
  })
  beforeEach(async () => {
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
      'pages/index.js',
      `export default () => <p>Hello world!</p>`
    )
  })
  afterAll(() => next.destroy())

  test('import Google font', async () => {
    const browser = await webdriver(next.appPort, '/')
    await next.patchFile(
      'pages/_app.js',
      `
     import 'next/font/Inter/400'
 
     function MyApp({ Component, pageProps }) {
       return <Component {...pageProps} />
     }
 
     export default MyApp
     `
    )

    await check(() => getRedboxSource(browser), /import Google fonts/)
    expect(await getRedboxSource(browser)).toInclude(
      'Add https://fonts.gstatic.com/ to experimental.urlImports to import Google fonts.'
    )
  })
})

describe('import-errors, fontModules: true', () => {
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
    import './styles.css'

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

  test('@font-face in CSS import', async () => {
    const browser = await webdriver(next.appPort, '/')
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
  })
})

describe('import-errors, fontModules: false', () => {
  let next: NextInstance

  beforeAll(async () => {
    next = await createNext({
      files: {},
      nextConfig: {
        experimental: {
          fontModules: false,
        },
      },
    })
  })
  beforeEach(async () => {
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
    await next.patchFile('pages/styles.css', ``)
    await next.patchFile(
      'pages/index.js',
      `export default () => <p>Hello world!</p>`
    )
  })
  afterAll(() => next.destroy())

  test('import Google font outside _app', async () => {
    const browser = await webdriver(next.appPort, '/')
    await next.patchFile(
      'pages/index.js',
      `
      import 'next/font/Inter/400'

      export default () => <p>Hello world!</p>`
    )

    await check(() => getRedboxSource(browser), /Google fonts/)
    expect(await getRedboxSource(browser)).toInclude(
      'Google fonts cannot be imported from files other than your Custom <App>.'
    )
  })

  test.skip('import Google font inside _app', async () => {
    const browser = await webdriver(next.appPort, '/')
    await next.patchFile(
      'pages/index.js',
      `
      export default () => <p style={{ fontFamily: 'Inter' }}>Hello world!</p>`
    )
    await next.patchFile(
      'pages/_app.js',
      `
      import 'next/font/Inter/400'

      function MyApp({ Component, pageProps }) {
        return <Component {...pageProps} />
      }

      export default MyApp
      `
    )

    await waitFor(6000)
  })

  test('@font-face in CSS import', async () => {
    const browser = await webdriver(next.appPort, '/')
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
  })
})
