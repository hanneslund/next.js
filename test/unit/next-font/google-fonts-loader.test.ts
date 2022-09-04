import loader from '@next/font/google/loader'

const self: any = global

describe('@next/font/google loader', () => {
  beforeEach(() => {
    self.fetch = jest.fn()
  })

  test('Failed to fetch', async () => {
    self.fetch.mockResolvedValue({
      ok: false,
    })

    const err = await loader({
      functionName: 'Inter',
      data: [],
      config: { subsets: [] },
      emitFontFile: jest.fn(),
    }).catch((err) => err)

    expect(err.message).toMatchInlineSnapshot(`
"Failed to fetch font  \`Inter\`.
URL: https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=optional"
`)
  })

  test.each([
    [
      'Inter',
      [],
      'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=optional',
    ],
    [
      'Inter',
      [{ variant: '400' }],
      'https://fonts.googleapis.com/css2?family=Inter:wght@400&display=optional',
    ],
    [
      'Inter',
      [{ variant: '900', display: 'block' }],
      'https://fonts.googleapis.com/css2?family=Inter:wght@900&display=block',
    ],
    [
      'Source_Sans_Pro',
      [{ variant: '900', display: 'auto' }],
      'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@900&display=auto',
    ],
    [
      'Source_Sans_Pro',
      [{ variant: '200-italic' }],
      'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@1,200&display=optional',
    ],
    [
      'Roboto_Flex',
      [{ display: 'swap' }],
      'https://fonts.googleapis.com/css2?family=Roboto+Flex:wght@100..1000&display=swap',
    ],
    [
      'Roboto_Flex',
      [{ display: 'fallback', variant: 'variable', axes: ['opsz'] }],
      'https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,100..1000&display=fallback',
    ],
    [
      'Roboto_Flex',
      [
        {
          display: 'optional',
          axes: ['YTUC', 'slnt', 'wdth', 'opsz', 'XTRA', 'YTAS'],
        },
      ],
      'https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,slnt,wdth,wght,XTRA,YTAS,YTUC@8..144,-10..0,25..151,100..1000,323..603,649..854,528..760&display=optional',
    ],
    [
      'Oooh_Baby',
      [{ variant: '400' }],
      'https://fonts.googleapis.com/css2?family=Oooh+Baby:wght@400&display=optional',
    ],
    [
      'Albert_Sans',
      [{ variant: 'variable-italic' }],
      'https://fonts.googleapis.com/css2?family=Albert+Sans:ital,wght@1,100..900&display=optional',
    ],
    [
      'Fraunces',
      [{ variant: 'variable-italic', axes: ['WONK', 'opsz', 'SOFT'] }],
      'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@1,9..144,100..900,0..100,0..1&display=optional',
    ],
  ])(
    'Correct url: %s %p',
    async (functionName: string, data: any, url: string) => {
      self.fetch.mockResolvedValue({
        ok: true,
        text: async () => 'OK',
      })
      const { css } = await loader({
        functionName,
        data,
        config: { subsets: [] },
        emitFontFile: jest.fn(),
      })
      expect(css).toBe('OK')
      expect(self.fetch).toHaveBeenCalledTimes(1)
      expect(self.fetch).toHaveBeenCalledWith(url, expect.any(Object))
    }
  )
})
