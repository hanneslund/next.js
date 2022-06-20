import loaderUtils from 'next/dist/compiled/loader-utils3'
import { readFileSync } from 'fs'
import { promises } from 'fs'
import { webpack, sources } from 'next/dist/compiled/webpack/webpack'
import path from 'path'
import postcss from 'postcss'
import getRouteFromEntrypoint from '../../../server/get-route-from-entrypoint'

const PLUGIN_NAME = 'NextFontPlugin'

export class NextFontPlugin implements webpack.Plugin {
  pagesDir: string

  constructor(pagesDir: string) {
    this.pagesDir = pagesDir
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.beforeCompile.tapPromise(PLUGIN_NAME, async (params) => {
      const globOrig =
        require('next/dist/compiled/glob') as typeof import('next/dist/compiled/glob')
      const glob = (pattern: string): Promise<string[]> => {
        return new Promise((resolve, reject) => {
          globOrig(
            pattern,
            { cwd: this.pagesDir, absolute: true },
            (err, files) => {
              if (err) {
                return reject(err)
              }
              resolve(files)
            }
          )
        })
      }

      const fontFiles = await glob(`**/_fonts.css`)
      const pages = (await glob(`**/*.{js,jsx,ts,tsx}`)).filter(
        (page) => !/pages\/_app.js/.test(page)
      )

      const files = new Map()
      const fontData = {}
      const fontz = {}
      let fontDeclarations = ''

      await Promise.all(
        fontFiles.map(async (fontsFile) => {
          const fileContent = await promises.readFile(fontsFile, 'utf8')
          const after = (
            await postcss([
              nextFontPlugin(fontsFile, files, fontData, fontz),
            ]).process(fileContent, {
              from: fontsFile,
            })
          ).css
          fontDeclarations += after + '\n'
          // console.log
        })
      )

      const fontsManifest = {} as { [key: string]: string[] }
      pages.forEach((page) => {
        let preloads = []

        const pageLevel = path.join(page, '..')
        fontFiles.forEach((css) => {
          const cssLevel = path.join(css, '..')
          if (shouldPreloadFonts(this.pagesDir, cssLevel, pageLevel)) {
            preloads = preloads.concat(fontz[css])
          }
        })

        fontsManifest[page] = preloads
      })

      params[PLUGIN_NAME] = {
        fontDeclarations,
        files,
        fontData,
        fontsManifest,
        fontFiles,
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

function shouldPreloadFonts(
  pagesDir: string,
  cssLevel: string,
  pageLevel: string
): boolean {
  if (cssLevel === pageLevel) return true
  if (pageLevel === pagesDir) return false
  return shouldPreloadFonts(pagesDir, cssLevel, path.join(pageLevel, '..'))
}

function nextFontPlugin(fontsFile, files, fontData, fontz) {
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
              '/static/fonts/[name].[hash:8].[ext]',
              // '/static/fonts/[name].[contenthash].[ext]',
              { content: fontFileData }
            )

            // decl.value = decl.value.replace(declUrl, `/_next${interpolatedName}`)
            files.set(
              interpolatedName,
              new sources.RawSource(fontFileData as any)
            )

            if (fontz[fontsFile]) {
              fontz[fontsFile].push(`/_next${interpolatedName}`)
            } else {
              fontz[fontsFile] = [`/_next${interpolatedName}`]
            }
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
