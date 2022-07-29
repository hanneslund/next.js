import openSans from '../fonts/open-sans.font.css'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <div id="app-open-sans" className={openSans.className}>
        {JSON.stringify(openSans)}
      </div>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
