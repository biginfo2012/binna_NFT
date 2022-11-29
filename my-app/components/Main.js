import styles from '../styles/Home.module.css'
import Image from 'next/image'

const Main = ({renderButton, tokenIdsMinted}) => {
    return (
        <div className={styles.main}>
            <div>
                <h1 className={styles.title}>Welcome to Binna Devs!</h1>

                <div className={styles.description}>
                    Its an NFT collection for developers in Crypto.
                </div>
                
                <div className={styles.description}>
                    {tokenIdsMinted}/20 have been minted
                </div>
                
                {renderButton()}
            </div>
            
            <div>
                <Image className={styles.image} src="./0.svg" alt='NFT'/>
            </div>
        </div>
    )
}

export default Main