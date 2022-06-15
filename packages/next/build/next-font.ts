type NextFontName = string
type NextFontData = {
  family: string
  // hash: string
  path: string
  // staticPath: string {assetPrefix/}_next/static/fonts/{file}
}

let fonts: { [name: NextFontName]: NextFontData } = {}

// const nextFontMap = new Map<NextFontName, NextFontData>()

export function setFontData(name: NextFontName, data: NextFontData) {
  fonts[name] = data
}

export function getFontData(name: NextFontName): NextFontData | undefined {
  return fonts[name]
}

export function getFonts(): typeof fonts {
  return fonts
}

let fontFaceCss = ''

export function setFontDeclarationCss(css: string) {
  fontFaceCss = css
}

export function getFontDeclarationCss(): string {
  return fontFaceCss
}
