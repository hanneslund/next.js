import loaderUtils from 'next/dist/compiled/loader-utils3'
import { readFileSync } from 'fs'
import { promises } from 'fs'
import { webpack, sources } from 'next/dist/compiled/webpack/webpack'
import path from 'path'
import postcss from 'postcss'
import { setFontData } from '../../next-font'
import getRouteFromEntrypoint from '../../../server/get-route-from-entrypoint'

const PLUGIN_NAME = 'NextFontPlugin'

export class NextFontPlugin implements webpack.Plugin {
  fontsFile: string
  dir: string

  constructor(fontsFile: string, dir: string) {
    this.fontsFile = fontsFile
    this.dir = dir
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.beforeCompile.tapPromise(PLUGIN_NAME, async (params) => {
      const globOrig =
        require('next/dist/compiled/glob') as typeof import('next/dist/compiled/glob')
      const glob = (pattern: string): Promise<string[]> => {
        return new Promise((resolve, reject) => {
          globOrig(pattern, { cwd: this.dir, absolute: true }, (err, files) => {
            if (err) {
              return reject(err)
            }
            resolve(files)
          })
        })
      }

      const cssFiles = (await glob(`**/*.css`)).filter(
        (p) => p !== this.fontsFile
      )

      const fontUsage = new Map()
      await Promise.all(
        cssFiles.map(async (file) => {
          const css = await promises.readFile(file, 'utf8')
          await postcss([nextFontUsage(file, fontUsage)]).process(css, {
            from: file,
          })
        })
      )

      const fontDeclarations = await promises.readFile(this.fontsFile, 'utf8')

      const files = new Map()
      const fontData = {}
      const after = (
        await postcss([
          nextFontPlugin(this.fontsFile, files, fontData),
        ]).process(fontDeclarations, {
          from: this.fontsFile,
        })
      ).css

      params[PLUGIN_NAME] = {
        fontDeclarations: after,
        files,
        fontData,
      }
    })

    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation: any) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: PLUGIN_NAME,
          // @ts-ignore
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        async (assets: any) => {
          const params = compilation.params[PLUGIN_NAME]
          await Promise.all(
            [...params.files.entries()].map(async ([file, asset]) => {
              assets[file] = asset
            })
          )
        }
      )
    })
  }
}

// /**
//  * Find unique origin modules in the specified 'connections', which possibly
//  * contains more than one connection for a module due to different types of
//  * dependency.
//  */
// function findUniqueOriginModulesInConnections(
//   connections: Connection[]
// ): Set<unknown> {
//   const originModules = new Set()
//   for (const connection of connections) {
//     if (!originModules.has(connection.originModule)) {
//       originModules.add(connection.originModule)
//     }
//   }
//   return originModules
// }

function nextFontPlugin(fontsFile, files, fontData) {
  return {
    postcssPlugin: 'NEXT-FONT-POSTCSS-PLUGIN',
    async Once(root: any) {
      root.nodes.forEach((node: any) => {
        if (node.type === 'comment') return
        if (node.type !== 'atrule') throw new Error('Expected atrule')
        if (node.name !== 'font-face') throw new Error('Expected font-face')

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
              // '/static/fonts/[name].[hash:8].[ext]',
              '/static/fonts/[contenthash].[ext]',
              { content: fontFileData }
            )

            // decl.value = decl.value.replace(declUrl, `/_next${interpolatedName}`)
            files.set(
              interpolatedName,
              new sources.RawSource(fontFileData as any)
            )

            srcPath = `/_next${interpolatedName}`
            decl.value = decl.value.replace(declUrl, srcPath)
          }
        })

        if (family && srcPath) {
          fontData[family] = {
            path: srcPath,
          }
        }
      })
    },
  }
}

function nextFontUsage(file: string, fontUsage) {
  return {
    postcssPlugin: 'NEXT-FONT-POSTCSS-USAGE-PLUGIN',
    // Once(root: any) {
    //   root.nodes.forEach((node) => console.log(node))
    // },
    Declaration(decl: any) {
      if (decl.prop === 'font-family') {
        let font = decl.value
        if (font[0] === "'") {
          font = font.slice(1, -1)
        }

        let usedFonts = fontUsage.get(file)
        if (!usedFonts) {
          usedFonts = new Set()
        }
        usedFonts.add(font)
        fontUsage.set(file, usedFonts)
      }
    },
  }
}
