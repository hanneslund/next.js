import fontData from './font-data.json'

const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36'

const allowedDisplayValues = ['auto', 'block', 'swap', 'fallback', 'optional']

export default async function download(
  data: any,
  emitFile: (content: Buffer, ext: string, preload: boolean) => string
) {
  const { font, variant, display = 'swap', preload, axes } = data

  const fontFamily = font.replaceAll('_', ' ')
  const googleFontName = font.replaceAll('_', '+')

  const fontVariants = (fontData as any)[fontFamily]?.variants
  if (!fontVariants) {
    throw new Error(`Unknown font \`${fontFamily}\``)
  }
  if (!variant) {
    throw new Error(
      `Missing variant for font \`${fontFamily}\`\nAvailable variants: ${fontVariants.join(
        ', '
      )}`
    )
  }
  if (!fontVariants.includes(variant)) {
    throw new Error(
      `Unknown variant \`${variant}\` for font \`${fontFamily}\`\nAvailable variants: ${fontVariants.join(
        ', '
      )}`
    )
  }

  if (!allowedDisplayValues.includes(display)) {
    throw new Error(
      `Invalid display value \`${display}\` for font \`${fontFamily}\`\nAvailable display values: ${allowedDisplayValues.join(
        ', '
      )}`
    )
  }

  const fontSubsets = (fontData as any)[fontFamily].subsets
  if (typeof preload !== 'undefined') {
    if (!Array.isArray(preload)) {
      throw new Error(
        `Invalid preload value for font \`${fontFamily}\`, expected an array of subsets.\nAvailable subsets: ${fontSubsets.join(
          ', '
        )}`
      )
    }
    preload.forEach((subset) => {
      if (!fontSubsets.includes(subset)) {
        throw new Error(
          `Unknown preload subset \`${subset}\` for font \`${fontFamily}\`\nAvailable subsets: ${fontSubsets.join(
            ', '
          )}`
        )
      }
    })
  }

  let url: string
  const getUrl = (keyVal: Array<[string, string]>) =>
    `https://fonts.googleapis.com/css2?family=${googleFontName}:${keyVal
      .map(([key]) => key)
      .join(',')}@${keyVal.map(([, val]) => val).join(',')}&display=${display}`

  const [weight, style] = variant.split('-')

  if (weight !== 'variable' && axes) {
    throw new Error('`axes` can only be defined for variable fonts')
  }

  if (weight === 'variable') {
    const fontAxes = (fontData as any)[fontFamily].axes

    if (axes) {
      const defineAbleAxes = Object.keys(fontAxes).filter(
        (key: string) => key !== 'wght' && key !== 'ital'
      )
      if (defineAbleAxes.length === 0) {
        throw new Error(`Font \`${fontFamily}\` has no definable \`axes\``)
      }
      if (!Array.isArray(axes)) {
        throw new Error(
          `Invalid axes value for font \`${fontFamily}\`, expected an array of axes.\nAvailable axes: ${defineAbleAxes.join(
            ', '
          )}`
        )
      }
      axes.forEach((key) => {
        if (!defineAbleAxes.includes(key)) {
          throw new Error(
            `Invalid axes value \`${key}\` for font \`${fontFamily}\`.\nAvailable axes: ${defineAbleAxes.join(
              ', '
            )}`
          )
        }
      })
    }

    const usedAxes: Array<[string, string]> = Object.entries(fontAxes)
      .filter(
        ([key]) =>
          key === 'wght' ||
          (key === 'ital' && style === 'italic') ||
          axes?.includes(key)
      )
      .map(([key, { min, max }]: any) => [
        key,
        key === 'ital' ? '1' : `${min}..${max}`,
      ])
    console.log({ usedAxes })
    url = getUrl(usedAxes)
  } else {
    const keyVal: Array<[string, string]> = [['wght', weight]]
    if (style === 'italic') {
      keyVal.unshift(['ital', '1'])
    }
    url = getUrl(keyVal)
  }

  let fixture
  if (process.env.NEXT_FONT_GOOGLE_MOCKED_RESPONSES) {
    const fixtures = require(process.env.NEXT_FONT_GOOGLE_MOCKED_RESPONSES)
    fixture = fixtures[url]
    if (!fixture) throw new Error('Missing fixture for URL: ' + url)
  }

  let cssResponse
  if (fixture) {
    cssResponse = fixture.css
  } else {
    const res = await fetch(url, {
      headers: {
        'user-agent': CHROME_UA,
      },
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch font  \`${fontFamily}\`\nURL: ${url}`)
    }

    cssResponse = await res.text()
  }

  const lines = []
  let currentLocale = ''
  for (const line of cssResponse.split('\n')) {
    const newLocale = /\/\* (.+?) \*\//.exec(line)?.[1]
    if (newLocale) {
      currentLocale = newLocale
    } else {
      const fontFaceUrl = /src: url\((.+?)\)/.exec(line)?.[1]
      if (fontFaceUrl) {
        let fontFileBuffer: Buffer
        if (fixture) {
          fontFileBuffer = Buffer.from(fontFaceUrl)
        } else {
          const arrayBuffer = await fetch(fontFaceUrl).then((r) =>
            r.arrayBuffer()
          )
          fontFileBuffer = Buffer.from(arrayBuffer)
        }

        let ext: any = fontFaceUrl.split('.')
        ext = ext[ext.length - 1]
        const file = emitFile(
          fontFileBuffer,
          ext,
          (preload as any)?.includes(currentLocale)
        )
        lines.push(line.replace(fontFaceUrl, file))
        continue
      }
    }

    lines.push(line)
  }

  return lines.join('\n')
}
