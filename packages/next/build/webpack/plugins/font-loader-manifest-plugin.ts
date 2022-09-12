import { webpack, sources } from 'next/dist/compiled/webpack/webpack'
import getRouteFromEntrypoint from '../../../server/get-route-from-entrypoint'
import getAppRouteFromEntrypoint from '../../../server/get-app-route-from-entrypoint'
import { FONT_LOADER_MANIFEST } from '../../../shared/lib/constants'

export type FontLoaderManifest = {
  pages: { [entrypoint: string]: string[] }
  app: { [entrypoint: string]: string[] }
}
const PLUGIN_NAME = 'FontLoaderManifestPlugin'

export default class FontLoaderManifestPlugin {
  private appDirEnabled: boolean

  constructor(options: { appDirEnabled: boolean }) {
    this.appDirEnabled = options.appDirEnabled
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.make.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets: any) => {
          const fontLoaderManifest: FontLoaderManifest = { pages: {}, app: {} }

          for (const entrypoint of compilation.entrypoints.values()) {
            const pagePath = getRouteFromEntrypoint(entrypoint.name!)
            const appPath = getAppRouteFromEntrypoint(entrypoint.name!)

            if (!pagePath && !appPath) {
              continue
            }

            const fontFiles: string[] = entrypoint.chunks
              .flatMap((chunk: any) => [...chunk.auxiliaryFiles])
              .filter((file: string) =>
                /\.(woff|woff2|eot|ttf|otf)$/.test(file)
              )

            if (fontFiles.length > 0) {
              if (pagePath) {
                fontLoaderManifest.pages[pagePath] = fontFiles
              } else if (appPath) {
                // fontLoaderManifest.app[normalizeAppPath(appPath!)] = fontFiles
                fontLoaderManifest.app[appPath] = fontFiles
              }
            }
          }

          assets[`server/${FONT_LOADER_MANIFEST}`] = new sources.RawSource(
            JSON.stringify(fontLoaderManifest, null, 2)
          )
        }
      )
    })
    return
  }
}
