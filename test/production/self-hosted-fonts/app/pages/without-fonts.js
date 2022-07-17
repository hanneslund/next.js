import styles from './styles.module.css'

export default function WithoutFonts() {
  return <pre>{JSON.stringify(styles, null, 2)}</pre>
}
