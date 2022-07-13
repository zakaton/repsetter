import Head from "next/head";
import Header from "../Header";
import Footer from "../Footer";

import { useOnline } from "../../context/online-context";
import OfflineBanner from "../OfflineBanner";
import DeleteAccountNotification from "../account/notification/DeleteAccountNotification";

export default function Layout({ children }) {
  const { online } = useOnline();
  return (
    <>
      <Head>
        <title>Repsetter</title>
      </Head>
      <Header />
      {!online && <OfflineBanner />}
      <DeleteAccountNotification />
      <main className="relative mx-auto py-4 px-4">{children}</main>
      <Footer />
    </>
  );
}
