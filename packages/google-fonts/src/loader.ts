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

  const getUrl = (keys: string[], values: string[]) =>
    `https://fonts.googleapis.com/css2?family=${googleFontName}:${keys.join(
      ','
    )}@${values.join(',')}&display=${display}`

  if (variant === 'variable') {
    const axes = (variableFontAxes as any)[fontFamily]
    if (!axes) {
      throw new Error(`Couldn't find variable font: ${fontFamily}`)
    }
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
    throw new Error(`Failed to fetch font: ${fontFamily}\nURL: ${url}`)
  }

  const css = (
    await Promise.all(
      (await res.text()).split('\n').map(async (line) => {
        const fontfaceUrl = /src: url\((.+?)\)/.exec(line)?.[1]
        if (fontfaceUrl) {
          const arrayBuffer = await fetch(url).then((res) => res.arrayBuffer())
          let ext: any = url.split('.')
          ext = ext[ext.length - 1]
          const file = emitFile(Buffer.from(arrayBuffer), ext, preload)
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
