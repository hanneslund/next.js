import React from 'react'
import { Fira_Code, Inter } from '@next/google-fonts'

const firaCode = Fira_Code({
  variant: '400',
  fallback: ['system-ui'],
})

const inter = Inter({
  variant: '900',
  display: 'swap',
})

console.log(firaCode, inter)
