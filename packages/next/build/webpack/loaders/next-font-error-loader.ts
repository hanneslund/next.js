import CssSyntaxError from './css-loader/src/CssSyntaxError'

export default async function nextFontLoader(
  this: any,
  src: string,
  map: any,
  meta: any
) {
  const callback = this.async()
  this.cacheable(false) // TODO

  // Reuse CSS AST (PostCSS AST e.g 'postcss-loader') to avoid reparsing
  if (meta) {
    const { ast } = meta

    if (ast && ast.type === 'postcss') {
      src = ast.root
    }
  }

  const { postcss } = await this.getOptions().postcss()
  const { resourcePath } = this

  try {
    await postcss([nextFontErrorsPlugin()]).process(src, {
      from: resourcePath,
    })
  } catch (error: any) {
    callback(
      error.name === 'CssSyntaxError' ? new CssSyntaxError(error) : error
    )
    return
  }

  callback(null, src, map /* new ast osv */)
}

function nextFontErrorsPlugin() {
  // KOLLA SÅ MAN INTE SÄTTER FONT-FAMILY OSV SJÄLV
  return {
    postcssPlugin: 'postcss-next-font-errors',
    AtRule(atRule: any) {
      if (atRule.name === 'font-face') {
        throw atRule.error(
          'Found @font-face in CSS file\nRead more: https://www.nextjs.org/fontmodules'
        )
      }
    },
  }
}
nextFontErrorsPlugin.postcss = true
