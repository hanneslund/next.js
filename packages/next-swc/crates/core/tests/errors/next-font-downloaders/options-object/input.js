import { ABeeZee } from '@next/google-fonts'

fn({ ['variant']: '400' })
ABeeZee({ ['variant']: '400' })
const i1 = fn({ 10: 'hello' })
const i2 = ABeeZee({ 10: 'hello' })

fn({ variant: [...[], 'hello'] })
ABeeZee({ variant: [...[], 'hello'] })
const i3 = fn({ variant: [...[], 'hello'] })
const i4 = ABeeZee({ variant: [...[], 'hello'] })
