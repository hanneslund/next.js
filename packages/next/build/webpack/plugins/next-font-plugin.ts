import devalue from 'next/dist/compiled/devalue'
import { webpack, sources } from 'next/dist/compiled/webpack/webpack'
import {
  PAGES_MANIFEST,
  APP_PATHS_MANIFEST,
} from '../../../shared/lib/constants'
import getRouteFromEntrypoint from '../../../server/get-route-from-entrypoint'
import { normalizePathSep } from '../../../shared/lib/page-path/normalize-path-sep'

export type PagesManifest = { [page: string]: string }

// let edgeServerPages = {}
// let nodeServerPages = {}
// let edgeServerRootPaths = {}
// let nodeServerRootPaths = {}

export default class NextFontPlugin implements webpack.Plugin {
  buildId: string
  // serverless: boolean
  // dev: boolean
  // isEdgeRuntime: boolean
  // appDirEnabled: boolean

  constructor({ buildId }: { buildId: string }) {
    this.buildId = buildId
  }
  // constructor({
  //   serverless,
  //   dev,
  //   isEdgeRuntime,
  //   appDirEnabled,
  // }: {
  //   serverless: boolean
  //   dev: boolean
  //   isEdgeRuntime: boolean
  //   appDirEnabled: boolean
  // }) {
  //   this.serverless = serverless
  //   this.dev = dev
  //   this.isEdgeRuntime = isEdgeRuntime
  //   this.appDirEnabled = appDirEnabled
  // }

  createAssets(compilation: any, assets: any) {
    const entrypoints = compilation.entrypoints
    const manifest: { [page: string]: string[] } = {}

    for (const entrypoint of entrypoints.values()) {
      const pagePath = getRouteFromEntrypoint(
        entrypoint.name,
        // this.appDirEnabled
        false
      )

      if (!pagePath || ['/_app', '/_error'].includes(pagePath)) {
        continue
      }

      const fontFiles = [
        ...new Set(
          entrypoint.chunks
            .flatMap(({ auxiliaryFiles }) => [...auxiliaryFiles.values()])
            .filter((file) => /\.(woff|woff2|eot|ttf|otf)$/.test(file))
        ),
      ] as string[]

      if (!fontFiles.length) {
        continue
      }

      manifest[pagePath] = fontFiles
    }

    // assets[
    //   // `${!this.dev && !this.isEdgeRuntime ? '../' : ''}` + PAGES_MANIFEST
    //   'font-manifest.json'
    // ] = new sources.RawSource(JSON.stringify(manifest, null, 2))

    // // const clientManifestPath = `${CLIENT_STATIC_FILES_PATH}/${this.buildId}/_buildManifest.js`

    assets[`static/${this.buildId}/_fontManifest.js`] = new sources.RawSource(
      `self.__FONT_MANIFEST =${devalue(
        manifest
      )};self.__FONT_MANIFEST_CB && self.__FONT_MANIFEST_CB()`
      // `self.__BUILD_MANIFEST = ${generateClientManifest(
      //   compiler,
      //   compilation,
      //   assetMap,
      //   this.rewrites
      // )};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()`
    )
  }

  apply(compiler: webpack.Compiler): void {
    compiler.hooks.make.tap('NextFontPlugin', (compilation) => {
      // @ts-ignore TODO: Remove ignore when webpack 5 is stable
      compilation.hooks.processAssets.tap(
        {
          name: 'NextFontPlugin',
          // @ts-ignore TODO: Remove ignore when webpack 5 is stable
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets: any) => {
          this.createAssets(compilation, assets)
        }
      )
    })
  }
}
