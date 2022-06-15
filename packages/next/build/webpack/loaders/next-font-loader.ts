import { readFile } from 'fs-extra'
import loaderUtils from 'next/dist/compiled/loader-utils3'
import { webpack } from 'next/dist/compiled/webpack/webpack'
import path from 'path'
import postcss from 'postcss'
import { getFontDeclarationCss, setFontDeclarationCss } from '../../next-font'

export default async function nextFontLoader(src, meta, result) {
  console.log(meta)
  if (
    meta.sources.includes(
      '/Users/hannesborno/projects/next.js/devapp/fonts.css'
    )
  ) {
    return getFontDeclarationCss()
  }

  // Error if @font-face is found
  return src
}
