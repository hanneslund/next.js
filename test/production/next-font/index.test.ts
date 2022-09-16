import cheerio from 'cheerio'
import { createNext, FileRef } from 'e2e-utils'
import { NextInstance } from 'test/lib/next-modes/base'
import { renderViaHTTP } from 'next-test-utils'
import { join } from 'path'
import webdriver from 'next-webdriver'

const mockedGoogleFontResponses = require.resolve(
  './google-font-mocked-responses.js'
)

describe('@next/font/google', () => {
  let next: NextInstance

  beforeAll(async () => {
    next = await createNext({
      files: {
        pages: new FileRef(join(__dirname, 'app/pages')),
        components: new FileRef(join(__dirname, 'app/components')),
        'next.config.js': new FileRef(join(__dirname, 'app/next.config.js')),
      },
      dependencies: {
        '@next/font': '*',
      },
      env: {
        NEXT_FONT_GOOGLE_MOCKED_RESPONSES: mockedGoogleFontResponses,
      },
    })
  })
  afterAll(() => next.destroy())

  describe('import values', () => {
    test('page with font', async () => {
      const html = await renderViaHTTP(next.url, '/with-fonts')
      const $ = cheerio.load(html)

      // _app.js
      expect(JSON.parse($('#app-open-sans').text())).toEqual({
        className: expect.any(String),
        variable: expect.any(String),
        style: {
          fontFamily: expect.stringMatching(/^'__open_sans_.{6}'$/),
          fontStyle: 'normal',
        },
      })

      // with-fonts.js
      expect(JSON.parse($('#with-fonts-open-sans').text())).toEqual({
        className: expect.any(String),
        variable: expect.any(String),
        style: {
          fontFamily: expect.stringMatching(/^'__open_sans_.{6}'$/),
          fontStyle: 'normal',
        },
      })

      // CompWithFonts.js
      expect(JSON.parse($('#comp-with-fonts-inter').text())).toEqual({
        className: expect.any(String),
        variable: expect.any(String),
        style: {
          fontFamily: expect.stringMatching(/^'__inter_.{6}'$/),
          fontStyle: 'normal',
          fontWeight: 900,
        },
      })
      expect(JSON.parse($('#comp-with-fonts-roboto').text())).toEqual({
        className: expect.any(String),
        variable: expect.any(String),
        style: {
          fontFamily: expect.stringMatching(/^'__roboto_.{6}'$/),
          fontStyle: 'italic',
          fontWeight: 100,
        },
      })
    })

    test('page with edge runtime', async () => {
      const html = await renderViaHTTP(next.url, '/edge-runtime')
      const $ = cheerio.load(html)

      // _app.js
      expect(JSON.parse($('#app-open-sans').text())).toEqual({
        className: expect.any(String),
        variable: expect.any(String),
        style: {
          fontFamily: expect.stringMatching(/^'__open_sans_.{6}'$/),
          fontStyle: 'normal',
        },
      })

      // edge-runtime.js
      expect(JSON.parse($('#edge-runtime-roboto').text())).toEqual({
        className: expect.any(String),
        variable: expect.any(String),
        style: {
          fontFamily: expect.stringMatching(/^'__roboto_.{6}'$/),
          fontStyle: 'italic',
          fontWeight: 100,
        },
      })
    })
  })

  describe('computed styles', () => {
    test('page with fonts', async () => {
      const browser = await webdriver(next.url, '/with-fonts')

      try {
        // _app.js
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#app-open-sans")).fontFamily'
          )
        ).toMatch(/^__open_sans_.{6}$/)
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#app-open-sans")).fontWeight'
          )
        ).toBe('400')
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#app-open-sans")).fontStyle'
          )
        ).toBe('normal')

        // with-fonts.js
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#with-fonts-open-sans")).fontFamily'
          )
        ).toMatch(/^__open_sans_.{6}$/)
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#with-fonts-open-sans")).fontWeight'
          )
        ).toBe('400')
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#with-fonts-open-sans")).fontStyle'
          )
        ).toBe('normal')
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#with-fonts-open-sans-style")).fontWeight'
          )
        ).toBe('400')
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#with-fonts-open-sans-style")).fontStyle'
          )
        ).toBe('normal')

        // CompWithFonts.js
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#comp-with-fonts-inter")).fontFamily'
          )
        ).toMatch(/^__inter_.{6}$/)
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#comp-with-fonts-inter")).fontWeight'
          )
        ).toBe('900')
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#comp-with-fonts-inter")).fontStyle'
          )
        ).toBe('normal')

        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#comp-with-fonts-roboto")).fontFamily'
          )
        ).toMatch(/^__roboto_.{6}$/)
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#comp-with-fonts-roboto")).fontWeight'
          )
        ).toBe('100')
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#comp-with-fonts-roboto")).fontStyle'
          )
        ).toBe('italic')
      } finally {
        await browser.close()
      }
    })

    test('page using variables', async () => {
      const browser = await webdriver(next.url, '/variables')

      try {
        // Fira Code Variable
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#variables-fira-code")).fontFamily'
          )
        ).toMatch(/^__fira_code_.{6}$/)
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#without-variables-fira-code")).fontFamily'
          )
        ).not.toMatch(/^__fira_code_.{6}$/)

        // Albert Sant Variable Italic
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#variables-albert-sans-italic")).fontFamily'
          )
        ).toMatch(/^__albert_sans_.{6}$/)
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#without-variables-albert-sans-italic")).fontFamily'
          )
        ).not.toMatch(/^__albert_sans_.{6}$/)

        // Inter 900
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#variables-inter-900")).fontFamily'
          )
        ).toMatch(/^__inter_.{6}$/)
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#without-variables-inter-900")).fontFamily'
          )
        ).not.toMatch(/^__inter_.{6}$/)

        // Roboto 100 Italic
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#variables-roboto-100-italic")).fontFamily'
          )
        ).toMatch(/^__roboto_.{6}$/)
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#without-variables-roboto-100-italic")).fontFamily'
          )
        ).not.toMatch(/^__roboto_.{6}$/)
      } finally {
        await browser.close()
      }
    })

    test('page using fallback fonts', async () => {
      const browser = await webdriver(next.url, '/with-fallback')

      try {
        // .className
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#with-fallback-fonts-classname")).fontFamily'
          )
        ).toMatch(/^__open_sans_.{6}, system-ui, Arial$/)

        // .style
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#with-fallback-fonts-style")).fontFamily'
          )
        ).toMatch(/^__open_sans_.{6}, system-ui, Arial$/)

        // .variable
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#with-fallback-fonts-variable")).fontFamily'
          )
        ).toMatch(/^__open_sans_.{6}, system-ui, Arial$/)
      } finally {
        await browser.close()
      }
    })

    test('page using edge runtime', async () => {
      const browser = await webdriver(next.url, '/edge-runtime')

      try {
        // _app.js
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#app-open-sans")).fontFamily'
          )
        ).toMatch(/^__open_sans_.{6}$/)
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#app-open-sans")).fontWeight'
          )
        ).toBe('400')
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#app-open-sans")).fontStyle'
          )
        ).toBe('normal')

        // edge-runtime.js
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#edge-runtime-roboto")).fontFamily'
          )
        ).toMatch(/^__roboto_.{6}$/)
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#edge-runtime-roboto")).fontWeight'
          )
        ).toBe('100')
        expect(
          await browser.eval(
            'getComputedStyle(document.querySelector("#edge-runtime-roboto")).fontStyle'
          )
        ).toBe('italic')
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
      expect($('link[rel="preconnect"]').length).toBe(0)

      expect($('link[as="font"]').length).toBe(2)
      // From /_app
      expect($('link[as="font"]').get(0).attribs).toEqual({
        as: 'font',
        crossorigin: 'anonymous',
        href: '/_next/static/fonts/0812efcfaefec5ea.p.woff2',
        rel: 'preload',
        type: 'font/woff2',
      })
      expect($('link[as="font"]').get(1).attribs).toEqual({
        as: 'font',
        crossorigin: 'anonymous',
        href: '/_next/static/fonts/4f3dcdf40b3ca86d.p.woff2',
        rel: 'preload',
        type: 'font/woff2',
      })
    })

    test('page without fonts', async () => {
      const html = await renderViaHTTP(next.url, '/without-fonts')
      const $ = cheerio.load(html)

      // Preconnect
      expect($('link[rel="preconnect"]').length).toBe(0)

      // From _app
      expect($('link[as="font"]').length).toBe(1)
      expect($('link[as="font"]').get(0).attribs).toEqual({
        as: 'font',
        crossorigin: 'anonymous',
        href: '/_next/static/fonts/0812efcfaefec5ea.p.woff2',
        rel: 'preload',
        type: 'font/woff2',
      })
    })

    test('page with edge runtime', async () => {
      const html = await renderViaHTTP(next.url, '/edge-runtime')
      const $ = cheerio.load(html)

      // Preconnect
      expect($('link[rel="preconnect"]').length).toBe(0)

      // Preload
      expect($('link[as="font"]').length).toBe(2)
      // _app
      expect($('link[as="font"]').get(0).attribs).toEqual({
        as: 'font',
        crossorigin: 'anonymous',
        href: '/_next/static/fonts/0812efcfaefec5ea.p.woff2',
        rel: 'preload',
        type: 'font/woff2',
      })
      // edge-runtime
      expect($('link[as="font"]').get(1).attribs).toEqual({
        as: 'font',
        crossorigin: 'anonymous',
        href: '/_next/static/fonts/4f3dcdf40b3ca86d.p.woff2',
        rel: 'preload',
        type: 'font/woff2',
      })
    })
  })
})
