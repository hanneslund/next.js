import { createNext } from 'e2e-utils'
import { NextInstance } from 'test/lib/next-modes/base'
import { renderViaHTTP } from 'next-test-utils'

describe('font-face-in-css-error', () => {
  let next: NextInstance

  afterEach(() => next.destroy())

  test.each([true, false])(
    '@font-face in global css, selfHostFonts: %p',
    async (selfHostFonts) => {
      next = await createNext({
        files: {
          'pages/_app.js': `
        import './styles.css'

        function MyApp({ Component, pageProps }) {
          return <Component {...pageProps} />
        }

        export default MyApp
        `,

          'pages/styles.css': `
        @font-face {
          font-family: 'Inter';
          src: url(/Inter.woff);
        }
        `,

          'pages/index.js': `export default () => null`,
        },
        nextConfig: {
          experimental: {
            selfHostFonts,
          },
        },
      })

      const html = await renderViaHTTP(next.url, '/')
      if (selfHostFonts) {
        expect(html).toContain('Found @font-face declaration in CSS file')
      } else {
        expect(html).not.toContain('Found @font-face declaration in CSS file')
      }
    }
  )

  test.each([true, false])(
    '@font-face in module css, selfHostFonts: %p',
    async (selfHostFonts) => {
      next = await createNext({
        files: {
          'pages/index.js': `
          import './styles.module.css'
          
          export default () => null`,

          'pages/styles.module.css': `
          @font-face {
            font-family: 'Inter';
            src: url(/Inter.woff);
          }`,
        },
        nextConfig: {
          experimental: {
            selfHostFonts,
          },
        },
      })

      const html = await renderViaHTTP(next.url, '/')
      if (selfHostFonts) {
        expect(html).toContain('Found @font-face declaration in CSS file')
      } else {
        expect(html).not.toContain('Found @font-face declaration in CSS file')
      }
    }
  )
})
