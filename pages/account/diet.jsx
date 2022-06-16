import { getAccountLayout } from "../../components/layouts/AccountLayout";
import { useUser } from "../../context/user-context";
import Head from "next/head";

export default function Workouts() {
  const { user } = useUser();
  return (
    <>
      <Head>
        <title>Diet - Repsetter</title>
      </Head>
      <div className="space-y-6 bg-white px-4 pb-2 pt-6 sm:px-6 sm:pt-6">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">Diet</h3>
          <p className="mt-1 text-sm text-gray-500">Stuff</p>
        </div>
      </div>
    </>
  );
}

Workouts.getLayout = getAccountLayout;
