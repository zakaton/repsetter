/* eslint-disable no-param-reassign */
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import Subscription from "../../components/subscription/Subscription";

export default function SubscriptionPage() {
  const router = useRouter();
  const { id } = router.query;

  const [coachEmail, setCoachEmail] = useState(null);

  return (
    <>
      <Head>
        {coachEmail ? (
          <title>{coachEmail}&apos;s Coaching Subscription - Repsetter</title>
        ) : (
          <title>Coaching Subscription - Repsetter</title>
        )}
      </Head>
      <Subscription subscriptionId={id} setCoachEmail={setCoachEmail} />
    </>
  );
}
