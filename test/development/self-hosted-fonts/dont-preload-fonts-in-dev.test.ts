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
          
          export default () => <div id="inter-stringified">{JSON.stringify(inter)}</div>`,

        'pages/inter.font.css': `
          @font-face {
            font-family: 'Inter';
            src: url(./inter.woff);
          }`,

        'pages/inter.woff': '',
      },
      nextConfig: {
        experimental: {
          fontModules: true,
        },
      },
    })

    const html = await renderViaHTTP(next.url, '/')
    const $ = cheerio.load(html)

    expect($('link[rel="preconnect"]').length).toBe(0)
    expect($('link[as="font"]').length).toBe(0)
    expect(JSON.parse($('#inter-stringified').text())).toEqual({
      className: expect.any(String),
      style: {
        fontFamily:
          "'Inter-cfe7e0c55d77285613f22729443a7511d0633d43dab20059a067f9209d7e4997'",
      },
    })
  })
})
