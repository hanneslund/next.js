export default async function nextFontLoader(src, meta, result) {
  const callback = this.async()
  if (
    meta?.sources?.includes(
      '/Users/hannesborno/projects/next.js/devapp/fonts/faces.css'
    )
  ) {
    callback(null, this._compilation.params.NextFontPlugin.fontDeclarations)
    return
  }

  callback(null, src)
}
