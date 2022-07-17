import openSans from '../fonts/open-sans.module.css'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <pre className={openSans.fontClass}>
        {JSON.stringify(openSans, null, 2)}
      </pre>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
