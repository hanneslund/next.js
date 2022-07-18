import styles from './styles.module.css'

export default function WithoutFonts() {
  return <div id="css-module-without-font-face">{JSON.stringify(styles)}</div>
}
