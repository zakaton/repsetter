import AccountCalendarLayout from "../../components/layouts/AccountCalendarLayout";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import Head from "next/head";

export default function Diet() {
  return (
    <>
      <Head>
        <title>Diet - Repsetter</title>
      </Head>
      <AccountCalendarLayout>Hello!</AccountCalendarLayout>
    </>
  );
}

Diet.getLayout = getAccountLayout;
