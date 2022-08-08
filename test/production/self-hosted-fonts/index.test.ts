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
          selfHostedFonts: {
            fontModules: true,
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
            "'Open Sans-ea214cbaca1d4c65206c42d84c24a95e897ff9efa27c0d9738032368c808fe6f'",
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
            "'Open Sans-ea214cbaca1d4c65206c42d84c24a95e897ff9efa27c0d9738032368c808fe6f'",
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
            "'Roboto Again-1b4b87b2565da57765520b944d74bb73ba2654797c9c85e61991b62a83da501e'",
          fontStyle: 'normal',
        },
      })
    })
  })

  describe('computed styles', () => {
    test('css modules with font face', async () => {
      const browser = await webdriver(next.url, '/with-fonts')

      try {
        // _app.js
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#app-open-sans")).fontFamily'
          )
        ).toBe(
          // Includes configured fallback fonts
          '"Open Sans-ea214cbaca1d4c65206c42d84c24a95e897ff9efa27c0d9738032368c808fe6f", system-ui, sans-serif'
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
          '"Open Sans-ea214cbaca1d4c65206c42d84c24a95e897ff9efa27c0d9738032368c808fe6f", system-ui, sans-serif'
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
      } finally {
        await browser.close()
      }
    })
  })

  describe('preload', () => {
    test('page with fonts', async () => {
      const html = await renderViaHTTP(next.url, '/with-fonts')
      const $ = cheerio.load(html)

      // Preconnect
      expect($('link[rel="preconnect"]').length).toBe(1)
      expect($('link[rel="preconnect"]').get(0).attribs).toEqual({
        crossorigin: 'anonymous',
        href: '/',
        rel: 'preconnect',
      })

      expect($('link[as="font"]').length).toBe(2)
      // From /_app
      expect($('link[as="font"]').get(0).attribs).toEqual({
        as: 'font',
        crossorigin: 'anonymous',
        href: '/_next/static/fonts/open-sans.7be88d77.ttf',
        rel: 'preload',
        type: 'font/ttf',
      })
      expect($('link[as="font"]').get(1).attribs).toEqual({
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

      // Preconnect
      expect($('link[rel="preconnect"]').length).toBe(1)
      expect($('link[rel="preconnect"]').get(0).attribs).toEqual({
        crossorigin: 'anonymous',
        href: '/',
        rel: 'preconnect',
      })

      // From _app
      expect($('link[as="font"]').length).toBe(1)
      expect($('link[as="font"]').get(0).attribs).toEqual({
        as: 'font',
        crossorigin: 'anonymous',
        href: '/_next/static/fonts/open-sans.7be88d77.ttf',
        rel: 'preload',
        type: 'font/ttf',
      })
    })

    test('preload once with two font modules with same font file - optional first', async () => {
      const html = await renderViaHTTP(
        next.url,
        '/same-font-file-optional-first'
      )
      const $ = cheerio.load(html)

      // Preconnect
      expect($('link[rel="preconnect"]').length).toBe(1)
      expect($('link[rel="preconnect"]').get(0).attribs).toEqual({
        crossorigin: 'anonymous',
        href: '/',
        rel: 'preconnect',
      })

      // From _app
      expect($('link[as="font"]').length).toBe(2)
      expect($('link[as="font"]').get(0).attribs).toEqual({
        as: 'font',
        crossorigin: 'anonymous',
        href: '/_next/static/fonts/open-sans.7be88d77.ttf',
        rel: 'preload',
        type: 'font/ttf',
      })
      expect($('link[as="font"]').get(1).attribs).toEqual({
        as: 'font',
        crossorigin: 'anonymous',
        href: '/_next/static/fonts/inter.ef46db37.woff2',
        rel: 'preload',
        type: 'font/woff2',
      })
    })

    test('preload once with two font modules with same font file - optional second', async () => {
      const html = await renderViaHTTP(
        next.url,
        '/same-font-file-optional-second'
      )
      const $ = cheerio.load(html)

      // Preconnect
      expect($('link[rel="preconnect"]').length).toBe(1)
      expect($('link[rel="preconnect"]').get(0).attribs).toEqual({
        crossorigin: 'anonymous',
        href: '/',
        rel: 'preconnect',
      })

      // From _app
      expect($('link[as="font"]').length).toBe(2)
      expect($('link[as="font"]').get(0).attribs).toEqual({
        as: 'font',
        crossorigin: 'anonymous',
        href: '/_next/static/fonts/open-sans.7be88d77.ttf',
        rel: 'preload',
        type: 'font/ttf',
      })
      expect($('link[as="font"]').get(1).attribs).toEqual({
        as: 'font',
        crossorigin: 'anonymous',
        href: '/_next/static/fonts/inter.ef46db37.woff2',
        rel: 'preload',
        type: 'font/woff2',
      })
    })
  })
})

describe('self hosted fonts disabled', () => {
  let next: NextInstance

  beforeAll(async () => {
    next = await createNext({
      files: {
        'pages/without-fonts.js': new FileRef(
          join(__dirname, 'app/pages/without-fonts.js')
        ),
        fonts: new FileRef(join(__dirname, 'app/fonts')),
      },
      nextConfig: {
        experimental: {
          selfHostedFonts: false,
        },
      },
    })
  })
  afterAll(() => next.destroy())

  describe('preload', () => {
    test('page without fonts', async () => {
      const html = await renderViaHTTP(next.url, '/without-fonts')
      const $ = cheerio.load(html)

      expect($('#hello-world').text()).toBe('Hello world')
      expect($('link[as="font"]').length).toBe(0)
      expect($('link[rel="preconnect"]').length).toBe(0)
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
      nextConfig: {
        experimental: {
          selfHostedFonts: true,
        },
      },
    })
  })
  afterAll(() => next.destroy())

  describe('import', () => {
    test('page without fonts', async () => {
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

      // From _app
      expect($('link[rel="preconnect"]').length).toBe(1)
      expect($('link[rel="preconnect"]').get(0).attribs).toEqual({
        crossorigin: 'anonymous',
        href: '/',
        rel: 'preconnect',
      })
    })
  })
})
