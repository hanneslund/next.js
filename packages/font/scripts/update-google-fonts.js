const fs = require('fs')
const path = require('path')

;(async () => {
  const { familyMetadataList } = await fetch(
    'https://fonts.google.com/metadata/fonts'
  ).then((r) => r.json())

  let fontFunctions = `/* eslint-disable @typescript-eslint/no-unused-vars */
  type Display = 'auto'|'block'|'swap'|'fallback'|'optional'
  type FontModule = { className: string, variable: string, style: { fontFamily: string, fontWeight?: number, fontStyle?: string } }
  function e():never { throw new Error('@next/font/google is not configured as a font loader') }
  `
  const fontData = {}
  for (let { family, subsets, fonts, axes } of familyMetadataList) {
    subsets = subsets.filter((s) => s !== 'menu')

    let hasItalic = false
    const variants = Object.keys(fonts).map((variant) => {
      if (variant.endsWith('i')) {
        hasItalic = true
        return `${variant.slice(0, 3)}-italic`
      }
      return variant
    })

    const hasVariableFont = axes.length > 0

    let functionAxes
    if (hasVariableFont) {
      variants.push('variable')
      if (hasItalic) {
        variants.push('variable-italic')
      }

      const additionalAxes = axes.filter(({ tag }) => tag !== 'wght')
      if (additionalAxes.length > 0) {
        functionAxes = additionalAxes.map(({ tag, min, max }) => ({
          tag,
          min,
          max,
        }))
      }
    }

    fontData[family] = {
      variants,
      subsets,
      axes: hasVariableFont ? axes : undefined,
    }
    const isOptional = hasVariableFont ? '?' : ''
    fontFunctions += `export function ${family.replaceAll(
      ' ',
      '_'
    )}(options${isOptional}: {
    variant${isOptional}:${variants.map((variant) => `"${variant}"`).join('|')}
    display?:Display,
    preload?:boolean
    ${
      functionAxes
        ? `axes?:(${functionAxes.map(({ tag }) => `'${tag}'`).join('|')})[]`
        : ''
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
