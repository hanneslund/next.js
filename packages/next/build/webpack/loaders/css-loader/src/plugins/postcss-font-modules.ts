import crypto from 'crypto'
import postcss, { AtRule } from 'postcss'

const plugin = (exports: any[], fallBackFonts: any = {}) => {
  return {
    postcssPlugin: 'postcss-font-modules',
    Once(root: any) {
      // Create hash
      const hash = crypto.createHash('sha256')
      for (const node of root.nodes) {
        if (node.type === 'atrule' && node.name === 'font-face') {
          for (const decl of node.nodes) {
            if (decl.type === 'decl') {
              hash.update(decl.value)
            }
          }
        }
      }
      const hashString = hash.digest('hex')

      let firstFontFace: AtRule | undefined
      let unicodeRanges: string[] | undefined
      let rawFontFamily: string | undefined
      const fontProperties: {
        fontFamily?: string
        fontWeight?: string
        fontStyle?: string
      } = {}

      const formatFamily = (family: string) => {
        if (family[0] === "'" || family[0] === '"') {
          family = family.slice(1, family.length - 1)
        }
        return `'${family}-${hashString}'`
      }

      for (const node of root.nodes) {
        if (node.type === 'atrule' && node.name === 'font-face') {
          const family = node.nodes.find((decl) => decl.prop === 'font-family')
          if (!family) {
            throw node.error('Missing font-family in @font-face')
          }

          if (rawFontFamily && rawFontFamily !== family.value) {
            throw family.error('@font-face families must match')
          }
          rawFontFamily = family.value
          const formattedFamily = formatFamily(family.value)
          if (!firstFontFace) {
            fontProperties.fontFamily = formattedFamily
          }
          family.value = fontProperties.fontFamily

          const src = node.nodes.find((decl) => decl.prop === 'src')
          if (!src) {
            throw node.error('Missing src in @font-face')
          }

          const weight = node.nodes.find((decl) => decl.prop === 'font-weight')
          if (fontProperties.fontWeight !== weight?.value) {
            if (firstFontFace) {
              throw (weight ?? node).error('@font-face weights must match')
            } else {
              fontProperties.fontWeight = weight?.value
            }
          }

          const style = node.nodes.find((decl) => decl.prop === 'font-style')
          if (fontProperties.fontStyle !== style?.value) {
            if (firstFontFace) {
              throw (style ?? node).error('@font-face styles must match')
            } else {
              fontProperties.fontStyle = style?.value
            }
          }

          const unicode = node.nodes.find(
            (decl) => decl.prop === 'unicode-range'
          )
          if (!firstFontFace && unicode && !unicodeRanges) {
            unicodeRanges = [unicode?.value]
          } else if (
            firstFontFace &&
            unicode &&
            unicodeRanges &&
            !unicodeRanges.includes(unicode.value)
          ) {
            unicodeRanges.push(unicode.value)
          } else if (firstFontFace && !unicodeRanges) {
            // Missing unicode-range
            throw firstFontFace.error(
              'Expected unicode-range when defining multiple font faces'
            )
          } else if (firstFontFace && !unicode) {
            // Unexpecteds font-face
            throw node.error(
              'Expected unicode-range when defining multiple font faces'
            )
          } else if (firstFontFace && unicodeRanges!.includes(unicode.value)) {
            // Duplicate unicode-range
            throw unicode.error('Found duplicate unicode-range')
          }

          firstFontFace = node
        }
      }

      if (!fontProperties.fontFamily) {
        throw root.error('A font module needs a @font-face declaration')
      }

      for (const node of root.nodes) {
        if (node.type === 'rule') {
          for (const decl of node.nodes) {
            if (decl.type === 'decl') {
              if (decl.prop === 'font-family') {
                decl.value = decl.value
                  .split(',')
                  .map((family: string) =>
                    family.trim() === rawFontFamily
                      ? fontProperties.fontFamily
                      : family
                  )
                  .join(',')
              }
            }
          }
        }
      }

      // Add font class
      let fallbackKey = rawFontFamily as string
      if (fallbackKey[0] === '"' || fallbackKey[0] === "'") {
        fallbackKey = fallbackKey.slice(1, fallbackKey.length - 1)
      }
      const classRule = new postcss.Rule({ selector: '.className' })
      const declarations = [
        new postcss.Declaration({
          prop: 'font-family',
          value: [
            fontProperties.fontFamily,
            ...(fallBackFonts[fallbackKey] ? fallBackFonts[fallbackKey] : []),
          ].join(','),
        }),
        ...(fontProperties.fontStyle
          ? [
              new postcss.Declaration({
                prop: 'font-style',
                value: fontProperties.fontStyle,
              }),
            ]
          : []),
        ...(fontProperties.fontWeight
          ? [
              new postcss.Declaration({
                prop: 'font-weight',
                value: fontProperties.fontWeight,
              }),
            ]
          : []),
      ]
      classRule.nodes = declarations
      root.nodes.push(classRule)

      // Export @font-face values
      exports.push({
        name: 'style',
        value: fontProperties,
      })

      // Export fallback fonts
      if (fallBackFonts[fallbackKey]) {
        exports.push({
          name: 'fallbackFonts',
          value: fallBackFonts[fallbackKey],
        })
      }
    },
  }
}

plugin.postcss = true

export default plugin
