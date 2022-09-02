import fontData from './font-data.json'

const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36'

const allowedDisplayValues = ['auto', 'block', 'swap', 'fallback', 'optional']

const formatValues = (values: string[]) =>
  values.map((val) => `\`${val}\``).join(', ')

export default async function download(
  functionName: string,
  data: any[],
  config: any,
  emitFontFile: (content: Buffer, ext: string, preload: boolean) => string
) {
  if (!config?.subsets) {
    throw new Error(
      'Please specify subsets for `@next/font/google` in your `next.config.js`'
    )
  }
  let {
    variant,
    display = 'optional',
    preload = display === 'optional',
    axes,
  } = data[0] || ({} as any)

  const fontFamily = functionName.replace(/_/g, ' ')

  const fontVariants = (fontData as any)[fontFamily]?.variants
  if (!fontVariants) {
    throw new Error(`Unknown font \`${fontFamily}\``)
  }

  // Set variable as default
  if (!variant) {
    if (fontVariants.includes('variable')) {
      variant = 'variable'
    } else {
      throw new Error(
        `Missing variant for font \`${fontFamily}\`.\nAvailable variants: ${formatValues(
          fontVariants
        )}`
      )
    }
  }

  if (!fontVariants.includes(variant)) {
    throw new Error(
      `Unknown variant \`${variant}\` for font \`${fontFamily}\`.\nAvailable variants: ${formatValues(
        fontVariants
      )}`
    )
  }

  if (!allowedDisplayValues.includes(display)) {
    throw new Error(
      `Invalid display value \`${display}\` for font \`${fontFamily}\`.\nAvailable display values: ${formatValues(
        allowedDisplayValues
      )}`
    )
  }

  let url: string
  const getUrl = (keyVal: Array<[string, string]>) => {
    // Google api requires the axes to be sorted, starting with lowercase words
    keyVal.sort(([a], [b]) => {
      const aIsLowercase = a.charCodeAt(0) > 96
      const bIsLowercase = b.charCodeAt(0) > 96
      if (aIsLowercase && !bIsLowercase) return -1
      if (bIsLowercase && !aIsLowercase) return 1

      return a > b ? 1 : -1
    })

    return `https://fonts.googleapis.com/css2?family=${fontFamily.replace(
      / /g,
      '+'
    )}:${keyVal.map(([key]) => key).join(',')}@${keyVal
      .map(([, val]) => val)
      .join(',')}&display=${display}`
  }

  const [weight, style] = variant.split('-')

  if (weight !== 'variable' && axes) {
    throw new Error('Axes can only be defined for variable fonts')
  }

  if (weight === 'variable') {
    const fontAxes: Array<{ tag: string; min: number; max: number }> = (
      fontData as any
    )[fontFamily].axes

    if (axes) {
      const defineAbleAxes: string[] = fontAxes
        .map(({ tag }) => tag)
        .filter((tag) => tag !== 'wght')
      if (defineAbleAxes.length === 0) {
        throw new Error(`Font \`${fontFamily}\` has no definable \`axes\``)
      }
      if (!Array.isArray(axes)) {
        throw new Error(
          `Invalid axes value for font \`${fontFamily}\`, expected an array of axes.\nAvailable axes: ${formatValues(
            defineAbleAxes
          )}`
        )
      }
      axes.forEach((key) => {
        if (!defineAbleAxes.some((tag) => tag === key)) {
          throw new Error(
            `Invalid axes value \`${key}\` for font \`${fontFamily}\`.\nAvailable axes: ${formatValues(
              defineAbleAxes
            )}`
          )
        }
      })
    }
    const usedAxes: Array<[string, string]> = fontAxes
      .filter(({ tag }) => tag === 'wght' || axes?.includes(tag))
      .map(({ tag, min, max }) => [tag, `${min}..${max}`])

    if (style === 'italic') {
      usedAxes.unshift(['ital', '1'])
    }

    url = getUrl(usedAxes)
  } else {
    const keyVal: Array<[string, string]> = [['wght', weight]]
    if (style === 'italic') {
      keyVal.unshift(['ital', '1'])
    }
    url = getUrl(keyVal)
  }

  let mockedResponse: string | undefined
  if (process.env.NEXT_FONT_GOOGLE_MOCKED_RESPONSES) {
    const mockFile = require(process.env.NEXT_FONT_GOOGLE_MOCKED_RESPONSES)
    mockedResponse = mockFile[url]
    if (!mockedResponse) {
      throw new Error('Missing mocked response for URL: ' + url)
    }
  }

  let cssResponse
  if (mockedResponse) {
    cssResponse = mockedResponse
  } else {
    const res = await fetch(url, {
      headers: {
        'user-agent': CHROME_UA,
      },
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch font  \`${fontFamily}\`.\nURL: ${url}`)
    }

    cssResponse = await res.text()
  }

  // Find font files to download
  const fontFiles: Array<{
    googleFontFileUrl: string
    preloadFontFile: boolean
  }> = []
  let currentSubset = ''
  for (const line of cssResponse.split('\n')) {
    // Each @font-face has the subset above it in a comment
    const newSubset = /\/\* (.+?) \*\//.exec(line)?.[1]
    if (newSubset) {
      currentSubset = newSubset
    } else {
      const googleFontFileUrl = /src: url\((.+?)\)/.exec(line)?.[1]
      if (googleFontFileUrl) {
        fontFiles.push({
          googleFontFileUrl,
          preloadFontFile: !!preload && config.subsets.includes(currentSubset),
        })
      }
    }
  }

  // Download font files
  const downloadedFiles = await Promise.all(
    fontFiles.map(async ({ googleFontFileUrl, preloadFontFile }) => {
      let fontFileBuffer: Buffer
      if (mockedResponse) {
        fontFileBuffer = Buffer.from(googleFontFileUrl)
      } else {
        const arrayBuffer = await fetch(googleFontFileUrl).then((r) =>
          r.arrayBuffer()
        )
        fontFileBuffer = Buffer.from(arrayBuffer)
      }

      let ext: any = googleFontFileUrl.split('.')
      ext = ext[ext.length - 1]
      // Emit font file to .next/static/fonts
      const selfHostedFileUrl = emitFontFile(
        fontFileBuffer,
        ext,
        preloadFontFile
      )

      return {
        googleFontFileUrl,
        selfHostedFileUrl,
      }
    })
  )

  // Replace @font-face sources with self-hosted files
  let updatedCssResponse = cssResponse
  for (const { googleFontFileUrl, selfHostedFileUrl } of downloadedFiles) {
    updatedCssResponse = updatedCssResponse.replace(
      googleFontFileUrl,
      selfHostedFileUrl
    )
  }

  return updatedCssResponse
}
