// https://github.com/fontsource/google-font-metadata/blob/main/lib/data/user-agents.json
const userAgents = {
  apiv1: {
    woff2:
      'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/15.10130',
    woff: 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko',
    ttf: 'Mozilla/5.0',
  },
  apiv2: {
    variable:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
    woff2: 'Mozilla/5.0 (Windows NT 6.3; rv:39.0) Gecko/20100101 Firefox/44.0',
    woff: 'Mozilla/4.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1667.0 Safari/537.36',
    ttf: 'Mozilla/5.0',
  },
}

export default async function googleFontsLoader(this: any) {
  const callback = this.async()

  const params = new URLSearchParams(this.resourceQuery)
  const data = JSON.parse(params.get('d'))

  const {
    font,
    variant,
    display = 'swap',
    subsets = ['latin'],
    fallback,
  } = data
  const [weight, style] = variant.split('-')

  // if (!['auto', 'block', 'swap', 'fallback', 'optional'].includes(display)) {
  //   callback(new Error(`Unknown display value: ${display}`))
  //   return
  // }

  try {
    const res = await fetch(
      `https://fonts.googleapis.com/css2?family=${font.replaceAll(
        '_',
        '+'
      )}:ital,wght@${
        style === 'italic' ? 1 : 0
      },${weight}&display=${display}&subset=${subsets.join(',')}`,
      {
        headers: {
          'user-agent': userAgents.apiv2.woff2,
        },
      }
    )
    if (!res.ok) {
      // TODO: Custom error
      throw new Error(
        `Failed to fetch font ${this.resource.slice(
          this.resource.lastIndexOf('next/font/')
        )}. ${res.status} ${res.statusText}`
      )
    }

    callback(null, await res.text(), null, { fallback })
  } catch (err) {
    callback(err)
  }
}
