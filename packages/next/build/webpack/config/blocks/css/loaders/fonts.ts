import { webpack } from 'next/dist/compiled/webpack/webpack'
import { ConfigurationContext } from '../../../utils'
import { getClientStyleLoader } from './client'
import { cssFileResolve } from './file-resolve'
import { getCssModuleLocalIdent } from './getCssModuleLocalIdent'
import crypto from 'crypto'

export function getFontModuleLoader(
  ctx: ConfigurationContext,
  postcss: any,
  fontDownloader?: string
): webpack.RuleSetUseItem[] {
  const loaders: webpack.RuleSetUseItem[] = []

  if (ctx.isClient) {
    // Add appropriate development more or production mode style
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
      importLoaders: !!fontDownloader ? 1 : 0,
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
        // Generate a friendly production-ready name so it's
        // reasonably understandable. The same name is used for
        // development.
        // TODO: Consider making production reduce this to a single
        // character?
        getLocalIdent: fontDownloader
          ? (context: any) =>
              'c' +
              crypto
                .createHash('shake256', { outputLength: 5 })
                .update(context.resourceQuery)
                .digest('hex')
          : getCssModuleLocalIdent,
      },
      fontModule: ctx.experimental.fontModules,
    },
  })

  if (fontDownloader) {
    loaders.push({
      loader: 'next-font-downloader-loader',
    })
  }

  return loaders
}
