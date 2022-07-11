import path from 'path'
import fs from 'fs/promises'
import fetch from 'node-fetch'

async function getFonts() {
  const fonts = (
    await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=${process.env.GOOGLE_FONTS_API_KEY}`
    ).then((r) => r.json())
  ).items.slice(0, 20)
  await Promise.all(
    fonts.map(async (font) => {
      const id = font.family.replaceAll(' ', '-').toLowerCase()

      const files = Object.keys(font.files).map((file) => {
        if (file === 'regular') return '400.js'
        if (file === 'italic') return '400-italic.js'
        if (file.length > 3) return `${file.slice(0, 3)}-${file.slice(3)}.js`
        return `${file}.js`
      })

      const fontDir = path.join(process.cwd(), `packages/next/font/${id}`)

      // Ensure font dir
      const dirExists = await fs
        .access(fontDir)
        .then(() => true)
        .catch(() => false)
      if (!dirExists) {
        await fs.mkdir(fontDir) // KÖRS EN GÅNG FÖR VARJE VARIANT = BAD
      }

      await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(fontDir, file)
          await fs.writeFile(filePath, font.family.replaceAll(' ', '+'))
        })
      )
    })
  )
}

getFonts().catch((e) => {
  console.error(e)
  process.exit(1)
})
