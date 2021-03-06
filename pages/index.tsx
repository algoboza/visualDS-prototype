import { List, ListItem } from "@material-ui/core";
import Head from "next/head";
import { useRouter } from "next/router";
import { VFC } from "react";
import styles from "../styles/Home.module.css";

export default (function Home() {
    const router = useRouter(); // next Router 객체 

    const clickPage = (href: string) => (e) => {
        e.preventDefault();
        router.push(href); // Next routing using Event Handler 
    };

    return (
        <div className={styles.container}>
            <Head>  
                <title>Visual DS</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1>Visual DS</h1>
                <List>
                    <ListItem button onClick={clickPage("d3/stack")}>
                        Stack
                    </ListItem>
                    <ListItem button onClick={clickPage("d3/queue")}>
                        Queue
                    </ListItem>
                    <ListItem button onClick={clickPage("d3/graph")}>
                        Graph
                    </ListItem>
                </List>
            </main>

            <footer className={styles.footer}></footer>
        </div>
    );
} as VFC);
