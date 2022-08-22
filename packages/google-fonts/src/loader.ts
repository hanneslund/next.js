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

  let url: string
  if (variant === 'variable') {
    const axes = variableFontAxes[font.replaceAll('_', ' ')]
    // ERROR OM INTE FINNS
    const keys = Object.keys(axes)
    const values = Object.values(axes).map(
      ({ min, max }: any) => `${min}..${max}`
    )
    // console.log(axes)
    url = `https://fonts.googleapis.com/css2?family=${font.replaceAll(
      '_',
      '+'
    )}:${keys.join(',')}@${values.join(',')}`
  } else {
    const [weight, style] = variant.split('-')
    url = `https://fonts.googleapis.com/css2?family=${font.replaceAll(
      '_',
      '+'
    )}:ital,wght@${
      style === 'italic' ? 1 : 0
    },${weight}&display=${display}&subset=${subsets.join(',')}`
  }
  console.log({ url })

  // SUBSETS
  const res = await fetch(url, {
    headers: {
      'user-agent': CHROME_UA,
    },
  })

  if (!res.ok) {
    // TODO: Custom error
    throw new Error(`Failed to fetch font ${font.replaceAll('_', ' ')}`)
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
