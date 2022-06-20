import AccountCalendarLayout from "../../components/layouts/AccountCalendarLayout";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import Head from "next/head";

export default function Pictures() {
  return (
    <>
      <Head>
        <title>Pictures - Repsetter</title>
      </Head>
      <AccountCalendarLayout>Hello!</AccountCalendarLayout>
    </>
  );
}

Pictures.getLayout = getAccountLayout;
