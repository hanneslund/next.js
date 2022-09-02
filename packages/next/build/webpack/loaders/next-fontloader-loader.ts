import path from 'path'
import loaderUtils from 'next/dist/compiled/loader-utils3'

export default async function nextFontLoader(this: any) {
  const fontLoaderSpan = this.currentTraceSpan.traceChild(
    'next-fontloader-loader'
  )
  return fontLoaderSpan.traceAsyncFn(async () => {
    const callback = this.async()
    const { isServer, assetPrefix, fontLoaderOptions } = this.getOptions()

    const emitFontFile = (content: Buffer, ext: string, preload: true) => {
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

    // next-swc next_font_loaders turns each function call argument into JSON seperated by a semicolon
    let [functionName, ...args] = this.resourceQuery.slice(1).split(';')
    args = args.map((value: string) => JSON.parse(value))

    const loader = require(path.join(this.resourcePath, '../loader.js'))
    try {
      const css = await loader.default(
        functionName,
        args,
        fontLoaderOptions,
        emitFontFile
      )
      callback(null, css)
    } catch (err: any) {
      err.stack = false
      callback(err)
    }
  })
}
