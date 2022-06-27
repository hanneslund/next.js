export default function nextFontMetadataLoader(src: string) {
  const data = JSON.parse(src)
  const { id, family, unicodeRange, version, variants } = data

  const fontFaces = Object.entries(variants).flatMap(([weight, styles]) =>
    Object.entries(styles).flatMap(([style, ranges]) =>
      Object.entries(ranges).flatMap(([range, { url }]) => {
        const src = Object.entries(url)
          .filter(([format]) => format !== 'ttf')
          .map(([format, url]) => `url('${url}') format('${format}')`)
        return `@font-face {
    font-family: '${id}';
    font-style: ${style};
    font-display: swap;
    font-weight: ${weight};
    src: ${src.join(', ')};
    unicode-range: ${unicodeRange[range]};
  }`
      })
    )
  )

  return fontFaces.join('\n')
}
