import postcss from 'postcss'
import path from 'path'
import chalk from 'next/dist/compiled/chalk'

export default async function nextFontLoader(this: any, src: string) {
  const callback = this.async()
  this.cacheable(false) // TODO

  try {
    await postcss([nextFontPlugin()]).process(src, {
      from: undefined,
    })
  } catch (e: any) {
    const resource = this._module?.issuer?.resource ?? null
    const context = this.rootContext ?? this._compiler?.context

    const issuer = resource
      ? context
        ? path.relative(context, resource)
        : resource
      : null

    const err = new Error(
      e.message + (issuer ? `\nLocation: ${chalk.cyan(issuer)}` : '')
    )

    this.emitError(err)
  }

  callback(null, src)
}

function nextFontPlugin() {
  // KOLLA SÅ MAN INTE SÄTTER FONT-FAMILY OSV SJÄLV
  return {
    postcssPlugin: 'NEXT-FONT-ERROR-LOADER-POSTCSS-PLUGIN',
    AtRule(atRule: any) {
      if (atRule.name === 'font-face') {
        throw new Error('Found @font-face declaration in CSS file')
      }
    },
  }
}
