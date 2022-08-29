import cheerio from 'cheerio'
import { createNext, FileRef } from 'e2e-utils'
import { NextInstance } from 'test/lib/next-modes/base'
import { check, getRedboxSource, renderViaHTTP, waitFor } from 'next-test-utils'
import webdriver from 'next-webdriver'
import { join } from 'path'

function removeFirstLine(str: string) {
  return str.split('\n').slice(1).join('\n')
}

describe('dont-preload-fonts-in-dev', () => {
  let next: NextInstance

  beforeAll(async () => {
    next = await createNext({
      dependencies: {
        '@next/font': '*',
      },
      files: {
        pages: new FileRef(join(__dirname, 'app/pages')),
      },
    })

    await renderViaHTTP(next.url, '/api/google-fonts-mock')
  })

  // beforeEach(async () => {
  //   await next.patchFile(
  //     'pages/_app.js',
  //     `
  //   function MyApp({ Component, pageProps }) {
  //     return <Component {...pageProps} />
  //   }

  //   export default MyApp
  //   `
  //   )
  //   await next.patchFile(
  //     'pages/index.js',
  //     `export default () => <p>Hello world!</p>`
  //   )
  // })
  afterAll(() => next.destroy())

  test('Unknown font', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/_app.js',
        `
      import { Unknown } from '@next/font/google'

      Unknown({ variant: '400' })

      function MyApp({ Component, pageProps }) {
        return <Component {...pageProps} />
      }
      
      export default MyApp
      `
      )
      await check(() => getRedboxSource(browser), /Unknown font/)
      expect(removeFirstLine(await getRedboxSource(browser)))
        .toMatchInlineSnapshot(`
        "Unknown font \`Unknown\`
        Location: pages/_app.js"
      `)
    } finally {
      await browser.close()
    }
  })

  test('Missing variant', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/_app.js',
        `
      import { Oooh_Baby } from '@next/font/google'

      Oooh_Baby({})

      function MyApp({ Component, pageProps }) {
        return <Component {...pageProps} />
      }
      
      export default MyApp
      `
      )
      await check(() => getRedboxSource(browser), /Missing variant/)
      expect(removeFirstLine(await getRedboxSource(browser)))
        .toMatchInlineSnapshot(`
        "Missing variant for font \`Oooh Baby\`
        Available variants: 400
        Location: pages/_app.js"
      `)
    } finally {
      await browser.close()
    }
  })

  test('Unknown variant', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/_app.js',
        `
      import { Oooh_Baby } from '@next/font/google'

      Oooh_Baby({ variant: '500' })

      function MyApp({ Component, pageProps }) {
        return <Component {...pageProps} />
      }
      
      export default MyApp
      `
      )
      await check(() => getRedboxSource(browser), /Unknown variant/)
      expect(removeFirstLine(await getRedboxSource(browser)))
        .toMatchInlineSnapshot(`
        "Unknown variant \`500\` for font \`Oooh Baby\`
        Available variants: 400
        Location: pages/_app.js"
      `)
    } finally {
      await browser.close()
    }
  })

  test('Invalid subsets type', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/_app.js',
        `
      import { Inter } from '@next/font/google'

      Inter({ variant: '500', subsets: {} })

      function MyApp({ Component, pageProps }) {
        return <Component {...pageProps} />
      }
      
      export default MyApp
      `
      )
      await check(() => getRedboxSource(browser), /expected an array/)
      expect(removeFirstLine(await getRedboxSource(browser)))
        .toMatchInlineSnapshot(`
        "Invalid \`subsets\` value for font \`Inter\`, expected an array of subsets.
        Available subsets: cyrillic, cyrillic-ext, greek, greek-ext, latin, latin-ext, vietnamese
        Location: pages/_app.js"
      `)
    } finally {
      await browser.close()
    }
  })

  test('Unknown subset', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/_app.js',
        `
      import { Inter } from '@next/font/google'

      Inter({ variant: '500', subsets: ['japanese'] })

      function MyApp({ Component, pageProps }) {
        return <Component {...pageProps} />
      }
      
      export default MyApp
      `
      )
      await check(() => getRedboxSource(browser), /Unknown subset/)
      expect(removeFirstLine(await getRedboxSource(browser)))
        .toMatchInlineSnapshot(`
        "Unknown subset \`japanese\` for font \`Inter\`
        Available subsets: cyrillic, cyrillic-ext, greek, greek-ext, latin, latin-ext, vietnamese
        Location: pages/_app.js"
      `)
    } finally {
      await browser.close()
    }
  })

  test('Preload without subsets', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/_app.js',
        `
      import { Inter } from '@next/font/google'

      Inter({ variant: '500', preload: true })

      function MyApp({ Component, pageProps }) {
        return <Component {...pageProps} />
      }
      
      export default MyApp
      `
      )
      await check(() => getRedboxSource(browser), /to preload/)
      expect(removeFirstLine(await getRedboxSource(browser)))
        .toMatchInlineSnapshot(`
        "Please specify \`subsets\` for font \`Inter\` to preload.
        Available subsets: cyrillic, cyrillic-ext, greek, greek-ext, latin, latin-ext, vietnamese
        Location: pages/_app.js"
      `)
    } finally {
      await browser.close()
    }
  })

  test('Invalid display value', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/_app.js',
        `
      import { Inter } from '@next/font/google'

      Inter({ variant: '500', display: 'always' })

      function MyApp({ Component, pageProps }) {
        return <Component {...pageProps} />
      }
      
      export default MyApp
      `
      )
      await check(() => getRedboxSource(browser), /Invalid display value/)
      expect(removeFirstLine(await getRedboxSource(browser)))
        .toMatchInlineSnapshot(`
        "Invalid display value \`always\` for font \`Inter\`
        Available display values: auto, block, swap, fallback, optional
        Location: pages/_app.js"
      `)
    } finally {
      await browser.close()
    }
  })

  test('Setting axes on non variable font', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/_app.js',
        `
      import { Inter } from '@next/font/google'

      Inter({ variant: '500', axes: [] })

      function MyApp({ Component, pageProps }) {
        return <Component {...pageProps} />
      }
      
      export default MyApp
      `
      )
      await check(
        () => getRedboxSource(browser),
        /can only be defined for variable fonts/
      )
      expect(removeFirstLine(await getRedboxSource(browser)))
        .toMatchInlineSnapshot(`
        "\`axes\` can only be defined for variable fonts
        Location: pages/_app.js"
      `)
    } finally {
      await browser.close()
    }
  })

  test('Setting axes on font without definable axes', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/_app.js',
        `
      import { Lora } from '@next/font/google'

      Lora({ variant: 'variable', axes: [] })

      function MyApp({ Component, pageProps }) {
        return <Component {...pageProps} />
      }
      
      export default MyApp
      `
      )
      await check(() => getRedboxSource(browser), /has no definable/)
      expect(removeFirstLine(await getRedboxSource(browser)))
        .toMatchInlineSnapshot(`
        "Font \`Lora\` has no definable \`axes\`
        Location: pages/_app.js"
      `)
    } finally {
      await browser.close()
    }
  })

  test('Invalid axes value', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/_app.js',
        `
      import { Inter } from '@next/font/google'

      Inter({ variant: 'variable', axes: "hello" })

      function MyApp({ Component, pageProps }) {
        return <Component {...pageProps} />
      }
      
      export default MyApp
      `
      )
      await check(() => getRedboxSource(browser), /Invalid/)
      expect(removeFirstLine(await getRedboxSource(browser)))
        .toMatchInlineSnapshot(`
        "Invalid axes value for font \`Inter\`, expected an array of axes.
        Available axes: slnt
        Location: pages/_app.js"
      `)
    } finally {
      await browser.close()
    }
  })

  test('Invalid value in axes array', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/_app.js',
        `
      import { Fraunces } from '@next/font/google'

      Fraunces({ variant: 'variable', axes: ["hello"] })

      function MyApp({ Component, pageProps }) {
        return <Component {...pageProps} />
      }
      
      export default MyApp
      `
      )
      await check(() => getRedboxSource(browser), /Invalid/)
      expect(removeFirstLine(await getRedboxSource(browser)))
        .toMatchInlineSnapshot(`
        "Invalid axes value \`hello\` for font \`Fraunces\`.
        Available axes: opsz, SOFT, WONK
        Location: pages/_app.js"
      `)
    } finally {
      await browser.close()
    }
  })
})
