'use client'

import styles from './footer.module.css'
import {Link} from '@primer/react'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Link href="/" muted inline suppressHydrationWarning>
        © 2025 englishfor.dev
      </Link>
      <Link href="/contato" inline>
        Contato
      </Link>
      <Link href="/termos-de-uso" inline>
        Termos de Uso
      </Link>
    </footer>
  )
}
