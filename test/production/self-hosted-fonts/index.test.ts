import cheerio from 'cheerio'
import { createNext, FileRef } from 'e2e-utils'
import { NextInstance } from 'test/lib/next-modes/base'
import { renderViaHTTP } from 'next-test-utils'
import { join } from 'path'
import webdriver from 'next-webdriver'

// _error
describe('font modules enabled', () => {
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
          fontModules: {
            enabled: true,
            fallbackFonts: {
              'Open Sans': ['system-ui', 'sans-serif'],
            },
          },
        },
      },
    })
  })
  afterAll(() => next.destroy())

  describe('import', () => {
    test('css modules with font face', async () => {
      const html = await renderViaHTTP(next.url, '/with-fonts')
      const $ = cheerio.load(html)

      // _app.js
      expect(JSON.parse(await $('#app-open-sans').text())).toEqual({
        fallbackFonts: ['system-ui', 'sans-serif'],
        className: expect.any(String),
        style: {
          fontFamily:
            "'Open Sans-790f768d78fdebf5081feb1fd4b44f96a1333de88978efab76d51da501e04a8c'",
          fontStyle: 'italic',
          fontWeight: '400',
        },
      })

      // with-fonts.js
      expect(JSON.parse(await $('#with-fonts-open-sans').text())).toEqual({
        fallbackFonts: ['system-ui', 'sans-serif'],
        className: expect.any(String),
        style: {
          fontFamily:
            "'Open Sans-790f768d78fdebf5081feb1fd4b44f96a1333de88978efab76d51da501e04a8c'",
          fontStyle: 'italic',
          fontWeight: '400',
        },
      })

      // CompWithFonts.js
      expect(JSON.parse(await $('#comp-with-fonts-inter').text())).toEqual({
        className: expect.any(String),
        style: {
          fontFamily:
            "'Inter-96526bc0aeb95ca37e991cddfa4c088732a46a4220fb1a66a15231cfe7259fbc'",
          fontWeight: '500',
        },
      })
      expect(JSON.parse(await $('#comp-with-fonts-roboto').text())).toEqual({
        className: expect.any(String),
        style: {
          fontFamily:
            "'Roboto-385c19dd2c16e4944ae117fd6b0a01a482bb191ff1e96eb0ea2f523728526b3a'",
          fontStyle: 'normal',
        },
        withFallbackFonts: expect.any(String),
      })
      expect(
        JSON.parse(await $('#comp-with-fonts-roboto-again').text())
      ).toEqual({
        className: expect.any(String),
        style: {
          fontFamily:
            "'Roboto Again-6d0f197aa8acb208229991d8834e543bf01dc62a350a65402993c02006f9b680'",
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
      ).toBe(
        // Includes configured fallback fonts
        '"Open Sans-790f768d78fdebf5081feb1fd4b44f96a1333de88978efab76d51da501e04a8c", system-ui, sans-serif'
      )
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

      // with-fonts.js
      expect(
        await browser.eval(
          'getComputedStyle(document.querySelector("#with-fonts-open-sans")).fontFamily'
        )
      ).toBe(
        // Includes configured fallback fonts
        '"Open Sans-790f768d78fdebf5081feb1fd4b44f96a1333de88978efab76d51da501e04a8c", system-ui, sans-serif'
      )
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
      expect(
        await browser.eval(
          'getComputedStyle(document.querySelector("#with-fonts-open-sans-style")).fontWeight'
        )
      ).toBe('400')
      expect(
        await browser.eval(
          'getComputedStyle(document.querySelector("#with-fonts-open-sans-style")).fontStyle'
        )
      ).toBe('italic')

      // CompWithFonts.js
      expect(
        await browser.eval(
          'getComputedStyle(document.querySelector("#comp-with-fonts-inter")).fontFamily'
        )
      ).toBe(
        'Inter-96526bc0aeb95ca37e991cddfa4c088732a46a4220fb1a66a15231cfe7259fbc'
      )
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
      ).toBe(
        'Roboto-385c19dd2c16e4944ae117fd6b0a01a482bb191ff1e96eb0ea2f523728526b3a'
      )
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

      // Fallback fonts from class in robot.font.css
      expect(
        await browser.eval(
          'getComputedStyle(document.querySelector("#roboto-with-fallback-fonts")).fontFamily'
        )
      ).toBe(
        'Roboto-385c19dd2c16e4944ae117fd6b0a01a482bb191ff1e96eb0ea2f523728526b3a, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
      )
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

describe('font modules disabled', () => {
  let next: NextInstance

  beforeAll(async () => {
    next = await createNext({
      files: {
        'pages/without-fonts.js': new FileRef(
          join(__dirname, 'app/pages/without-fonts.js')
        ),
        'pages/_app.js': new FileRef(join(__dirname, 'app/pages/_app.js')),
        fonts: new FileRef(join(__dirname, 'app/fonts')),
      },
    })
  })
  afterAll(() => next.destroy())

  describe('import', () => {
    test('css module without font face', async () => {
      const html = await renderViaHTTP(next.url, '/without-fonts')
      const $ = cheerio.load(html)

      expect(JSON.parse(await $('#app-open-sans').text())).toEqual({}) // treated as global CSS
    })
  })

  describe('preload', () => {
    test('page without fonts', async () => {
      const html = await renderViaHTTP(next.url, '/without-fonts')
      const $ = cheerio.load(html)

      expect($('link[as="font"]').length).toBe(0)
    })
  })
})
