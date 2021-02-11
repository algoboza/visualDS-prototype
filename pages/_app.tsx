import { AppProps } from "next/dist/next-server/lib/router/router";
import { ReactNode } from "react";
// import Link from "next/link";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps): ReactNode {
    return <Component {...pageProps} />;
}

export default MyApp;

// 전체 컴포넌트의 레이아웃
// 글로벌 css 추가
// 컴포넌트에 pageProps 인자들 주입

