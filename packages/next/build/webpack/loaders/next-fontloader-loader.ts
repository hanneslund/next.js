import path from 'path'
import loaderUtils from 'next/dist/compiled/loader-utils3'
import chalk from 'next/dist/compiled/chalk'

class FontLoaderError extends Error {
  constructor(error: any, issuer?: string) {
    super(error)
    this.name = 'FontLoaderError'
    this.message =
      error.message + (issuer ? `\nLocation: ${chalk.cyan(issuer)}` : '')
    this.stack = undefined
  }
}

export default async function nextFontLoader(this: any) {
  const callback = this.async()
  const { isServer, assetPrefix } = this.getOptions()

  const emitFile = (content: Buffer, ext: string, preload: true) => {
    const opts = { context: this.rootContext, content }
    const interpolatedName = loaderUtils.interpolateName(
      this,
      // Add .p when it is supposed to be preloaded
      `static/fonts/[hash]${preload ? '.p' : ''}.${ext}`,
      opts
    )
    const outputPath = `${assetPrefix}/_next/${interpolatedName}`
    if (!isServer) {
      this.emitFile(interpolatedName, content, null)
    }
    return outputPath
  }

  const data = JSON.parse(this.resourceQuery.slice(1))

  const resource = this._module?.issuer?.resource ?? null
  const context = this.rootContext ?? this._compiler?.context
  const issuer = resource
    ? context
      ? path.relative(context, resource)
      : resource
    : null

  const loader = require(path.join(this.resourcePath, '../loader.js'))
  try {
    const css = await loader.default(data, emitFile)
    callback(null, css, null, { fallback: data.fallback })
  } catch (err) {
    callback(new FontLoaderError(err, issuer))
  }
}
