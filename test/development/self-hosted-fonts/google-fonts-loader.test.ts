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

  test('Invalid preload type', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/_app.js',
        `
      import { Inter } from '@next/font/google'

      Inter({ variant: '500', preload: {} })

      function MyApp({ Component, pageProps }) {
        return <Component {...pageProps} />
      }
      
      export default MyApp
      `
      )
      await check(() => getRedboxSource(browser), /expected an array/)
      expect(removeFirstLine(await getRedboxSource(browser)))
        .toMatchInlineSnapshot(`
        "Invalid preload value for font \`Inter\`, expected an array of subsets.
        Available subsets: cyrillic, cyrillic-ext, greek, greek-ext, latin, latin-ext, vietnamese
        Location: pages/_app.js"
      `)
    } finally {
      await browser.close()
    }
  })

  test('Unknown preload subset', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/_app.js',
        `
      import { Inter } from '@next/font/google'

      Inter({ variant: '500', preload: ['japanese'] })

      function MyApp({ Component, pageProps }) {
        return <Component {...pageProps} />
      }
      
      export default MyApp
      `
      )
      await check(() => getRedboxSource(browser), /Unknown preload subset/)
      expect(removeFirstLine(await getRedboxSource(browser)))
        .toMatchInlineSnapshot(`
        "Unknown preload subset \`japanese\` for font \`Inter\`
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
      import { Inter } from '@next/font/google'

      Inter({ variant: 'variable', axes: ["hello"] })

      function MyApp({ Component, pageProps }) {
        return <Component {...pageProps} />
      }
      
      export default MyApp
      `
      )
      await check(() => getRedboxSource(browser), /Invalid/)
      expect(removeFirstLine(await getRedboxSource(browser)))
        .toMatchInlineSnapshot(`
        "Invalid axes value \`hello\` for font \`Inter\`.
        Available axes: slnt
        Location: pages/_app.js"
      `)
    } finally {
      await browser.close()
    }
  })
})
