/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
import CssSyntaxError from './CssSyntaxError'
import Warning from '../../postcss-loader/src/Warning'
import { stringifyRequest } from '../../../stringify-request'

const moduleRegExp = /\.module\.\w+$/i

function getModulesOptions(rawOptions, loaderContext) {
  const { resourcePath } = loaderContext

  if (typeof rawOptions.modules === 'undefined') {
    const isModules = moduleRegExp.test(resourcePath)

    if (!isModules) {
      return false
    }
  } else if (
    typeof rawOptions.modules === 'boolean' &&
    rawOptions.modules === false
  ) {
    return false
  }

  let modulesOptions = {
    compileType: rawOptions.icss ? 'icss' : 'module',
    auto: true,
    mode: 'local',
    exportGlobals: false,
    localIdentName: '[hash:base64]',
    localIdentContext: loaderContext.rootContext,
    localIdentHashPrefix: '',
    // eslint-disable-next-line no-undefined
    localIdentRegExp: undefined,
    namedExport: false,
    exportLocalsConvention: 'asIs',
    exportOnlyLocals: false,
  }

  if (
    typeof rawOptions.modules === 'boolean' ||
    typeof rawOptions.modules === 'string'
  ) {
    modulesOptions.mode =
      typeof rawOptions.modules === 'string' ? rawOptions.modules : 'local'
  } else {
    if (rawOptions.modules) {
      if (typeof rawOptions.modules.auto === 'boolean') {
        const isModules =
          rawOptions.modules.auto && moduleRegExp.test(resourcePath)

        if (!isModules) {
          return false
        }
      } else if (rawOptions.modules.auto instanceof RegExp) {
        const isModules = rawOptions.modules.auto.test(resourcePath)

        if (!isModules) {
          return false
        }
      } else if (typeof rawOptions.modules.auto === 'function') {
        const isModule = rawOptions.modules.auto(resourcePath)

        if (!isModule) {
          return false
        }
      }

      if (
        rawOptions.modules.namedExport === true &&
        typeof rawOptions.modules.exportLocalsConvention === 'undefined'
      ) {
        modulesOptions.exportLocalsConvention = 'camelCaseOnly'
      }
    }

    modulesOptions = { ...modulesOptions, ...(rawOptions.modules || {}) }
  }

  if (typeof modulesOptions.mode === 'function') {
    modulesOptions.mode = modulesOptions.mode(loaderContext.resourcePath)
  }

  if (modulesOptions.namedExport === true) {
    if (rawOptions.esModule === false) {
      throw new Error(
        'The "modules.namedExport" option requires the "esModules" option to be enabled'
      )
    }

    if (modulesOptions.exportLocalsConvention !== 'camelCaseOnly') {
      throw new Error(
        'The "modules.namedExport" option requires the "modules.exportLocalsConvention" option to be "camelCaseOnly"'
      )
    }
  }

  return modulesOptions
}

function normalizeOptions(rawOptions, loaderContext) {
  if (rawOptions.icss) {
    loaderContext.emitWarning(
      new Error(
        'The "icss" option is deprecated, use "modules.compileType: "icss"" instead'
      )
    )
  }

  const modulesOptions = getModulesOptions(rawOptions, loaderContext)

  return {
    url: typeof rawOptions.url === 'undefined' ? true : rawOptions.url,
    import: typeof rawOptions.import === 'undefined' ? true : rawOptions.import,
    modules: modulesOptions,
    // TODO remove in the next major release
    icss: typeof rawOptions.icss === 'undefined' ? false : rawOptions.icss,
    sourceMap:
      typeof rawOptions.sourceMap === 'boolean'
        ? rawOptions.sourceMap
        : loaderContext.sourceMap,
    importLoaders:
      typeof rawOptions.importLoaders === 'string'
        ? parseInt(rawOptions.importLoaders, 10)
        : rawOptions.importLoaders,
    esModule:
      typeof rawOptions.esModule === 'undefined' ? true : rawOptions.esModule,
    fontModule: rawOptions.fontModule,
    fallbackFonts: rawOptions.fallbackFonts,
  }
}

export default async function loader(content, map, meta) {
  const rawOptions = this.getOptions()

  const plugins = []
  const callback = this.async()

  const loaderSpan = this.currentTraceSpan.traceChild('css-loader')

  loaderSpan
    .traceAsyncFn(async () => {
      let options

      try {
        options = normalizeOptions(rawOptions, this)
      } catch (error) {
        throw error
      }

      const { postcss } = await rawOptions.postcss()

      const {
        shouldUseModulesPlugins,
        shouldUseImportPlugin,
        shouldUseURLPlugin,
        shouldUseIcssPlugin,
        getPreRequester,
        getExportCode,
        getFilter,
        getImportCode,
        getModuleCode,
        getModulesPlugins,
        normalizeSourceMap,
        sort,
      } = require('./utils')

      const {
        icssParser,
        importParser,
        urlParser,
        fontModules,
      } = require('./plugins')

      const replacements = []
      const exports = []
      const fontModuleExports = []

      if (options.fontModule) {
        plugins.push(fontModules(fontModuleExports, meta.fallback))
      }

      if (shouldUseModulesPlugins(options)) {
        plugins.push(...getModulesPlugins(options, this))
      }

      const importPluginImports = []
      const importPluginApi = []

      if (shouldUseImportPlugin(options)) {
        const resolver = this.getResolve({
          conditionNames: ['style'],
          extensions: ['.css'],
          mainFields: ['css', 'style', 'main', '...'],
          mainFiles: ['index', '...'],
          restrictions: [/\.css$/i],
        })

        plugins.push(
          importParser({
            imports: importPluginImports,
            api: importPluginApi,
            context: this.context,
            rootContext: this.rootContext,
            filter: getFilter(options.import, this.resourcePath),
            resolver,
            urlHandler: (url) =>
              stringifyRequest(
                this,
                getPreRequester(this)(options.importLoaders) + url
              ),
          })
        )
      }

      const urlPluginImports = []

      if (shouldUseURLPlugin(options)) {
        const urlResolver = this.getResolve({
          conditionNames: ['asset'],
          mainFields: ['asset'],
          mainFiles: [],
          extensions: [],
        })

        plugins.push(
          urlParser({
            imports: urlPluginImports,
            replacements,
            context: this.context,
            rootContext: this.rootContext,
            filter: getFilter(options.url, this.resourcePath),
            resolver: urlResolver,
            urlHandler: (url) => stringifyRequest(this, url),
          })
        )
      }

      const icssPluginImports = []
      const icssPluginApi = []

      if (shouldUseIcssPlugin(options)) {
        const icssResolver = this.getResolve({
          conditionNames: ['style'],
          extensions: [],
          mainFields: ['css', 'style', 'main', '...'],
          mainFiles: ['index', '...'],
        })

        plugins.push(
          icssParser({
            imports: icssPluginImports,
            api: icssPluginApi,
            replacements,
            exports,
            context: this.context,
            rootContext: this.rootContext,
            resolver: icssResolver,
            urlHandler: (url) =>
              stringifyRequest(
                this,
                getPreRequester(this)(options.importLoaders) + url
              ),
          })
        )
      }

      // Reuse CSS AST (PostCSS AST e.g 'postcss-loader') to avoid reparsing
      if (meta) {
        const { ast } = meta

        if (ast && ast.type === 'postcss') {
          // eslint-disable-next-line no-param-reassign
          content = ast.root
          loaderSpan.setAttribute('astUsed', 'true')
        }
      }

      const { resourcePath } = this

      let result

      try {
        result = await postcss(plugins).process(content, {
          from: resourcePath,
          to: resourcePath,
          map: options.sourceMap
            ? {
                prev: map ? normalizeSourceMap(map, resourcePath) : null,
                inline: false,
                annotation: false,
              }
            : false,
        })
      } catch (error) {
        if (error.file) {
          this.addDependency(error.file)
        }

        throw error.name === 'CssSyntaxError'
          ? new CssSyntaxError(error)
          : error
      }

      for (const warning of result.warnings()) {
        this.emitWarning(new Warning(warning))
      }

      const imports = []
        .concat(icssPluginImports.sort(sort))
        .concat(importPluginImports.sort(sort))
        .concat(urlPluginImports.sort(sort))
      const api = []
        .concat(importPluginApi.sort(sort))
        .concat(icssPluginApi.sort(sort))

      if (options.modules.exportOnlyLocals !== true) {
        imports.unshift({
          importName: '___CSS_LOADER_API_IMPORT___',
          url: stringifyRequest(this, require.resolve('./runtime/api')),
        })
      }

      const importCode = getImportCode(imports, options)
      const moduleCode = getModuleCode(result, api, replacements, options, this)
      const exportCode = getExportCode(
        [...exports, ...fontModuleExports],
        replacements,
        options
      )

      return `${importCode}${moduleCode}${exportCode}`
    })
    .then(
      (code) => {
        callback(null, code)
      },
      (err) => {
        callback(err)
      }
    )
}
