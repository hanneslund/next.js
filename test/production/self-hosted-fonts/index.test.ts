import cheerio from 'cheerio'
import { createNext, FileRef } from 'e2e-utils'
import { NextInstance } from 'test/lib/next-modes/base'
import { renderViaHTTP } from 'next-test-utils'
import { join } from 'path'
import webdriver from 'next-webdriver'

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
          fontModules: { enabled: true },
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

    test('css modules with font face', async () => {
      const html = await renderViaHTTP(next.url, '/with-fonts')
      const $ = cheerio.load(html)

      // _app.js
      expect(JSON.parse(await $('#app-open-sans').text())).toEqual({
        fontClass: expect.any(String),
        fontStyle: {
          fontFamily: expect.stringContaining('Open Sans'),
          fontStyle: 'italic',
          fontWeight: '400',
        },
      })

      // with-fonts.js
      expect(JSON.parse(await $('#with-fonts-open-sans').text())).toEqual({
        fontClass: expect.any(String),
        fontStyle: {
          fontFamily: expect.stringContaining('Open Sans'),
          fontStyle: 'italic',
          fontWeight: '400',
        },
      })

      // CompWithFonts.js
      expect(JSON.parse(await $('#comp-with-fonts-inter').text())).toEqual({
        fontClass: expect.any(String),
        fontStyle: {
          fontFamily: expect.stringContaining('Inter'),
          fontWeight: '500',
        },
      })
      expect(JSON.parse(await $('#comp-with-fonts-roboto').text())).toEqual({
        fontClass: expect.any(String),
        fontStyle: {
          fontFamily: expect.stringContaining('Roboto'),
          fontStyle: 'normal',
        },
      })
      expect(
        JSON.parse(await $('#comp-with-fonts-roboto-again').text())
      ).toEqual({
        fontClass: expect.any(String),
        fontStyle: {
          fontFamily: expect.stringContaining('Roboto Again'),
          fontStyle: 'normal',
        },
      })
    })
  })

  describe('computed styles', () => {
    test('css modules with font face', async () => {
      const browser = await webdriver(next.url, '/with-fonts')

      // _app.js
      expect(
        await browser.eval(
          'getComputedStyle(document.querySelector("#app-open-sans")).fontFamily'
        )
      ).toContain('Open Sans')
      expect(
        await browser.eval(
          'getComputedStyle(document.querySelector("#app-open-sans")).fontWeight'
        )
      ).toBe('400')
      expect(
        await browser.eval(
          'getComputedStyle(document.querySelector("#app-open-sans")).fontStyle'
        )
      ).toBe('italic')

      //   // with-fonts.js
      expect(
        await browser.eval(
          'getComputedStyle(document.querySelector("#with-fonts-open-sans")).fontFamily'
        )
      ).toContain('Open Sans')
      expect(
        await browser.eval(
          'getComputedStyle(document.querySelector("#with-fonts-open-sans")).fontWeight'
        )
      ).toBe('400')
      expect(
        await browser.eval(
          'getComputedStyle(document.querySelector("#with-fonts-open-sans")).fontStyle'
        )
      ).toBe('italic')

      // CompWithFonts.js
      expect(
        await browser.eval(
          'getComputedStyle(document.querySelector("#comp-with-fonts-inter")).fontFamily'
        )
      ).toContain('Inter')
      expect(
        await browser.eval(
          'getComputedStyle(document.querySelector("#comp-with-fonts-inter")).fontWeight'
        )
      ).toBe('500')
      expect(
        await browser.eval(
          'getComputedStyle(document.querySelector("#comp-with-fonts-inter")).fontStyle'
        )
      ).toBe('normal')

      expect(
        await browser.eval(
          'getComputedStyle(document.querySelector("#comp-with-fonts-roboto")).fontFamily'
        )
      ).toContain('Roboto')
      expect(
        await browser.eval(
          'getComputedStyle(document.querySelector("#comp-with-fonts-roboto")).fontWeight'
        )
      ).toBe('400')
      expect(
        await browser.eval(
          'getComputedStyle(document.querySelector("#comp-with-fonts-roboto")).fontStyle'
        )
      ).toBe('normal')
    })
  })

  describe('preload', () => {
    test('page with fonts', async () => {
      const html = await renderViaHTTP(next.url, '/with-fonts')
      const $ = cheerio.load(html)

      expect($('link[as="font"]').length).toBe(4)
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
        href: '/_next/static/fonts/inter-latin.b5cf718f.woff',
        rel: 'preload',
        type: 'font/woff',
      })
      expect($('link[as="font"]').get(2).attribs).toEqual({
        as: 'font',
        crossorigin: 'anonymous',
        href: '/_next/static/fonts/inter-greek.5911d1a9.woff',
        rel: 'preload',
        type: 'font/woff',
      })
      expect($('link[as="font"]').get(3).attribs).toEqual({
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

  describe('import', () => {
    test('css module without font face', async () => {
      const html = await renderViaHTTP(next.url, '/without-fonts')
      const $ = cheerio.load(html)

      expect(
        JSON.parse(await $('#css-module-without-font-face').text())
      ).toEqual({})
    })

    test('css modules with font face', async () => {
      const html = await renderViaHTTP(next.url, '/with-fonts')
      const $ = cheerio.load(html)

      // _app.js
      expect(JSON.parse(await $('#app-open-sans').text())).toEqual({})

      // with-fonts.js
      expect(JSON.parse(await $('#with-fonts-open-sans').text())).toEqual({})

      // CompWithFonts.js
      expect(JSON.parse(await $('#comp-with-fonts-inter').text())).toEqual({})
      expect(JSON.parse(await $('#comp-with-fonts-roboto').text())).toEqual({})
    })
  })

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
