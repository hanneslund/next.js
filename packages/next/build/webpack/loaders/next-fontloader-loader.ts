import path from 'path'
import loaderUtils from 'next/dist/compiled/loader-utils3'

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

  let [font, ...data] = this.resourceQuery.slice(1).split(';')
  data = data.map((value: string) => JSON.parse(value))

  const loader = require(path.join(this.resourcePath, '../loader.js'))
  try {
    const css = await loader.default(font, data, fontLoaderOptions, emitFile)
    callback(null, css)
  } catch (err: any) {
    err.stack = false
    callback(err)
  }
}
