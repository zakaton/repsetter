import Head from "next/head";

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - Repsetter</title>
      </Head>
      <div className="prose mx-auto max-w-prose text-lg">
        <h1>
          <span className="mt-2 block text-center text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl">
            Privacy Policy
          </span>
        </h1>
      </div>
      <div className="prose prose-lg prose-blue mx-auto mt-6 text-gray-500">
        <h3>User Data</h3>
        <p>
          We store the following data on{" "}
          <a href="https://supabase.com/" target="_blank" rel="noreferrer">
            Supabase&apos;s database
          </a>
          :
        </p>
        <ul>
          <li>
            Your email address so you can sign in, receive pledge receipts, as
            well as optionally receive coaching subscription updates (which is
            disabled by default, you&apos;d need to opt-in to receive emails)
          </li>
          <li>
            Your workout information, so you can view and edit your workouts, as
            well as allow coaches to view and plan your workout routines.
          </li>
          <li>
            Stripe customer information, so you can make payments to coaches
          </li>
          <li>
            Stripe account information, so you can receive payments from your
            clients
          </li>
        </ul>

        <p>
          We only use this information to make this site work, and we don&apos;t
          share it with any third parties.
        </p>

        <h3>Deleting your Account</h3>
        <p>
          When you delete your account we delete all of the information listed
          above as we perform the following:
        </p>
        <ul>
          <li>
            delete your user data stored in our database, including your email
          </li>
          <li>
            delete your stripe customer data (which stores card information for
            making payments)
          </li>
          <li>
            delete your stripe account data (which stores card/bank info for
            receiving payments)
          </li>
        </ul>
      </div>
    </>
  );
}
