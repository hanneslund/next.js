import path from 'path'
import loaderUtils from 'next/dist/compiled/loader-utils3'

export default async function nextFontDownloaderLoader(this: any) {
  const callback = this.async()
  const { isServer } = this.getOptions()
  const emitFile = (content: Buffer, ext: string) => {
    const opts = { context: this.rootContext, content }
    const interpolatedName = loaderUtils.interpolateName(
      this,
      `/static/fonts/[hash].${ext}`,
      opts
    )
    const path = `/_next${interpolatedName}`
    // const outputPath = assetPrefix + '/_next' + interpolatedName
    if (!isServer) {
      this.emitFile(interpolatedName, content, null)
    }
    return path
  }
  const data = JSON.parse(this.resourceQuery.slice(1)) // try catch
  const downloader = require(path.join(this.resourcePath, '../loader.js'))
  const { css, fallback } = await downloader.download(data, emitFile) // try catch
  callback(null, css, null, { fallback })
}
