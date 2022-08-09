import { check, getRedboxSource, hasRedbox } from 'next-test-utils'
import { createNext } from 'e2e-utils'
import webdriver from 'next-webdriver'
import { NextInstance } from 'test/lib/next-modes/base'

describe('font modules enabled', () => {
  let next: NextInstance

  beforeAll(async () => {
    next = await createNext({
      files: {
        'pages/index.js': `
        import './inter.font.css'     
  
        export default function Page() {
          return null
        }
      `,
        'pages/inter.woff2': ``,
      },
      nextConfig: {
        experimental: {
          selfHostedFonts: { fontModules: true },
        },
      },
    })
  })
  afterAll(() => next.destroy())
  beforeEach(async () => {
    await next.patchFile(
      'pages/inter.font.css',
      ` @font-face {
        font-family: 'Inter';
        src: url(./inter.woff2);
      }`
    )
  })

  describe('@font-face errors', () => {
    test('missing font-family', async () => {
      const browser = await webdriver(next.appPort, '/')

      try {
        await next.patchFile(
          'pages/inter.font.css',
          `
    @font-face {
      src: url(./inter.woff2);
    }`
        )

        await check(() => getRedboxSource(browser), /Missing font-family/)
        expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/inter.font.css:2:5
Syntax error: Missing font-family in @font-face

  1 | 
> 2 |     @font-face {
    |     ^
  3 |       src: url(./inter.woff2);
  4 |     }"
`)
      } finally {
        await browser.close()
      }
    })

    test('missing src', async () => {
      const browser = await webdriver(next.appPort, '/')

      try {
        await next.patchFile(
          'pages/inter.font.css',
          `
    @font-face {
      font-family: 'Inter';
    }`
        )

        await check(() => getRedboxSource(browser), /Missing src/)
        expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/inter.font.css:2:5
Syntax error: Missing src in @font-face

  1 | 
> 2 |     @font-face {
    |     ^
  3 |       font-family: 'Inter';
  4 |     }"
`)
      } finally {
        await browser.close()
      }
    })

    test('domain url in src', async () => {
      const browser = await webdriver(next.appPort, '/')

      try {
        await next.patchFile(
          'pages/inter.font.css',
          `
    @font-face {
      font-family: 'Inter';
      src: url(/inter.woff2);
    }`
        )

        await check(
          () => getRedboxSource(browser),
          /must reference a local file/
        )
        expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/inter.font.css:4:7
Syntax error: The src property must reference a local file

  2 |     @font-face {
  3 |       font-family: 'Inter';
> 4 |       src: url(/inter.woff2);
    |       ^
  5 |     }"
`)
      } finally {
        await browser.close()
      }
    })

    test('missing url in src', async () => {
      const browser = await webdriver(next.appPort, '/')

      try {
        await next.patchFile(
          'pages/inter.font.css',
          `
    @font-face {
      font-family: 'Inter';
      src: inter.woff2;
    }`
        )

        await check(() => getRedboxSource(browser), /Missing/)
        expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/inter.font.css:4:7
Syntax error: Missing url in src property

  2 |     @font-face {
  3 |       font-family: 'Inter';
> 4 |       src: inter.woff2;
    |       ^
  5 |     }"
`)
      } finally {
        await browser.close()
      }
    })

    test('multiple families', async () => {
      const browser = await webdriver(next.appPort, '/')

      try {
        await next.patchFile(
          'pages/inter.font.css',
          `
    @font-face {
      font-family: 'Inter One';
      src: url(./inter.woff2);
    }
    
    @font-face {
      font-family: 'Inter Two';
      src: url(./inter.woff2);
    }`
        )

        await check(() => getRedboxSource(browser), /families must match/)
        expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/inter.font.css:8:7
Syntax error: @font-face families must match

   6 |     
   7 |     @font-face {
>  8 |       font-family: 'Inter Two';
     |       ^
   9 |       src: url(./inter.woff2);
  10 |     }"
`)
      } finally {
        await browser.close()
      }
    })

    test('different weights', async () => {
      const browser = await webdriver(next.appPort, '/')

      try {
        await next.patchFile(
          'pages/inter.font.css',
          `
    @font-face {
      font-family: 'Inter';
      font-weight: 400;
      src: url(./inter.woff2);
    }
    
    @font-face {
      font-family: 'Inter';
      font-weight: 500;
      src: url(./inter.woff2);
    }`
        )

        await check(() => getRedboxSource(browser), /weights must match/)
        expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/inter.font.css:10:7
Syntax error: @font-face weights must match

   8 |     @font-face {
   9 |       font-family: 'Inter';
> 10 |       font-weight: 500;
     |       ^
  11 |       src: url(./inter.woff2);
  12 |     }"
`)
      } finally {
        await browser.close()
      }
    })

    test('missing first weight', async () => {
      const browser = await webdriver(next.appPort, '/')

      try {
        await next.patchFile(
          'pages/inter.font.css',
          `
    @font-face {
      font-family: 'Inter';
      src: url(./inter.woff2);
    }
    
    @font-face {
      font-family: 'Inter';
      font-weight: 500;
      src: url(./inter.woff2);
    }`
        )

        await check(() => getRedboxSource(browser), /weights must match/)
        expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/inter.font.css:9:7
Syntax error: @font-face weights must match

   7 |     @font-face {
   8 |       font-family: 'Inter';
>  9 |       font-weight: 500;
     |       ^
  10 |       src: url(./inter.woff2);
  11 |     }"
`)
      } finally {
        await browser.close()
      }
    })

    test('missing second weight', async () => {
      const browser = await webdriver(next.appPort, '/')

      try {
        await next.patchFile(
          'pages/inter.font.css',
          `
    @font-face {
      font-family: 'Inter';
      font-weight: 400;
      src: url(./inter.woff2);
    }
    
    @font-face {
      font-family: 'Inter';
      src: url(./inter.woff2);
    }`
        )

        await check(() => getRedboxSource(browser), /weights must match/)
        expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/inter.font.css:8:5
Syntax error: @font-face weights must match

   6 |     }
   7 |     
>  8 |     @font-face {
     |     ^
   9 |       font-family: 'Inter';
  10 |       src: url(./inter.woff2);"
`)
      } finally {
        await browser.close()
      }
    })

    test('different styles', async () => {
      const browser = await webdriver(next.appPort, '/')

      try {
        await next.patchFile(
          'pages/inter.font.css',
          `
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      src: url(./inter.woff2);
    }
    
    @font-face {
      font-family: 'Inter';
      font-style: italic;
      src: url(./inter.woff2);
    }`
        )

        await check(() => getRedboxSource(browser), /styles must match/)
        expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/inter.font.css:10:7
Syntax error: @font-face styles must match

   8 |     @font-face {
   9 |       font-family: 'Inter';
> 10 |       font-style: italic;
     |       ^
  11 |       src: url(./inter.woff2);
  12 |     }"
`)
      } finally {
        await browser.close()
      }
    })

    test('missing first style', async () => {
      const browser = await webdriver(next.appPort, '/')

      try {
        await next.patchFile(
          'pages/inter.font.css',
          `
    @font-face {
      font-family: 'Inter';
      src: url(./inter.woff2);
    }
    
    @font-face {
      font-family: 'Inter';
      font-style: italic;
      src: url(./inter.woff2);
    }`
        )

        await check(() => getRedboxSource(browser), /styles must match/)
        expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/inter.font.css:9:7
Syntax error: @font-face styles must match

   7 |     @font-face {
   8 |       font-family: 'Inter';
>  9 |       font-style: italic;
     |       ^
  10 |       src: url(./inter.woff2);
  11 |     }"
`)
      } finally {
        await browser.close()
      }
    })

    test('missing second style', async () => {
      const browser = await webdriver(next.appPort, '/')

      try {
        await next.patchFile(
          'pages/inter.font.css',
          `
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      src: url(./inter.woff2);
    }
    
    @font-face {
      font-family: 'Inter';
      src: url(./inter.woff2);
    }`
        )

        await check(() => getRedboxSource(browser), /styles must match/)
        expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/inter.font.css:8:5
Syntax error: @font-face styles must match

   6 |     }
   7 |     
>  8 |     @font-face {
     |     ^
   9 |       font-family: 'Inter';
  10 |       src: url(./inter.woff2);"
`)
      } finally {
        await browser.close()
      }
    })

    test('missing first unicode-range', async () => {
      const browser = await webdriver(next.appPort, '/')

      try {
        await next.patchFile(
          'pages/inter.font.css',
          `
    @font-face {
      font-family: 'Inter';
      src: url(./inter.woff2);
    }
    
    @font-face {
      font-family: 'Inter';
      src: url(./inter.woff2);
      unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
    }`
        )

        await check(() => getRedboxSource(browser), /unicode-range/)
        expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/inter.font.css:2:5
Syntax error: Expected unicode-range when defining multiple font faces

  1 | 
> 2 |     @font-face {
    |     ^
  3 |       font-family: 'Inter';
  4 |       src: url(./inter.woff2);"
`)
      } finally {
        await browser.close()
      }
    })

    test('missing second unicode-range', async () => {
      const browser = await webdriver(next.appPort, '/')

      try {
        await next.patchFile(
          'pages/inter.font.css',
          `
    @font-face {
      font-family: 'Inter';
      src: url(./inter.woff2);
      unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
    }
    
    @font-face {
      font-family: 'Inter';
      src: url(./inter.woff2);
    }`
        )

        await check(() => getRedboxSource(browser), /unicode-range/)
        expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/inter.font.css:8:5
Syntax error: Expected unicode-range when defining multiple font faces

   6 |     }
   7 |     
>  8 |     @font-face {
     |     ^
   9 |       font-family: 'Inter';
  10 |       src: url(./inter.woff2);"
`)
      } finally {
        await browser.close()
      }
    })

    test('missing both unicode-ranges', async () => {
      const browser = await webdriver(next.appPort, '/')

      try {
        await next.patchFile(
          'pages/inter.font.css',
          `
    @font-face {
      font-family: 'Inter';
      src: url(./inter.woff2);
    }
    
    @font-face {
      font-family: 'Inter';
      src: url(./inter.woff2);
    }`
        )

        await check(() => getRedboxSource(browser), /unicode-range/)
        expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/inter.font.css:2:5
Syntax error: Expected unicode-range when defining multiple font faces

  1 | 
> 2 |     @font-face {
    |     ^
  3 |       font-family: 'Inter';
  4 |       src: url(./inter.woff2);"
`)
      } finally {
        await browser.close()
      }
    })

    test('duplicate unicode-ranges', async () => {
      const browser = await webdriver(next.appPort, '/')

      try {
        await next.patchFile(
          'pages/inter.font.css',
          `
    @font-face {
      font-family: 'Inter';
      src: url(./inter.woff2);
      unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
    }
    
    @font-face {
      font-family: 'Inter';
      src: url(./inter.woff2);
      unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
    }`
        )

        await check(() => getRedboxSource(browser), /duplicate unicode-range/)
        expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/inter.font.css:11:7
Syntax error: Found duplicate unicode-range

   9 |       font-family: 'Inter';
  10 |       src: url(./inter.woff2);
> 11 |       unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
     |       ^
  12 |     }"
`)
      } finally {
        await browser.close()
      }
    })

    test('Missing @font-face', async () => {
      const browser = await webdriver(next.appPort, '/')

      try {
        await next.patchFile('pages/inter.font.css', '')

        await check(() => getRedboxSource(browser), /font-face declaration/)
        expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/inter.font.css:1:1
Syntax error: A font module needs a @font-face declaration"
`)
      } finally {
        await browser.close()
      }
    })
  })

  test('Only font properties allowed', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/inter.font.css',
        `
    @font-face {
      font-family: 'Inter';
      src: url(./inter.woff2);
      unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
    }

    .withFallback {
      font-family: 'Inter', Times;
      font-weight: 400;
      font-style: italic;
      padding: 500px;
    }
    `
      )

      await check(() => getRedboxSource(browser), /font properties/)
      expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/inter.font.css:12:7
Syntax error: Only font properties are allowed in font modules

  10 |       font-weight: 400;
  11 |       font-style: italic;
> 12 |       padding: 500px;
     |       ^
  13 |     }
  14 |"
`)
    } finally {
      await browser.close()
    }
  })
})

describe('font-modules disabled', () => {
  let next: NextInstance

  beforeAll(async () => {
    next = await createNext({
      files: {
        'pages/index.js': 'export default () => null',
        'pages/inter.font.css': '',
        'pages/inter.woff2': ``,
      },

      nextConfig: {
        experimental: {
          selfHostedFonts: { fontModules: false },
        },
      },
    })
  })
  afterAll(() => next.destroy())

  test('Font module is global CSS when disabled', async () => {
    const browser = await webdriver(next.appPort, '/')

    try {
      await next.patchFile(
        'pages/inter.font.css',
        `
      @font-face {
        font-family: 'Inter';
        src: url(./inter.woff2);
        font-weight: 400;
        font-style: normal;
        unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
      }

      @font-face {
        font-family: 'Inter 2';
        src: url(./inter.woff2);
        font-weight: 500;
        font-style: italic;
        unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
      }

      @font-face {}
      `
      )
      await next.patchFile(
        'pages/index.js',
        `
      import './inter.font.css'
      export default () => <p id="hello">Hello world</p>
      `
      )

      await check(
        () => getRedboxSource(browser),
        /Global CSS cannot be imported from files other than your Custom <App>/
      )
      expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/inter.font.css
Global CSS cannot be imported from files other than your Custom <App>. Due to the Global nature of stylesheets, and to avoid conflicts, Please move all first-party global CSS imports to pages/_app.js. Or convert the import to Component-Level CSS (CSS Modules).
Read more: https://nextjs.org/docs/messages/css-global
Location: pages/index.js"
`)
    } finally {
      await browser.close()
    }
  })
})
