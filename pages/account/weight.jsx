import AccountCalendarLayout from "../../components/layouts/AccountCalendarLayout";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import Head from "next/head";

export default function Weight() {
  return (
    <>
      <Head>
        <title>Weight - Repsetter</title>
      </Head>
      <AccountCalendarLayout>Hello!</AccountCalendarLayout>
    </>
  );
}

Weight.getLayout = getAccountLayout;
