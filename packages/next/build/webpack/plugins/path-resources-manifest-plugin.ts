import { webpack, sources } from 'next/dist/compiled/webpack/webpack'
import getRouteFromEntrypoint from '../../../server/get-route-from-entrypoint'

export default class PathResourcesManifestPlugin {
  createAssets(compiler: any, compilation: any, assets: any) {
    // const compilationSpan = spans.get(compilation) || spans.get(compiler)
    // const createAssetsSpan = compilationSpan?.traceChild(
    //   'NextJsBuildManifest-createassets'
    // )
    // return createAssetsSpan?.traceAsyncFn(async () => {
    const entrypoints: Map<string, any> = compilation.entrypoints
    const pathResourceManfifest: any = {}

    for (const entrypoint of entrypoints.values()) {
      const pagePath = getRouteFromEntrypoint(entrypoint.name, true)

      if (!pagePath) {
        continue
      }
      if (pagePath === '/_app' || pagePath === '/_error') {
        continue
      }

      const files = entrypoint.chunks.flatMap((chunk: any) => [
        ...chunk.auxiliaryFiles,
      ])
      // console.log(pagePath, files)
      if (files) {
        pathResourceManfifest[pagePath] = files
      }
    }

    assets['path-resources-manifest.json'] = new sources.RawSource(
      JSON.stringify(pathResourceManfifest, null, 2)
    )
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.make.tap('NextJsBuildManifest', (compilation) => {
      // @ts-ignore TODO: Remove ignore when webpack 5 is stable
      compilation.hooks.processAssets.tap(
        {
          name: 'PathResourcesManifestPlugin',
          // @ts-ignore TODO: Remove ignore when webpack 5 is stable
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets: any) => this.createAssets(compiler, compilation, assets)
      )
    })
    return
  }
}
