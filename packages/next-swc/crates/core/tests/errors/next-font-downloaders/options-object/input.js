import { ABeeZee } from '@next/google-fonts'

fn({ ['variant']: '400' })
ABeeZee({ ['variant']: '400' })
const a = fn({ 10: 'hello' })
const a = ABeeZee({ 10: 'hello' })

fn({ variant: [...[], 'hello'] })
ABeeZee({ variant: [...[], 'hello'] })
const a = fn({ variant: [...[], 'hello'] })
const a = ABeeZee({ variant: [...[], 'hello'] })

fn({ variant: [function () {}] })
ABeeZee({ variant: [function () {}] })
const a = fn({ variant: [i1] })
const a = ABeeZee({ variant: [i1] })

fn({ variant: [, ''] })
ABeeZee({ variant: [, ''] })
const a = fn({ variant: [, ''] })
const a = ABeeZee({ variant: [, ''] })

fn({ variant: i1 })
ABeeZee({ variant: i1 })
const a = fn({ variant: () => {} })
const a = ABeeZee({ variant: () => {} })

fn({ variant() {} })
ABeeZee({ variant() {} })
const a = fn({ variant() {} })
const a = ABeeZee({ variant() {} })

fn({ ...{} })
ABeeZee({ ...{} })
const a = fn({ ...{} })
const a = ABeeZee({ ...{} })
