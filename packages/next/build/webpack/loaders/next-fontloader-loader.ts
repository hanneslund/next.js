import path from 'path'
import loaderUtils from 'next/dist/compiled/loader-utils3'
import chalk from 'next/dist/compiled/chalk'

class FontLoaderError extends Error {
  constructor(error: any, data: any, issuer?: string) {
    super(error)
    this.name = 'FontLoaderError'
    this.message =
      error.message +
      `\n\nOptions: ${JSON.stringify(data, null, 2)}` +
      (issuer ? `\n\nLocation: ${chalk.cyan(issuer)}` : '')
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

  const downloader = require(path.join(this.resourcePath, '../loader.js'))
  try {
    const { css, fallback } = await downloader.download(data, emitFile)
    callback(null, css, null, { fallback })
  } catch (err) {
    callback(new FontLoaderError(err, data, issuer))
  }
}
