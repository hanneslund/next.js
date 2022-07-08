import postcss from 'postcss'
import crypto from 'crypto'

export default async function nextFontLoader(this: any, src: string) {
  const callback = this.async()
  this.cacheable(false) // TODO

  const res = await postcss([nextFontPlugin(getHash('src'))]).process(src, {
    from: undefined,
  })
  const family = res.messages[0]
  const css = `${res.css}
.className{font-family:${family};}
.__FONT_FAMILY__${family.slice(1, family.length - 1)}{}`

  callback(null, css)
}

const processed = Symbol('processed')
function nextFontPlugin(hash: string) {
  return {
    postcssPlugin: 'NEXT-FONT-LOADER-POSTCSS-PLUGIN',
    Declaration(decl: any, { result }: any) {
      if (!decl[processed] && decl.prop === 'font-family') {
        decl[processed] = true
        let family = decl.value
          .slice(1, decl.value.length - 1)
          .toLowerCase()
          .replaceAll(' ', '-')
        family = `'${family}-${hash}'`
        result.messages.push(family) // Hur blir det om det är många @font-faces vid unicodes? if length !push
        decl.value = family
      }
    },
  }
}

function getHash(source: string | Buffer): string {
  return crypto
    .createHash('shake256', { outputLength: 5 })
    .update(source)
    .digest('hex')
}
