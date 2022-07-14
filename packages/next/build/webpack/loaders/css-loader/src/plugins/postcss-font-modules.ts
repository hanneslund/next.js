import crypto from 'crypto'
import postcss from 'postcss'

const plugin = (exports: any[]) => {
  return {
    postcssPlugin: 'postcss-font-modules',
    Once(root: any) {
      // Create hash
      const hash = crypto.createHash('sha256')
      for (const node of root.nodes) {
        if (node.type === 'atrule' && node.name === 'font-face') {
          for (const decl of node.nodes) {
            hash.update(decl.value)
          }
        }
      }
      const hashString = hash.digest('hex')

      // Replace font-family in @font-face and CLASSES?
      let rawFamily: string | undefined

      let fontFamily: string | undefined
      let fontStyle: string | undefined
      let fontWeight: string | undefined
      for (const node of root.nodes) {
        if (node.type === 'atrule' && node.name === 'font-face') {
          for (const decl of node.nodes) {
            if (decl.prop === 'font-family') {
              if (rawFamily && decl.value !== rawFamily) {
                throw decl.error(
                  'A @font-face module may only contain one font family'
                  // { word: 'font-family' }
                )
              }
              rawFamily = decl.value

              let family = decl.value
              if (family[0] === "'" || family[0] === '"') {
                family = family.slice(1, family.length - 1)
              }
              family = `'${family}-${hashString}'`

              decl.value = family
              fontFamily = family
            } else if (decl.prop === 'font-weight') {
              if (fontWeight && decl.value !== fontWeight) {
                throw decl.error(
                  'A @font-face module may only contain one font weight'
                  // { word: 'font-weight' }
                )
              }
              fontWeight = decl.value
            } else if (decl.prop === 'font-style') {
              if (fontStyle && decl.value !== fontStyle) {
                throw decl.error(
                  'A @font-face module may only contain one font style'
                )
              }
              fontStyle = decl.value
            }
          }
        }
      }

      // Add font class
      const classRule = new postcss.Rule({ selector: '.className' })
      const declarations = [
        new postcss.Declaration({ prop: 'font-family', value: fontFamily }),
        ...(fontStyle
          ? [new postcss.Declaration({ prop: 'font-style', value: fontStyle })]
          : []),
        ...(fontWeight
          ? [
              new postcss.Declaration({
                prop: 'font-weight',
                value: fontWeight,
              }),
            ]
          : []),
      ]
      classRule.nodes = declarations
      root.nodes.push(classRule)

      // Export @font-face values
      exports.push({
        name: 'style',
        value: {
          fontFamily,
          ...(fontStyle ? { fontStyle } : {}),
          ...(fontWeight ? { fontWeight } : {}),
        },
      })
    },
  }
}

plugin.postcss = true

export default plugin
