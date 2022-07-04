import postcss from 'postcss'
import path from 'path'
import chalk from 'next/dist/compiled/chalk'

export default async function nextFontLoader(src: string) {
  const callback = this.async()

  console.log(src)
  try {
    await postcss([nextFontPlugin()]).process(src, {
      from: undefined,
    })
  } catch (e) {
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
  // ).css

  callback(null, src) // ERROR HÄR IST?
}

function nextFontPlugin() {
  return {
    postcssPlugin: 'NEXT-FONT-LOADER-POSTCSS-PLUGIN',
    AtRule(atRule: any) {
      if (atRule.name === 'font-face') {
        console.log(atRule)
        throw new Error(
          'Found @font-face declaration outside of name.font.css file.'
        )
      }
    },
  }
}
