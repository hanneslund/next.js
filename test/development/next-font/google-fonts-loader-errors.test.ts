import { createNext, FileRef } from 'e2e-utils'
import { NextInstance } from 'test/lib/next-modes/base'
import { check, getRedboxSource, renderViaHTTP, waitFor } from 'next-test-utils'
import webdriver from 'next-webdriver'
import { join } from 'path'

function removeFirstLine(str: string) {
  return str.split('\n').slice(1).join('\n')
}

describe('@next/font/google option errors', () => {
  let next: NextInstance

  beforeAll(async () => {
    next = await createNext({
      dependencies: {
        '@next/font': '*',
      },
      files: {
        'pages/index.js': `
        export default function Page() {
          return <p>Hello world</p>
        }
        `,
      },
      nextConfig: {
        experimental: {
          fontLoaders: {
            '@next/font/google': {
              subsets: ['latin'],
            },
          },
        },
      },
    })

    await renderViaHTTP(next.url, '/api/google-fonts-mock')
  })

  afterAll(() => next.destroy())

  test('Unknown font', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/index.js',
        `
      import { Unknown } from '@next/font/google'

      const u = Unknown({ variant: '400' })

      export default function Page() {
        return <p>Hello world</p>
      }
      `
      )
      await check(() => getRedboxSource(browser), /Unknown font/)
      expect(
        removeFirstLine(await getRedboxSource(browser))
      ).toMatchInlineSnapshot(`"Unknown font \`Unknown\`"`)
    } finally {
      await browser.close()
    }
  })

  test('Unknown variant', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/index.js',
        `
      import { Oooh_Baby } from '@next/font/google'

      const o = Oooh_Baby({ variant: '500' })

      export default function Page() {
        return <p>Hello world</p>
      }
      `
      )
      await check(() => getRedboxSource(browser), /Unknown variant/)
      expect(removeFirstLine(await getRedboxSource(browser)))
        .toMatchInlineSnapshot(`
        "Unknown variant \`500\` for font \`Oooh Baby\`
        Available variants: \`400\`"
      `)
    } finally {
      await browser.close()
    }
  })

  test('Invalid display value', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/index.js',
        `
      import { Inter } from '@next/font/google'

      const i = Inter({ variant: '500', display: 'always' })

      export default function Page() {
        return <p>Hello world</p>
      }
      `
      )
      await check(() => getRedboxSource(browser), /Invalid display value/)
      expect(removeFirstLine(await getRedboxSource(browser)))
        .toMatchInlineSnapshot(`
        "Invalid display value \`always\` for font \`Inter\`.
        Available display values: \`auto\`, \`block\`, \`swap\`, \`fallback\`, \`optional\`"
      `)
    } finally {
      await browser.close()
    }
  })

  test('Setting axes on non variable font', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/index.js',
        `
      import { Inter } from '@next/font/google'

      const i = Inter({ variant: '500', axes: [] })

      export default function Page() {
        return <p>Hello world</p>
      }
      `
      )
      await check(
        () => getRedboxSource(browser),
        /can only be defined for variable fonts/
      )
      expect(
        removeFirstLine(await getRedboxSource(browser))
      ).toMatchInlineSnapshot(`"Axes can only be defined for variable fonts"`)
    } finally {
      await browser.close()
    }
  })

  test('Setting axes on font without definable axes', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/index.js',
        `
      import { Lora } from '@next/font/google'

      const l = Lora({ variant: 'variable', axes: [] })

      export default function Page() {
        return <p>Hello world</p>
      }
      `
      )
      await check(() => getRedboxSource(browser), /has no definable/)
      expect(
        removeFirstLine(await getRedboxSource(browser))
      ).toMatchInlineSnapshot(`"Font \`Lora\` has no definable \`axes\`"`)
    } finally {
      await browser.close()
    }
  })

  test('Invalid axes value', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/index.js',
        `
      import { Inter } from '@next/font/google'

      const i = Inter({ variant: 'variable', axes: "hello" })

      export default function Page() {
        return <p>Hello world</p>
      }
      `
      )
      await check(() => getRedboxSource(browser), /Invalid/)
      expect(removeFirstLine(await getRedboxSource(browser)))
        .toMatchInlineSnapshot(`
        "Invalid axes value for font \`Inter\`, expected an array of axes.
        Available axes: \`slnt\`"
      `)
    } finally {
      await browser.close()
    }
  })

  test('Invalid value in axes array', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/index.js',
        `
      import { Fraunces } from '@next/font/google'

      const f = Fraunces({ variant: 'variable', axes: ["hello"] })

      export default function Page() {
        return <p>Hello world</p>
      }
      `
      )
      await check(() => getRedboxSource(browser), /Invalid/)
      expect(removeFirstLine(await getRedboxSource(browser)))
        .toMatchInlineSnapshot(`
        "Invalid axes value \`hello\` for font \`Fraunces\`.
        Available axes: \`opsz\`, \`SOFT\`, \`WONK\`"
      `)
    } finally {
      await browser.close()
    }
  })
})
