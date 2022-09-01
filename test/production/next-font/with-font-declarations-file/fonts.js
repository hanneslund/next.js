import {
  Open_Sans,
  Source_Code_Pro,
  Abel,
  Inter,
  Roboto,
} from '@next/font/google'

const openSans = Open_Sans()
const sourceCodePro = Source_Code_Pro({ display: 'swap' })
const abel = Abel({ variant: '400', display: 'optional', preload: false })

const inter = Inter({ display: 'block', preload: true })
const roboto = Roboto({ variant: '400' })

export { openSans, sourceCodePro, abel, inter, roboto }
