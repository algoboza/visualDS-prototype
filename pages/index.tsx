import Head from "next/head";
import { useRouter } from "next/router";
import { VFC } from "react";
import styles from "../styles/Home.module.css";

export default (function Home() {
    const router = useRouter();

    const clickPage = (href: string) => (e) => {
        e.preventDefault();
        router.push(href);
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>Visual DS</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1>Visual DS</h1>
                <h2>D3.js</h2>
                <div>
                    <a href="stack" onClick={clickPage("d3/stack")}>
                        StackD3
                    </a>
                </div>
                <h2>SVG.js</h2>
                <div>
                    <a href="stack" onClick={clickPage("svgjs/stack")}>
                        StackSVG
                    </a>
                </div>
            </main>

            <footer className={styles.footer}></footer>
        </div>
    );
});
