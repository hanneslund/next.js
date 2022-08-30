import loaderUtils from 'next/dist/compiled/loader-utils3'
import postcss, { Declaration } from 'postcss'

const plugin = (
  exports: { name: any; value: any }[],
  resourceQuery: string
) => {
  return {
    postcssPlugin: 'postcss-font-loader-module',
    Once(root: any) {
      const hash = loaderUtils.getHashDigest(
        Buffer.from(resourceQuery),
        'md5',
        'hex',
        5
      )

      const fontFamilies: string[] = []
      let rawFamily: string | undefined
      let fontWeight: string | undefined
      let fontStyle: string | undefined

      const formatFamily = (family: string) => {
        if (family[0] === "'" || family[0] === '"') {
          family = family.slice(1, family.length - 1)
        }
        return `'${family}-${hash}'`
      }

      for (const node of root.nodes) {
        if (node.type === 'atrule' && node.name === 'font-face') {
          const familyNode = node.nodes.find(
            (decl: Declaration) => decl.prop === 'font-family'
          )
          if (!familyNode) {
            continue
          }

          if (!rawFamily) {
            let family: string = familyNode.value
            if (family[0] === "'" || family[0] === '"') {
              family = family.slice(1, family.length - 1)
            }
            rawFamily = family
          }
          const formattedFamily = formatFamily(familyNode.value)
          familyNode.value = formattedFamily

          if (fontFamilies.includes(formattedFamily)) {
            continue
          }
          fontFamilies.push(formattedFamily)

          // Extract weight and style from first encountered @font-face
          const weight = node.nodes.find(
            (decl: Declaration) => decl.prop === 'font-weight'
          )
          // Skip if includes ' ', then it's a range of possible values
          if (weight && !weight.value.includes(' ')) {
            fontWeight = weight.value
          }

          const style = node.nodes.find(
            (decl: Declaration) => decl.prop === 'font-style'
          )
          // Skip if includes ' ', then it's a range of possible values
          if (style && !style.value.includes(' ')) {
            fontStyle = style.value
          }
        }
      }

      // Add font class
      const classRule = new postcss.Rule({ selector: '.className' })
      classRule.nodes = [
        new postcss.Declaration({
          prop: 'font-family',
          value: fontFamilies.join(','),
        }),
        ...(fontStyle
          ? [
              new postcss.Declaration({
                prop: 'font-style',
                value: fontStyle,
              }),
            ]
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
      root.nodes.push(classRule)

      // Add varible class
      const varialbeRule = new postcss.Rule({ selector: '.variables' })
      varialbeRule.nodes = [
        new postcss.Declaration({
          prop: rawFamily
            ? `--next-font-${rawFamily.toLowerCase().replaceAll(' ', '-')}${
                fontWeight ? `-${fontWeight}` : ''
              }`
            : '',
          value: fontFamilies.join(','),
        }),
      ]
      root.nodes.push(varialbeRule)

      // Export @font-face values
      exports.push({
        name: 'style',
        value: {
          fontFamily: fontFamilies.join(','),
          fontWeight: fontWeight && Number(fontWeight),
          fontStyle,
        },
      })
    },
  }
}

plugin.postcss = true

export default plugin
