import variableFontAxes from './variable-font-axes.json'

const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36'

export async function download(
  data: any,
  emitFile: (content: Buffer, ext: string, preload: boolean) => string
) {
  const {
    font,
    variant,
    display = 'swap',
    subsets = ['latin'],
    fallback,
    preload,
  } = data

  const fontFamily = font.replaceAll('_', ' ')
  const googleFontName = font.replaceAll('_', '+')
  let url: string
  if (variant === 'variable') {
    const axes = (variableFontAxes as any)[fontFamily]
    const keys = Object.keys(axes)
    const values = Object.values(axes).map(
      ({ min, max }: any) => `${min}..${max}`
    )
    url = getUrl(googleFontName, keys, values, display)
  } else {
    const [weight, style] = variant.split('-')
    const keys = [...(style ? ['ital'] : []), 'wght']
    const values = [...(style ? [style === 'italic' ? 1 : 0] : []), weight]
    url = getUrl(googleFontName, keys, values, display)
  }

  // SUBSETS
  const res = await fetch(url, {
    headers: {
      'user-agent': CHROME_UA,
    },
  })

  if (!res.ok) {
    // TODO: Custom error
    throw new Error(`Failed to fetch font: ${fontFamily}`)
  }

  const css = (
    await Promise.all(
      (await res.text()).split('\n').map(async (line) => {
        const url = /src: url\((.+?)\)/.exec(line)?.[1]
        if (url) {
          const data = await fetch(url).then((res) => res.arrayBuffer())
          let ext: any = url.split('.')
          ext = ext[ext.length - 1]
          const file = emitFile(Buffer.from(data), ext, preload)
          return line.replace(url, file)
        }
        return line
      })
    )
  ).join('\n')

  return {
    css,
    fallback,
  }
}

function getUrl(
  font: string,
  keys: string[],
  values: string[],
  display: string
) {
  return `https://fonts.googleapis.com/css2?family=${font}:${keys.join(
    ','
  )}@${values.join(',')}&display=${display}`
}
