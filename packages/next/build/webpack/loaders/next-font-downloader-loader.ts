import path from 'path'

export default async function nextFontDownloaderLoader(this: any) {
  const callback = this.async()
  const data = JSON.parse(this.resourceQuery.slice(1)) // try catch
  const downloader = require(path.join(this.resourcePath, '../loader.js'))
  const { css, fallback } = await downloader.download(data)
  callback(null, css, null, { fallback })
}
