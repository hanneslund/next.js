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

      let family: string | undefined
      let style: string | undefined
      let weight: string | undefined
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

              let fontFamily = decl.value
              if (fontFamily[0] === "'" || fontFamily[0] === '"') {
                fontFamily = fontFamily.slice(1, fontFamily.length - 1)
              }
              fontFamily = `'${fontFamily}-${hashString}'`

              decl.value = fontFamily
              family = fontFamily
            } else if (decl.prop === 'font-weight') {
              if (weight && decl.value !== weight) {
                throw decl.error(
                  'A @font-face module may only contain one font weight'
                  // { word: 'font-weight' }
                )
              }
              weight = decl.value
            } else if (decl.prop === 'font-style') {
              if (style && decl.value !== style) {
                throw decl.error(
                  'A @font-face module may only contain one font style'
                )
              }
              style = decl.value
            }
          }
        }
      }

      // Add font class
      const classRule = new postcss.Rule({ selector: '.className' })
      const declarations = [
        new postcss.Declaration({ prop: 'font-family', value: family }),
        ...(style
          ? [new postcss.Declaration({ prop: 'font-style', value: style })]
          : []),
        ...(weight
          ? [new postcss.Declaration({ prop: 'font-weight', value: weight })]
          : []),
      ]
      classRule.nodes = declarations
      root.nodes.push(classRule)

      // Export @font-face values
      exports.push({ name: 'family', value: family })
      exports.push({ name: 'style', value: style })
      exports.push({ name: 'weight', value: weight })
    },
  }
}

plugin.postcss = true

export default plugin
