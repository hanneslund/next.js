import interOptional from '../fonts/inter-optional.font.css'
import interSwap from '../fonts/inter-swap.font.css'

export default function SameFontFileOptionalFirst() {
  return (
    <>
      <p className={interOptional.className}>Optional first</p>
      <p className={interSwap.className}>Swap second</p>
    </>
  )
}
