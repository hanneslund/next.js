import loaderUtils from 'next/dist/compiled/loader-utils3'
import { webpack } from 'next/dist/compiled/webpack/webpack'
import { ConfigurationContext } from '../../../utils'
import { getClientStyleLoader } from './client'
import { cssFileResolve } from './file-resolve'

export function getFontLoader(
  ctx: ConfigurationContext,
  postcss: any
): webpack.RuleSetUseItem[] {
  const loaders: webpack.RuleSetUseItem[] = []

  if (ctx.isClient) {
    // Add appropriate development mode or production mode style
    // loader
    loaders.push(
      getClientStyleLoader({
        isAppDir: !!ctx.experimental.appDir,
        isDevelopment: ctx.isDevelopment,
        assetPrefix: ctx.assetPrefix,
      })
    )
  }

  // Resolve CSS `@import`s and `url()`s
  loaders.push({
    loader: require.resolve('../../../../loaders/css-loader/src'),
    options: {
      postcss,
      importLoaders: 1,
      // Use CJS mode for backwards compatibility:
      esModule: false,
      url: (url: string, resourcePath: string) =>
        cssFileResolve(url, resourcePath, ctx.experimental.urlImports),
      import: (url: string, _: any, resourcePath: string) =>
        cssFileResolve(url, resourcePath, ctx.experimental.urlImports),
      modules: {
        // Do not transform class names (CJS mode backwards compatibility):
        exportLocalsConvention: 'asIs',
        // Server-side (Node.js) rendering support:
        exportOnlyLocals: ctx.isServer,
        // Disallow global style exports so we can code-split CSS and
        // not worry about loading order.
        mode: 'pure',
        getLocalIdent: (context: any, _: any, exportName: string) => {
          const hash = loaderUtils.getHashDigest(
            Buffer.from(context.resourceQuery),
            'md5',
            'hex',
            5
          )

          return `__${exportName}_${hash}`
        },
      },
      fontLoader: true,
    },
  })

  loaders.push({
    loader: 'next-fontloader-loader',
    options: {
      isServer: ctx.isServer,
      assetPrefix: ctx.assetPrefix,
    },
  })

  return loaders
}
