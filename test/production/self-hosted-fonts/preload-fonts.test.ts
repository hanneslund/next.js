import cheerio from 'cheerio'
import { createNext, FileRef } from 'e2e-utils'
import { NextInstance } from 'test/lib/next-modes/base'
import { renderViaHTTP } from 'next-test-utils'
import { join } from 'path'

// _app
// _app
// _app
describe('self-hosted-fonts enabled', () => {
  let next: NextInstance

  beforeAll(async () => {
    next = await createNext({
      files: {
        pages: new FileRef(join(__dirname, 'app/pages')),
        fonts: new FileRef(join(__dirname, 'app/fonts')),
        // 'next.config.js': new FileRef(join(__dirname, 'app/next.config.js')),
      },
      nextConfig: {
        experimental: {
          selfHostFonts: true,
        },
      },
    })
  })
  afterAll(() => next.destroy())

  test('page with fonts', async () => {
    const html = await renderViaHTTP(next.url, '/with-fonts')
    const $ = cheerio.load(html)

    expect($('link[as="font"]').length).toBe(2)
    expect($('link[as="font"]').get(0).attribs).toEqual({
      as: 'font',
      crossorigin: 'anonymous',
      href: '/_next/static/fonts/inter.7be88d77.woff',
      rel: 'preload',
      type: 'font/woff',
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

    expect($('link[as="font"]').length).toBe(0)
  })
})

describe('self-hosted-fonts disabled', () => {
  let next: NextInstance

  beforeAll(async () => {
    next = await createNext({
      files: {
        pages: new FileRef(join(__dirname, 'app/pages')),
        fonts: new FileRef(join(__dirname, 'app/fonts')),
      },
    })
  })
  afterAll(() => next.destroy())

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
