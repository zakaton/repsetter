import AccountCalendarLayout from "../../components/layouts/AccountCalendarLayout";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import Head from "next/head";

export default function Workouts() {
  return (
    <>
      <Head>
        <title>Workouts - Repsetter</title>
      </Head>
      <AccountCalendarLayout>Hello!</AccountCalendarLayout>
    </>
  );
}

Workouts.getLayout = getAccountLayout;
