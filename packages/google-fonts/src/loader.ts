import fontData from './font-data.json'

const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36'

const allowedDisplayValues = ['auto', 'block', 'swap', 'fallback', 'optional']

export default async function download(
  data: any,
  emitFile: (content: Buffer, ext: string, preload: boolean) => string
) {
  const { font, variant, display = 'swap', preload } = data

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
        `Invalid preload value \`${preload}\` for font \`${fontFamily}\`, expected an array of subsets.\nAvailable subsets: ${fontSubsets.join(
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
  const getUrl = (keys: string[], values: string[]) =>
    `https://fonts.googleapis.com/css2?family=${googleFontName}:${keys.join(
      ','
    )}@${values.join(',')}&display=${display}`

  if (variant === 'variable') {
    const axes = (fontData as any)[fontFamily].axes
    const keys = Object.keys(axes)
    const values = Object.values(axes).map(
      ({ min, max }: any) => `${min}..${max}`
    )
    url = getUrl(keys, values)
  } else {
    const [weight, style] = variant.split('-')
    const keys = [...(style ? ['ital'] : []), 'wght']
    const values = [...(style ? [style === 'italic' ? 1 : 0] : []), weight]
    url = getUrl(keys, values)
  }

  const res = await fetch(url, {
    headers: {
      'user-agent': CHROME_UA,
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch font  \`${fontFamily}\`\nURL: ${url}`)
  }

  const cssResponse = await res.text()
  const lines = []
  let currentLocale = ''
  for (const line of cssResponse.split('\n')) {
    const newLocale = /\/\* (.+?) \*\//.exec(line)?.[1]
    if (newLocale) {
      currentLocale = newLocale
    } else {
      const fontFaceUrl = /src: url\((.+?)\)/.exec(line)?.[1]
      if (fontFaceUrl) {
        const arrayBuffer = await fetch(fontFaceUrl).then((r) =>
          r.arrayBuffer()
        )
        let ext: any = fontFaceUrl.split('.')
        ext = ext[ext.length - 1]
        const file = emitFile(
          Buffer.from(arrayBuffer),
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
