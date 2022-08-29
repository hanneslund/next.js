import loader from '@next/font/google/loader'

describe('@next/font/google loader', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  //   test('Unknown font', async () => {
  //     const err = await loader(
  //       { font: 'Test', variant: '400-italic' },
  //       jest.fn()
  //     ).catch((err) => err)

  //     expect(err.message).toBe('Unknown font `Test`')
  //   })
  //   test('Invalid display', async () => {
  //     const err = await loader(
  //       { font: 'Inter', variant: '400', display: 'test' },
  //       jest.fn()
  //     ).catch((err) => err)

  //     expect(err.message).toMatchInlineSnapshot(`
  // "Invalid display value \`test\` for font \`Inter\`
  // Available display values: auto, block, swap, fallback, optional"
  // `)
  //   })

  //   test('Invalid variant', async () => {
  //     const err = await loader(
  //       { font: 'Oooh_Baby', variant: '400-italic' },
  //       jest.fn()
  //     ).catch((err) => err)

  //     expect(err.message).toMatchInlineSnapshot(`
  // "Unknown variant \`400-italic\` for font \`Oooh Baby\`
  // Available variants: 400"
  // `)
  //   })

  //   test('Invalid preload type', async () => {
  //     const err = await loader(
  //       { font: 'Inter', variant: '400', preload: 10 },
  //       jest.fn()
  //     ).catch((err) => err)

  //     expect(err.message).toMatchInlineSnapshot(`
  // "Invalid preload value \`10\` for font \`Inter\`, expected an array of subsets.
  // Available subsets: cyrillic, cyrillic-ext, greek, greek-ext, latin, latin-ext, vietnamese"
  // `)
  //   })
  //   test('Invalid preload subset', async () => {
  //     const err = await loader(
  //       { font: 'Inter', variant: '400', preload: ['japanese'] },
  //       jest.fn()
  //     ).catch((err) => err)

  //     expect(err.message).toMatchInlineSnapshot(`
  // "Unknown preload subset \`japanese\` for font \`Inter\`
  // Available subsets: cyrillic, cyrillic-ext, greek, greek-ext, latin, latin-ext, vietnamese"
  // `)
  //   })

  test('Failed to fetch', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
    })

    const err = await loader(
      { font: 'Inter', variant: 'variable' },
      jest.fn()
    ).catch((err) => err)

    expect(err.message).toMatchInlineSnapshot(`
"Failed to fetch font  \`Inter\`
URL: https://fonts.googleapis.com/css2?family=Inter:slnt,wght@-10..0,100..900&display=swap"
`)
  })

  test.each(['auto', 'block', 'swap', 'fallback', 'optional'])(
    'Valid display value: %s',
    async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        text: async () => 'OK',
      })

      const css = await loader(
        { font: 'Inter', variant: 'variable' },
        jest.fn()
      )

      expect(css).toBe('OK')
    }
  )
  test('Default display is swap', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: async () => 'OK',
    })

    const css = await loader({ font: 'Inter', variant: 'variable' }, jest.fn())

    expect(css).toBe('OK')
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('&display=swap'),
      expect.any(Object)
    )
  })

  // test.each(['Inter', 'Source Code Pro', 'Abhaya Libre'])(
  test.skip.each(['Inter'])('Fixutre: %s', async (font) => {
    const fixture = fixtures[font]
    global.fetch
      .mockResolvedValue({
        ok: true,
        text: async () => fixture.css,
      })
      .mockResolvedValueOnce({ ok: true })

    const css = await loader(fixture.options, jest.fn())

    expect(css).toBe('OK')
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith(fixture.url, expect.any(Object))
  })

  // test('Emit files')

  // emit files
})

const fixtures = {
  Inter: {
    options: {
      font: 'Source_Code_Pro',
      variant: '900-italic',
      display: 'optional',
    },
    url: 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@1,900&display=optional',
    css: `
    /* cyrillic-ext */
    @font-face {
      font-family: 'Inter';
      font-style: oblique 0deg 10deg;
      font-weight: 100 900;
      font-display: swap;
      src: url(https://fonts.gstatic.com/s/inter/v12/UcCo3FwrK3iLTcvvYwYZ8UA3J58.woff2) format('woff2');
      unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
    }
    /* cyrillic */
    @font-face {
      font-family: 'Inter';
      font-style: oblique 0deg 10deg;
      font-weight: 100 900;
      font-display: swap;
      src: url(https://fonts.gstatic.com/s/inter/v12/UcCo3FwrK3iLTcvmYwYZ8UA3J58.woff2) format('woff2');
      unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
    }
    /* greek-ext */
    @font-face {
      font-family: 'Inter';
      font-style: oblique 0deg 10deg;
      font-weight: 100 900;
      font-display: swap;
      src: url(https://fonts.gstatic.com/s/inter/v12/UcCo3FwrK3iLTcvuYwYZ8UA3J58.woff2) format('woff2');
      unicode-range: U+1F00-1FFF;
    }
    /* greek */
    @font-face {
      font-family: 'Inter';
      font-style: oblique 0deg 10deg;
      font-weight: 100 900;
      font-display: swap;
      src: url(https://fonts.gstatic.com/s/inter/v12/UcCo3FwrK3iLTcvhYwYZ8UA3J58.woff2) format('woff2');
      unicode-range: U+0370-03FF;
    }
    /* vietnamese */
    @font-face {
      font-family: 'Inter';
      font-style: oblique 0deg 10deg;
      font-weight: 100 900;
      font-display: swap;
      src: url(https://fonts.gstatic.com/s/inter/v12/UcCo3FwrK3iLTcvtYwYZ8UA3J58.woff2) format('woff2');
      unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
    }
    /* latin-ext */
    @font-face {
      font-family: 'Inter';
      font-style: oblique 0deg 10deg;
      font-weight: 100 900;
      font-display: swap;
      src: url(https://fonts.gstatic.com/s/inter/v12/UcCo3FwrK3iLTcvsYwYZ8UA3J58.woff2) format('woff2');
      unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
    }
    /* latin */
    @font-face {
      font-family: 'Inter';
      font-style: oblique 0deg 10deg;
      font-weight: 100 900;
      font-display: swap;
      src: url(https://fonts.gstatic.com/s/inter/v12/UcCo3FwrK3iLTcviYwYZ8UA3.woff2) format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }`,
  },
  'Source Code Pro': {
    options: {
      font: 'Source_Code_Pro',
      variant: '900-italic',
      display: 'optional',
    },
    url: 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@1,900&display=optional',
    css: `
    /* cyrillic-ext */
@font-face {
  font-family: 'Source Code Pro';
  font-style: italic;
  font-weight: 900;
  font-display: optional;
  src: url(https://fonts.gstatic.com/s/sourcecodepro/v22/HI_jiYsKILxRpg3hIP6sJ7fM7PqlOPHYvDP_W9O7GQTTxYpbQ10YRp2Wpi1S-Bk.woff2) format('woff2');
  unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
}
/* cyrillic */
@font-face {
  font-family: 'Source Code Pro';
  font-style: italic;
  font-weight: 900;
  font-display: optional;
  src: url(https://fonts.gstatic.com/s/sourcecodepro/v22/HI_jiYsKILxRpg3hIP6sJ7fM7PqlOPHYvDP_W9O7GQTTxYpbSl0YRp2Wpi1S-Bk.woff2) format('woff2');
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
/* greek-ext */
@font-face {
  font-family: 'Source Code Pro';
  font-style: italic;
  font-weight: 900;
  font-display: optional;
  src: url(https://fonts.gstatic.com/s/sourcecodepro/v22/HI_jiYsKILxRpg3hIP6sJ7fM7PqlOPHYvDP_W9O7GQTTxYpbQl0YRp2Wpi1S-Bk.woff2) format('woff2');
  unicode-range: U+1F00-1FFF;
}
/* greek */
@font-face {
  font-family: 'Source Code Pro';
  font-style: italic;
  font-weight: 900;
  font-display: optional;
  src: url(https://fonts.gstatic.com/s/sourcecodepro/v22/HI_jiYsKILxRpg3hIP6sJ7fM7PqlOPHYvDP_W9O7GQTTxYpbTV0YRp2Wpi1S-Bk.woff2) format('woff2');
  unicode-range: U+0370-03FF;
}
/* vietnamese */
@font-face {
  font-family: 'Source Code Pro';
  font-style: italic;
  font-weight: 900;
  font-display: optional;
  src: url(https://fonts.gstatic.com/s/sourcecodepro/v22/HI_jiYsKILxRpg3hIP6sJ7fM7PqlOPHYvDP_W9O7GQTTxYpbQV0YRp2Wpi1S-Bk.woff2) format('woff2');
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
}
/* latin-ext */
@font-face {
  font-family: 'Source Code Pro';
  font-style: italic;
  font-weight: 900;
  font-display: optional;
  src: url(https://fonts.gstatic.com/s/sourcecodepro/v22/HI_jiYsKILxRpg3hIP6sJ7fM7PqlOPHYvDP_W9O7GQTTxYpbQF0YRp2Wpi1S-Bk.woff2) format('woff2');
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
/* latin */
@font-face {
  font-family: 'Source Code Pro';
  font-style: italic;
  font-weight: 900;
  font-display: optional;
  src: url(https://fonts.gstatic.com/s/sourcecodepro/v22/HI_jiYsKILxRpg3hIP6sJ7fM7PqlOPHYvDP_W9O7GQTTxYpbTl0YRp2Wpi1S.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
    `,
  },
  'Abhaya Libre': {
    options: {
      font: 'Abhaya_Libre',
      variant: '400',
      display: 'block',
    },
    url: 'https://fonts.googleapis.com/css2?family=Abhaya+Libre:wght@400&display=block',
    css: `
    /* sinhala */
@font-face {
  font-family: 'Abhaya Libre';
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url(https://fonts.gstatic.com/s/abhayalibre/v13/e3tmeuGtX-Co5MNzeAOqinEQYUnXgPRE4r80.woff2) format('woff2');
  unicode-range: U+0964-0965, U+0D82-0DF4, U+200C-200D, U+25CC;
}
/* latin-ext */
@font-face {
  font-family: 'Abhaya Libre';
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url(https://fonts.gstatic.com/s/abhayalibre/v13/e3tmeuGtX-Co5MNzeAOqinEQcknXgPRE4r80.woff2) format('woff2');
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
/* latin */
@font-face {
  font-family: 'Abhaya Libre';
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url(https://fonts.gstatic.com/s/abhayalibre/v13/e3tmeuGtX-Co5MNzeAOqinEQfEnXgPRE4g.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
    `,
  },
}
