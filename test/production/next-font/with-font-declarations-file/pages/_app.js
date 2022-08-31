import { openSans } from '../fonts'

function MyApp({ Component, pageProps }) {
  return (
    <div className={openSans.variables}>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
