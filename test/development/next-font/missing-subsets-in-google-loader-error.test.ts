import { createNext, FileRef } from 'e2e-utils'
import { NextInstance } from 'test/lib/next-modes/base'
import { check, getRedboxSource } from 'next-test-utils'
import webdriver from 'next-webdriver'
import { join } from 'path'

describe('missing-subsets-in-google-loader-error', () => {
  let next: NextInstance

  beforeAll(async () => {
    next = await createNext({
      files: {
        pages: new FileRef(
          join(__dirname, 'missing-subsets-in-google-loader/pages')
        ),
        'next.config.js': new FileRef(
          join(__dirname, 'missing-subsets-in-google-loader/next.config.js')
        ),
      },
      dependencies: {
        '@next/font': '*',
      },
    })
  })
  afterAll(() => next.destroy())

  test('font loader inside _document', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await check(() => getRedboxSource(browser), /specify subsets/)
      expect(await getRedboxSource(browser)).toInclude(
        'Please specify subsets for `@next/font/google` in your `next.config.js`'
      )
    } finally {
      await browser.close()
    }
  })
})
