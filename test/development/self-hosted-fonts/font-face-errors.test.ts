import { check, getRedboxSource, renderViaHTTP } from 'next-test-utils'
import { createNext } from 'e2e-utils'
import webdriver from 'next-webdriver'
import { NextInstance } from 'test/lib/next-modes/base'

describe('font-face-errors, selfHostFonts: true', () => {
  let next: NextInstance

  beforeAll(async () => {
    next = await createNext({
      files: {
        'pages/index.js': `
        import './inter.module.css'
        export default () => null`,

        'pages/inter.module.css': '',

        'pages/inter.woff2': ``,
      },
      nextConfig: {
        experimental: {
          selfHostFonts: true,
        },
      },
    })
  })
  afterAll(() => next.destroy())
  // abort each browser??
  // abort each browser??
  // abort each browser??

  test('missing font-family', async () => {
    const browser = await webdriver(next.appPort, '/')
    await next.patchFile(
      'pages/inter.module.css',
      `
    @font-face {
      src: url(./inter.woff2);
    }`
    )

    await check(() => getRedboxSource(browser), /Missing font-family/)
    expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/inter.module.css:2:5
Syntax error: Missing font-family in @font-face

  1 | 
> 2 |     @font-face {
    |     ^
  3 |       src: url(./inter.woff2);
  4 |     }"
`)
  })

  test('missing src', async () => {
    const browser = await webdriver(next.appPort, '/')
    await next.patchFile(
      'pages/inter.module.css',
      `
    @font-face {
      font-family: 'Inter';
    }`
    )

    await check(() => getRedboxSource(browser), /Missing src/)
    expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/inter.module.css:2:5
Syntax error: Missing src in @font-face

  1 | 
> 2 |     @font-face {
    |     ^
  3 |       font-family: 'Inter';
  4 |     }"
`)
  })

  test('multiple families', async () => {
    const browser = await webdriver(next.appPort, '/')

    await next.patchFile(
      'pages/inter.module.css',
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
"./pages/inter.module.css:8:7
Syntax error: @font-face families must match

   6 |     
   7 |     @font-face {
>  8 |       font-family: 'Inter Two';
     |       ^
   9 |       src: url(./inter.woff2);
  10 |     }"
`)
  })

  test('different weights', async () => {
    const browser = await webdriver(next.appPort, '/')

    await next.patchFile(
      'pages/inter.module.css',
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
"./pages/inter.module.css:10:7
Syntax error: @font-face weights must match

   8 |     @font-face {
   9 |       font-family: 'Inter';
> 10 |       font-weight: 500;
     |       ^
  11 |       src: url(./inter.woff2);
  12 |     }"
`)
  })

  test('missing first weight', async () => {
    const browser = await webdriver(next.appPort, '/')

    await next.patchFile(
      'pages/inter.module.css',
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
"./pages/inter.module.css:9:7
Syntax error: @font-face weights must match

   7 |     @font-face {
   8 |       font-family: 'Inter';
>  9 |       font-weight: 500;
     |       ^
  10 |       src: url(./inter.woff2);
  11 |     }"
`)
  })

  test('missing second weight', async () => {
    const browser = await webdriver(next.appPort, '/')

    await next.patchFile(
      'pages/inter.module.css',
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
"./pages/inter.module.css:8:5
Syntax error: @font-face weights must match

   6 |     }
   7 |     
>  8 |     @font-face {
     |     ^
   9 |       font-family: 'Inter';
  10 |       src: url(./inter.woff2);"
`)
  })

  test('different styles', async () => {
    const browser = await webdriver(next.appPort, '/')

    await next.patchFile(
      'pages/inter.module.css',
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
"./pages/inter.module.css:10:7
Syntax error: @font-face styles must match

   8 |     @font-face {
   9 |       font-family: 'Inter';
> 10 |       font-style: italic;
     |       ^
  11 |       src: url(./inter.woff2);
  12 |     }"
`)
  })

  test('missing first style', async () => {
    const browser = await webdriver(next.appPort, '/')

    await next.patchFile(
      'pages/inter.module.css',
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
"./pages/inter.module.css:9:7
Syntax error: @font-face styles must match

   7 |     @font-face {
   8 |       font-family: 'Inter';
>  9 |       font-style: italic;
     |       ^
  10 |       src: url(./inter.woff2);
  11 |     }"
`)
  })

  test('missing second style', async () => {
    const browser = await webdriver(next.appPort, '/')

    await next.patchFile(
      'pages/inter.module.css',
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
"./pages/inter.module.css:8:5
Syntax error: @font-face styles must match

   6 |     }
   7 |     
>  8 |     @font-face {
     |     ^
   9 |       font-family: 'Inter';
  10 |       src: url(./inter.woff2);"
`)
  })

  test('missing first unicode-range', async () => {
    const browser = await webdriver(next.appPort, '/')

    await next.patchFile(
      'pages/inter.module.css',
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
"./pages/inter.module.css:2:5
Syntax error: Expected unicode-range when defining multiple font faces

  1 | 
> 2 |     @font-face {
    |     ^
  3 |       font-family: 'Inter';
  4 |       src: url(./inter.woff2);"
`)
  })

  test('missing second unicode-range', async () => {
    const browser = await webdriver(next.appPort, '/')

    await next.patchFile(
      'pages/inter.module.css',
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
"./pages/inter.module.css:8:5
Syntax error: Expected unicode-range when defining multiple font faces

   6 |     }
   7 |     
>  8 |     @font-face {
     |     ^
   9 |       font-family: 'Inter';
  10 |       src: url(./inter.woff2);"
`)
  })

  test('missing both unicode-ranges', async () => {
    const browser = await webdriver(next.appPort, '/')

    await next.patchFile(
      'pages/inter.module.css',
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
"./pages/inter.module.css:2:5
Syntax error: Expected unicode-range when defining multiple font faces

  1 | 
> 2 |     @font-face {
    |     ^
  3 |       font-family: 'Inter';
  4 |       src: url(./inter.woff2);"
`)
  })

  test('duplicate unicode-ranges', async () => {
    const browser = await webdriver(next.appPort, '/')

    await next.patchFile(
      'pages/inter.module.css',
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

    await check(() => getRedboxSource(browser), /unicode-range/)
    expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/inter.module.css:11:7
Syntax error: Found duplicate unicode-range

   9 |       font-family: 'Inter';
  10 |       src: url(./inter.woff2);
> 11 |       unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
     |       ^
  12 |     }"
`)
  })

  test('setting .fontStyle', async () => {
    const browser = await webdriver(next.appPort, '/')

    await next.patchFile('pages/inter.module.css', '.fontStyle{}')

    await check(() => getRedboxSource(browser), /is reserved/)
    expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/inter.module.css:1:1
Syntax error: \\"fontStyle\\" is reserved when using font modules

> 1 | .fontStyle{}
    | ^"
`)
  })

  test('setting #fontClass', async () => {
    const browser = await webdriver(next.appPort, '/')

    await next.patchFile('pages/inter.module.css', '#fontClass{}')

    await check(() => getRedboxSource(browser), /is reserved/)
    expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"./pages/inter.module.css:1:1
Syntax error: \\"fontClass\\" is reserved when using font modules

> 1 | #fontClass{}
    | ^"
`)
  })
})

describe('font-face-errors, selfHostFonts: false', () => {
  let next: NextInstance

  beforeAll(async () => {
    next = await createNext({
      files: {
        'pages/index.js': `
        import './inter.module.css'
        export default () => <p>Hello world</p>`,

        'pages/inter.module.css': `
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
        `,

        'pages/inter.woff2': ``,
      },
      nextConfig: {
        experimental: {
          selfHostFonts: false,
        },
      },
    })
  })
  afterAll(() => next.destroy())

  test("dont't validate font-face", async () => {
    const html = await renderViaHTTP(next.url, '/')
    expect(html).toInclude('Hello world')
  })
})
