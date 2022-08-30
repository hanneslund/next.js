const fs = require('fs')
const path = require('path')

;(async () => {
  const [fonts, variableResponses] = await Promise.all([
    fetch(
      'https://raw.githubusercontent.com/fontsource/google-font-metadata/main/data/google-fonts-v2.json'
    ).then((r) => r.json()),
    fetch(
      'https://raw.githubusercontent.com/fontsource/google-font-metadata/main/data/variable-response.json'
    ).then((r) => r.json()),
  ])

  const variableFonts = variableResponses.reduce((fontMap, font) => {
    fontMap[font.family] = font.axes
    return fontMap
  })

  let fontFunctions = `/* eslint-disable @typescript-eslint/no-unused-vars */
type Display = 'auto'|'block'|'swap'|'fallback'|'optional'
type FontModule = { className: string, variables: string, style: { fontFamily: string, fontWeight?: number, fontStyle?: string } }
function e():never { throw new Error() }
`

  const fontData = {}
  for (const { family, subsets, weights, styles } of Object.values(fonts)) {
    const variants = []
    weights.forEach((weight) => {
      styles.forEach((style) => {
        variants.push(`${weight}${style === 'normal' ? '' : `-${style}`}`)
      })
    })

    const varAxes = variableFonts[family]
    let functionAxes
    if (varAxes) {
      const additionalAxes = Object.keys(varAxes).filter(
        (key) => key !== 'ital' && key !== 'wght'
      )
      if (additionalAxes.length > 0) {
        functionAxes = additionalAxes
      }

      variants.push('variable')
      if (varAxes.ital) {
        variants.push('variable-italic')
      }
    }

    fontData[family] = { variants, subsets, axes: variableFonts[family] }
    fontFunctions += `export function ${family.replaceAll(' ', '_')}(options?: {
      variant:${variants.map((variant) => `"${variant}"`).join('|')}
      display?:Display,
preload?:(${subsets.map((s) => `'${s}'`).join('|')})[]
${
  functionAxes ? `axes?:(${functionAxes.map((s) => `'${s}'`).join('|')})[]` : ''
}
}):FontModule{e()}
`
  }

  fs.writeFileSync(
    path.join(__dirname, '../src/google/index.ts'),
    fontFunctions
  )
  fs.writeFileSync(
    path.join(__dirname, '../src/google/font-data.json'),
    JSON.stringify(fontData, null, 2)
  )
})()
