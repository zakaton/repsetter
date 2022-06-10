/* eslint-disable no-param-reassign */
import Head from "next/head";
import MyLink from "../components/MyLink";

export default function Why() {
  return (
    <>
      <Head>
        <title>Why - {process.env.NEXT_PUBLIC_URL_TITLE}</title>
      </Head>
      Why?
    </>
  );
}
