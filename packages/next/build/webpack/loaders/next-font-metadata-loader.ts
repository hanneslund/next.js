export default function nextFontMetadataLoader(src: string) {
  // this.loadModule(
  //   'https://cdn.jsdelivr.net/npm/@fontsource/inter@4.5.11/files/inter-all-400-normal.woff',
  //   console.log
  // )
  this.cacheable(false) // TODO

  let [fontId, fileName] = this.resourcePath
    .split('next/font/')
    .at(-1)
    .split('/')

  const [weight, style] = fileName.slice(0, fileName.length - 3).split('-')

  const params = new URLSearchParams(this.resourceQuery)
  const display = params.get('display') ?? 'swap'

  if (!['auto', 'block', 'swap', 'fallback', 'optional'].includes(display)) {
    this.emitError(new Error(`Unknown display value: ${display}`))
  }

  const fontFaces = JSON.parse(src).map(([subset, range, woff2, woff]) => {
    return `@font-face {
font-family: '${fontId}';
font-style: ${style};
font-display: swap;
font-weight: ${weight};
src: url(${woff2}) format('woff2'), url(${woff}) format('woff');
unicode-range: ${range};
}`
  })

  return fontFaces.join('\n')
}
