import loaderUtils from 'next/dist/compiled/loader-utils3'
import { readFileSync } from 'fs'
import { webpack, sources } from 'next/dist/compiled/webpack/webpack'
import path from 'path'
import postcss from 'postcss'
import { setFontData, setFontDeclarationCss } from '../../next-font'

const PLUGIN_NAME = 'NextFontPlugin'

export class NextFontPlugin implements webpack.Plugin {
  fontsFile: string

  constructor(fontsFile: string) {
    this.fontsFile = fontsFile
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      // nextFontMap.clear()

      const fontsFile = this.fontsFile
      function nextFontPlugin() {
        return {
          postcssPlugin: 'NEXT-FONT-POSTCSS-PLUGIN',
          Once(root: any) {
            root.nodes.forEach((node: any) => {
              if (node.type === 'comment') return
              if (node.type !== 'atrule') throw new Error('Expected atrule')
              if (node.name !== 'font-face')
                throw new Error('Expected font-face')

              let srcPath: string | undefined
              let family: string | undefined
              node.nodes.forEach((decl: any) => {
                if (decl.type === 'comment') return
                if (decl.type !== 'decl') throw new Error('Expected decl')

                if (decl.prop === 'font-family') {
                  family = decl.value.slice(1, -1)
                }

                if (decl.prop === 'src') {
                  let declUrl = decl.value.split('url(')[1]
                  declUrl = declUrl.slice(0, declUrl.indexOf(')'))

                  const fontFilePath = path.join(fontsFile, '..', declUrl)
                  const fontFileData = readFileSync(fontFilePath)

                  const interpolatedName = loaderUtils.interpolateName(
                    { resourcePath: fontFilePath },
                    '/static/fonts/[name].[hash:8].[ext]',
                    { content: fontFileData }
                  )

                  // decl.value = decl.value.replace(declUrl, `/_next${interpolatedName}`)
                  compilation.assets[interpolatedName] = new sources.RawSource(
                    fontFileData as any
                  )

                  srcPath = `/_next${interpolatedName}`
                  decl.value = decl.value.replace(declUrl, srcPath)
                }
              })

              if (family && srcPath) {
                setFontData(family, {
                  family,
                  // hash: fontFileHash,
                  // assetpreix basepath?
                  path: srcPath,
                })
              }
            })
          },
        }
      }

      const fontDeclarations = readFileSync(this.fontsFile, 'utf8')
      const after = postcss([nextFontPlugin()]).process(fontDeclarations, {
        // from: undefined,
      }).css
      setFontDeclarationCss(after)
    })
  }
}
