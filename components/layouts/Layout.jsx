import Head from 'next/head';

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Repsetter</title>
      </Head>
      {children}
    </>
  );
}
