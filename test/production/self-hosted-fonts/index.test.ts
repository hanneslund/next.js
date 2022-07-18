import cheerio from 'cheerio'
import { createNext, FileRef } from 'e2e-utils'
import { NextInstance } from 'test/lib/next-modes/base'
import { renderViaHTTP } from 'next-test-utils'
import { join } from 'path'

// _error
describe('self-hosted-fonts enabled', () => {
  let next: NextInstance

  beforeAll(async () => {
    next = await createNext({
      files: {
        pages: new FileRef(join(__dirname, 'app/pages')),
        fonts: new FileRef(join(__dirname, 'app/fonts')),
        components: new FileRef(join(__dirname, 'app/components')),
      },
      nextConfig: {
        experimental: {
          selfHostFonts: true,
        },
      },
    })
  })
  afterAll(() => next.destroy())

  describe('import', () => {
    test('css module without font face', async () => {
      const html = await renderViaHTTP(next.url, '/without-fonts')
      const $ = cheerio.load(html)

      expect(
        JSON.parse(await $('#css-module-without-font-face').text())
      ).toEqual({})
    })

    test.only('css module with font face', async () => {
      const html = await renderViaHTTP(next.url, '/without-fonts')
      const $ = cheerio.load(html)

      expect(
        JSON.parse(await $('#css-module-without-font-face').text())
      ).toEqual({})
    })
  })

  describe('preload', () => {
    test('page with fonts', async () => {
      const html = await renderViaHTTP(next.url, '/with-fonts')
      const $ = cheerio.load(html)

      expect($('link[as="font"]').length).toBe(3)
      // From /_app
      expect($('link[as="font"]').get(0).attribs).toEqual({
        as: 'font',
        crossorigin: 'anonymous',
        href: '/_next/static/fonts/open-sans.7be88d77.ttf',
        rel: 'preload',
        type: 'font/ttf',
      })
      // From /with-fonts
      expect($('link[as="font"]').get(1).attribs).toEqual({
        as: 'font',
        crossorigin: 'anonymous',
        href: '/_next/static/fonts/inter.7be88d77.woff',
        rel: 'preload',
        type: 'font/woff',
      })
      expect($('link[as="font"]').get(2).attribs).toEqual({
        as: 'font',
        crossorigin: 'anonymous',
        href: '/_next/static/fonts/roboto.7be88d77.woff2',
        rel: 'preload',
        type: 'font/woff2',
      })
    })

    test('page without fonts', async () => {
      const html = await renderViaHTTP(next.url, '/without-fonts')
      const $ = cheerio.load(html)

      expect($('link[as="font"]').length).toBe(1)
      // From _app
      expect($('link[as="font"]').get(0).attribs).toEqual({
        as: 'font',
        crossorigin: 'anonymous',
        href: '/_next/static/fonts/open-sans.7be88d77.ttf',
        rel: 'preload',
        type: 'font/ttf',
      })
    })
  })
})

describe('self-hosted-fonts disabled', () => {
  let next: NextInstance

  beforeAll(async () => {
    next = await createNext({
      files: {
        pages: new FileRef(join(__dirname, 'app/pages')),
        fonts: new FileRef(join(__dirname, 'app/fonts')),
        components: new FileRef(join(__dirname, 'app/components')),
      },
    })
  })
  afterAll(() => next.destroy())

  describe('preload', () => {
    test('page with fonts', async () => {
      const html = await renderViaHTTP(next.url, '/with-fonts')
      const $ = cheerio.load(html)

      expect($('link[as="font"]').length).toBe(0)
    })

    test('page without fonts', async () => {
      const html = await renderViaHTTP(next.url, '/without-fonts')
      const $ = cheerio.load(html)

      expect($('link[as="font"]').length).toBe(0)
    })
  })
})
