import styles from '../styles/Home.module.css'

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
                <img className={styles.image} src="./cryptodevs/0.svg" />
            </div>
        </div>
    )
}

export default Main