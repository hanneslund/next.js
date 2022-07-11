import cheerio from 'cheerio'
import { createNext } from 'e2e-utils'
import { NextInstance } from 'test/lib/next-modes/base'
import { renderViaHTTP } from 'next-test-utils'

describe('dont-preload-fonts-in-dev', () => {
  let next: NextInstance

  afterEach(() => next.destroy())

  test('Preload tags are not added in development', async () => {
    next = await createNext({
      files: {
        'pages/index.js': `
          import inter from './inter.font.css'
          
          export default () => null`,

        'pages/inter.font.css': `
          @font-face {
            font-family: 'Inter';
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
    const $ = cheerio.load(html)

    expect($('link[as="font"]').length).toBe(0)
  })
})
