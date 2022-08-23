import { ABeeZee } from '@next/google-fonts'

const a = fn({ 10: 'hello' })
const a = ABeeZee({ 10: 'hello' })

const a = fn({ variant: [...[], 'hello'] })
const a = ABeeZee({ variant: [...[], 'hello'] })

const a = fn({ variant: [i1] })
const a = ABeeZee({ variant: [i1] })

const a = fn({ variant: [, ''] })
const a = ABeeZee({ variant: [, ''] })

const a = fn({ variant: () => {} })
const a = ABeeZee({ variant: () => {} })

const a = fn({ variant() {} })
const a = ABeeZee({ variant() {} })

const a = fn({ ...{} })
const a = ABeeZee({ ...{} })
