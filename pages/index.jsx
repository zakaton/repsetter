import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>{process.env.NEXT_PUBLIC_URL_TITLE}</title>
      </Head>
      <h1>Repsetter</h1>
    </>
  );
}
