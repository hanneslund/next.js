import { readFileSync, writeFileSync } from 'fs'
import { webpack, sources } from 'next/dist/compiled/webpack/webpack'
import path from 'path'
import postcss from 'postcss'
import { NextConfigComplete } from '../../../server/config-shared'
import { setFontData } from '../../next-font'

const PLUGIN_NAME = 'NextFontPlugin'

export class NextFontPlugin implements webpack.Plugin {
  fonts: any
  dir: string

  fontZ = {}

  constructor(fonts: NextConfigComplete, dir: string) {
    console.log({ dir })
    this.fonts = fonts
    this.dir = dir
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      // nextFontMap.clear()
      // @ts-ignore backwards compat

      const nextFontPlugin = postcss.plugin(
        'next-font',
        function (name: any, callback: any) {
          return function (css: any, postcssResult: any) {
            let family: string | undefined
            let url: string | undefined

            css.nodes.forEach((node: any) => {
              if (node.type === 'comment') return
              if (node.type !== 'atrule') throw new Error('Expected atrule')
              if (node.name !== 'font-face')
                throw new Error('Expected font-face')
              node.nodes.forEach((decl: any) => {
                if (decl.type === 'comment') return
                if (decl.type !== 'decl') throw new Error('Expected decl')

                if (decl.prop === 'font-family') {
                  if (family) {
                    throw new Error('Duplicate font-family declaration')
                  }
                  family = decl.value.slice(1, -1)
                }

                if (decl.prop === 'src') {
                  if (url) {
                    throw new Error('Duplicate src declaration')
                  }
                  // check duplicates
                  let declUrl = decl.value.split('url(')[1]
                  url = declUrl.slice(0, declUrl.indexOf(')'))
                  decl.value = decl.value.replace(
                    url,
                    // basepath?
                    // assetprefix?
                    `__FONT_FILE_NAME__`
                  )
                }
              })
            })

            callback({ family, url })
          }
        }
      )

      // virtual import?
      let fontFacesCSS = ''

      const fontEntries = Object.entries(this.fonts)
      fontEntries.forEach(([name, cssFile]: any) => {
        const cssPath = path.join(this.dir, cssFile)
        const fontFamily = readFileSync(cssPath, 'utf8')
        let family: any
        let url: any

        const after = postcss([
          nextFontPlugin(name, (res: any) => {
            family = res.family
            url = res.url
          }),
        ]).process(fontFamily, {
          from: undefined,
        }).css

        const fontFilePath = path.join(cssPath, '..', url)
        const fontFileData = readFileSync(fontFilePath)
        const fontFileHash = require('crypto')
          .createHash('sha256')
          .update(fontFileData)
          .digest('hex')

        const fontFileStaticPath = `static/fonts/${fontFileHash}.${fontFilePath
          .split('.')
          .at(-1)}`

        // Validate fontFilePath?
        compilation.assets[fontFileStaticPath] = new sources.RawSource(
          fontFileData as any
        )

        fontFacesCSS += after.replace(
          '__FONT_FILE_NAME__',
          `/_next/${fontFileStaticPath}`
        )

        setFontData(name, {
          family,
          // hash: fontFileHash,

          // assetpreix basepath?
          path: `/_next/${fontFileStaticPath}`,
        })
      })

      writeFileSync(
        path.join(this.dir, '.next', 'font-faces.css'),
        fontFacesCSS,
        'utf8'
      )
    })
  }
}
