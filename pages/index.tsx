import Head from "next/head";
import { VFC } from "react";
import styles from "../styles/Home.module.css";

export default (function Home() {
    return (
        <div className={styles.container}>
            <Head>
                <title>Visual DS</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>Visual DS</main>

            <footer className={styles.footer}></footer>
        </div>
    );
} as VFC);
