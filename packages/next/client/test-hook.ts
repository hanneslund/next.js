import { staticGenerationBailout } from './components/static-generation-bailout'

export function useTestHook() {
  staticGenerationBailout('test')
  return 'apa'
}
