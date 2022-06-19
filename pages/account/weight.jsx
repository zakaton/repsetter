import { getAccountCalendarLayout } from "../../components/layouts/AccountCalendarLayout";
import { useUser } from "../../context/user-context";
import Head from "next/head";

export default function Weight() {
  const { user } = useUser();
  return (
    <>
      <Head>
        <title>Weight - Repsetter</title>
      </Head>
      <div className="space-y-6 px-4 pb-2 pt-6 sm:px-6 sm:pt-6">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Weight
          </h3>
          <p className="mt-1 text-sm text-gray-500">Stuff</p>
        </div>
      </div>
    </>
  );
}

Weight.getLayout = getAccountCalendarLayout;
