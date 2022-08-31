import path from 'path'
import loaderUtils from 'next/dist/compiled/loader-utils3'
import chalk from 'next/dist/compiled/chalk'

class FontLoaderError extends Error {
  constructor(error: any) {
    super(error)
    this.name = 'FontLoaderError'
    this.message = error.message
    this.stack = undefined
  }
}

export default async function nextFontLoader(this: any) {
  const callback = this.async()
  const { isServer, assetPrefix, fontLoaderOptions } = this.getOptions()

  const emitFile = (content: Buffer, ext: string, preload: true) => {
    const opts = { context: this.rootContext, content }
    const interpolatedName = loaderUtils.interpolateName(
      this,
      // Font files ending with .p.[ext] will be preloaded
      `static/fonts/[hash]${preload ? '.p' : ''}.${ext}`,
      opts
    )
    const outputPath = `${assetPrefix}/_next/${interpolatedName}`
    if (!isServer) {
      this.emitFile(interpolatedName, content, null)
    }
    return outputPath
  }

  const [font, data] = this.resourceQuery.slice(1).split(';')

  const loader = require(path.join(this.resourcePath, '../loader.js'))
  try {
    const css = await loader.default(
      font,
      JSON.parse(data),
      fontLoaderOptions,
      emitFile
    )
    callback(null, css, null)
  } catch (err) {
    callback(new FontLoaderError(err))
  }
}
