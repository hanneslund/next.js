import { createNext } from 'e2e-utils'
import { NextInstance } from 'test/lib/next-modes/base'
import { renderViaHTTP } from 'next-test-utils'

describe('multiple-font-families-in-font-face-module', () => {
  let next: NextInstance

  afterEach(() => next.destroy())

  test('2 font families in @font-face module', async () => {
    next = await createNext({
      files: {
        'pages/index.js': `
          import './inter.font.css'
          
          export default () => null`,

        'pages/inter.font.css': `
          @font-face {
            font-family: 'Inter One';
            src: url(/Inter.woff);
          }
          @font-face {
            font-family: 'Inter Two';
            src: url(/Inter.woff);
          }`,
      },
      nextConfig: {
        experimental: {
          selfHostFonts: true,
        },
      },
    })

    const html = await renderViaHTTP(next.url, '/')

    expect(html).toContain(
      'A @font-face module may only contain one font family'
    )
  })
})
