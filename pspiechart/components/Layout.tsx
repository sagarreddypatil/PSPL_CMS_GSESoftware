import Head from "next/head";
import styles from "@/styles/Layout.module.scss";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <title>PSPieChart</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <main className={styles.main}>{children}</main>
    </>
  );
}
