import { webpack } from 'next/dist/compiled/webpack/webpack'
import { ConfigurationContext } from '../../../utils'
import { getClientStyleLoader } from './client'
import { cssFileResolve } from './file-resolve'
import { getCssModuleLocalIdent } from './getCssModuleLocalIdent'

export function getFontModuleLoader(
  ctx: ConfigurationContext,
  postcss: any,
  isMetadata: boolean
): webpack.RuleSetUseItem[] {
  const loaders: webpack.RuleSetUseItem[] = []

  if (ctx.isClient) {
    // Add appropriate development more or production mode style
    // loader
    loaders.push({
      loader: 'next-style-loader', // om mini-css-extract måste man kolla .css i files istället för fontfilerna
      options: {
        attributes: {
          'data-isfont': '',
        },
      },
    })
    // loaders.push(
    //   getClientStyleLoader({
    //     isDevelopment: ctx.isDevelopment,
    //     assetPrefix: ctx.assetPrefix,
    //     isFontFace: true,
    //   })
    // )
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
        // mode: 'pure',
        mode: 'pure',
        // Generate a friendly production-ready name so it's
        // reasonably understandable. The same name is used for
        // development.
        // TODO: Consider making production reduce this to a single
        // character?
        getLocalIdent: getCssModuleLocalIdent,
      },
    },
  })

  if (isMetadata) {
    loaders.push({
      loader: 'next-font-metadata-loader',
    })
  }

  return loaders
}
