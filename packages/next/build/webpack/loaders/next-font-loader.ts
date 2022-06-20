import postcss from 'postcss'
import loaderUtils from 'next/dist/compiled/loader-utils3'
import path from 'path'
import { readFileSync } from 'fs'

export default async function nextFontLoader(src: string) {
  const callback = this.async()

  // const fileContent = await promises.readFile(fontsFile, 'utf8')
  let css = src
  // if (src.includes('@import')) {
  //   const res = /@import url\((.*)\)/.exec(src)
  //   let url = res?.[1]
  //   if (!url) throw new Error('AAHH')
  //   if (url[0] === "'") {
  //     url = url.slice(1, -1)
  //   }
  //   // validate url
  //   css = await fetch(url).then((res) => res.text())
  // }

  console.log('css', css)
  const after = (
    await postcss([nextFontPlugin(this)]).process(css, {
      // from: fontsFile,
    })
  ).css

  callback(null, after)
}

function nextFontPlugin(loaderCtx) {
  return {
    postcssPlugin: 'NEXT-FONT-LOADER-POSTCSS-PLUGIN',
    async Once(root: any) {
      for (const node of root.nodes) {
        if (node.type === 'comment') continue
        if (node.type !== 'atrule' || node.name !== 'font-face') {
          throw new Error('Expected @font-face')
        }

        for (const decl of node.nodes) {
          if (decl.type === 'comment') continue
          if (decl.type !== 'decl') throw new Error('Expected decl')

          //   if (decl.prop === 'font-family') {
          //     family = decl.value.slice(1, -1)
          //   }

          if (decl.prop === 'src') {
            let declUrl = decl.value.split('url(')[1]
            declUrl = declUrl.slice(0, declUrl.indexOf(')'))
            let data
            if (declUrl.startsWith('https://')) {
              data = await fetch(declUrl).then((res) => res.text())
            } else {
              const fontFilePath = path.join(
                loaderCtx.resourcePath,
                '..',
                declUrl
              )
              data = readFileSync(fontFilePath)
              // data
            }

            const interpolatedName = loaderUtils.interpolateName(
              { resourcePath: declUrl.split('/').at(-1) },
              '/static/fonts/[contenthash].[ext]',
              { content: data }
            )

            loaderCtx.emitFile(interpolatedName, data)
            decl.value = decl.value.replace(
              declUrl,
              `/_next${interpolatedName}`
            )

            // // decl.value = decl.value.replace(declUrl, `/_next${interpolatedName}`)
            // files.set(
            //   interpolatedName,
            //   new sources.RawSource(fontFileData as any)
            // )

            // if (fontz[fontsFile]) {
            //   fontz[fontsFile].push(`/_next${interpolatedName}`)
            // } else {
            //   fontz[fontsFile] = [`/_next${interpolatedName}`]
            // }
            // srcPath = `/_next${interpolatedName}`
            // decl.value = decl.value.replace(declUrl, srcPath)
          }

          //   if (family && srcPath) {
          //     fontData[family] = {
          //       path: srcPath,
          //     }
          //   }
        }

        // let srcPath: string | undefined
        // let family: string | undefined
        // node.nodes.forEach((decl: any) => {
        //   if (decl.type === 'comment') return
        //   if (decl.type !== 'decl') throw new Error('Expected decl')

        //   if (decl.prop === 'font-family') {
        //     family = decl.value.slice(1, -1)
        //   }

        //   if (decl.prop === 'src') {
        //     let declUrl = decl.value.split('url(')[1]
        //     declUrl = declUrl.slice(0, declUrl.indexOf(')'))

        //     const fontFilePath = path.join(fontsFile, '..', declUrl)
        //     const fontFileData = readFileSync(fontFilePath)

        //     const interpolatedName = loaderUtils.interpolateName(
        //       { resourcePath: fontFilePath },
        //       '/static/fonts/[name].[hash:8].[ext]',
        //       // '/static/fonts/[name].[contenthash].[ext]',
        //       { content: fontFileData }
        //     )

        //     // decl.value = decl.value.replace(declUrl, `/_next${interpolatedName}`)
        //     files.set(
        //       interpolatedName,
        //       new sources.RawSource(fontFileData as any)
        //     )

        //     if (fontz[fontsFile]) {
        //       fontz[fontsFile].push(`/_next${interpolatedName}`)
        //     } else {
        //       fontz[fontsFile] = [`/_next${interpolatedName}`]
        //     }
        //     srcPath = `/_next${interpolatedName}`
        //     decl.value = decl.value.replace(declUrl, srcPath)
        //   }
        // })

        //   if (family && srcPath) {
        //     fontData[family] = {
        //       path: srcPath,
        //     }
        //   }
      }
    },
  }
}
