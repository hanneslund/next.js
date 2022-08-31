import { openSans, sourceCodePro, abel } from '../fonts'

function MyApp({ Component, pageProps }) {
  return (
    <div className={openSans.variables}>
      <div className={sourceCodePro.variables}>
        <div style={abel.style}>
          <Component {...pageProps} />
        </div>
      </div>
    </div>
  )
}

export default MyApp
