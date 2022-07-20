import openSans from '../fonts/open-sans.module.css'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <div id="app-open-sans" className={openSans.fontClass}>
        {JSON.stringify(openSans)}
      </div>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
