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

  fs.writeFileSync(
    path.join(__dirname, '../src/variable-font-axes.json'),
    JSON.stringify(variableFonts, null, 2)
  )

  let fn = `function e():never { throw new Error("Incorrectly setup") }
  type Display = 'auto'|'block'|'swap'|'fallback'|'optional'
  type FontModule = {className:string,style:{fontFamily:string,fontWeight:string,fontStyle:string}}
  `

  const fontData = {}
  for (const { family, subsets, weights, styles } of Object.values(fonts)) {
    const variants = []
    weights.forEach((weight) => {
      styles.forEach((style) => {
        variants.push(`${weight}${style === 'normal' ? '' : `-${style}`}`)
      })
    })

    if (variableFonts[family]) {
      variants.push('variable')
    }

    fontData[family] = { variants, subsets, axes: variableFonts[family] }
    fn += `export function ${family.replaceAll(' ', '_')}(options: {
      variant:${variants.map((variant) => `"${variant}"`).join('|')}
      display?:Display,
      preload?:(${subsets.map((s) => `'${s}'`).join('|')})[]}):void{e()}
    `
  }

  fs.writeFileSync(path.join(__dirname, '../src/index.ts'), fn)
  fs.writeFileSync(
    path.join(__dirname, '../src/font-data.json'),
    JSON.stringify(fontData, null, 2)
  )
})()
