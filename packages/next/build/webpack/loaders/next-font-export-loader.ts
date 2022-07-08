export default function nextFontExportLoader(src: string) {
  return src
    .split('\n')
    .map((line) => {
      if (line.includes('__FONT_FAMILY__')) {
        return line.replace(/"__FONT_FAMILY__.*?"/, '"family"')
      }
      return line
    })
    .join('\n')
}
