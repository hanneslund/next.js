const fs = require('fs')
const path = require('path')

const fonts = Object.values(require('./google-fonts-v2.json'))
const variableResponses = require('./variable-response.json')

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
for (const { family, subsets, weights, styles } of fonts) {
  const variants = []
  weights.forEach((weight) => {
    styles.forEach((style) => {
      variants.push(`"${weight}${style === 'normal' ? '' : `-${style}`}"`)
    })
  })

  if (variableFonts[family]) {
    variants.push('"variable"')
  }

  fn += `export function ${family.replaceAll(' ', '_')}(options: {
    variant:${variants.join('|')}
    display?:Display,
    fallback?: string[],
    preload?: boolean,
    subsets?:(${subsets.map((s) => `'${s}'`).join('|')})[]}):FontModule{e()}
  `
}

fs.writeFileSync(path.join(__dirname, '../src/index.ts'), fn)
