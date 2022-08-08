import interSwap from '../fonts/inter-swap.font.css'
import interOptional from '../fonts/inter-optional.font.css'

export default function SameFontFileOptionalSecond() {
  return (
    <>
      <p className={interSwap.className}>Swap first</p>
      <p className={interOptional.className}>Optional second</p>
    </>
  )
}
