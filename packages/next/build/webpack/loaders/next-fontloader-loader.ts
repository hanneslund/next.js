import path from 'path'
import loaderUtils from 'next/dist/compiled/loader-utils3'

type FontLoader = (options: {
  functionName: string
  data: any[]
  config: any
  emitFontFile: (content: Buffer, ext: string, preload: boolean) => string
}) => Promise<{ css: string; fallbackFonts: string[] }>

export default async function nextFontLoader(this: any) {
  const fontLoaderSpan = this.currentTraceSpan.traceChild(
    'next-fontloader-loader'
  )
  return fontLoaderSpan.traceAsyncFn(async () => {
    const callback = this.async()
    const { isServer, assetPrefix, fontLoaderOptions } = this.getOptions()

    const emitFontFile = (content: Buffer, ext: string, preload: boolean) => {
      const opts = { context: this.rootContext, content }
      const interpolatedName = loaderUtils.interpolateName(
        this,
        // Font files ending with .p.(woff|woff2|eot|ttf|otf) are preloaded
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
    let [functionName, ...data] = this.resourceQuery.slice(1).split(';')
    data = data.map((value: string) => JSON.parse(value))

    try {
      const loader: FontLoader = require(path.join(
        this.resourcePath,
        '../loader.js'
      )).default
      const { css, fallbackFonts } = await loader({
        functionName,
        data,
        config: fontLoaderOptions,
        emitFontFile,
      })
      callback(null, css, null, { fallbackFonts })
    } catch (err: any) {
      err.stack = false
      callback(err)
    }
  })
}
