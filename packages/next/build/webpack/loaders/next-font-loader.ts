import postcss from 'postcss'
import loaderUtils from 'next/dist/compiled/loader-utils3'
import path from 'path'
import { readFileSync } from 'fs'

export default async function nextFontLoader(src: string, a, b, c) {
  const callback = this.async()

  // const fileContent = await promises.readFile(fontsFile, 'utf8')
  let css = src

  // console.log(src)
  // console.log({ a, b, c })
  // const after = (
  //   await postcss([nextFontPlugin(this)]).process(css, {
  //     // from: fontsFile,
  //   })
  // ).css

  // callback(null, after)
  callback(null, src)
}

function nextFontPlugin(loaderCtx) {
  return {
    postcssPlugin: 'NEXT-FONT-LOADER-POSTCSS-PLUGIN',
    async Once(root: any) {},
  }
}
