import styles from '../styles/Home.module.css'

import Footer from '../components/Footer'
import Main from '../components/Main'
import Meta from '../components/Meta'

export default function Home() {

  return (
    <div>
      <Meta />
      <Main tokenIdsMinted={tokenIdsMinted} renderButton={renderButton} />
      <Footer />
    </div>
  )
}
