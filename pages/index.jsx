import Head from "next/head";
import {
  ScaleIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  TagIcon,
  HeartIcon,
  FireIcon,
} from "@heroicons/react/outline";

const clientFeatures = [
  {
    name: "Custom Subscription Pricing",
    description:
      "Set your own prices for each client, charging more for your more demanding clients.",
    icon: CurrencyDollarIcon,
  },
  {
    name: "Automatic Billing",
    description:
      "Clients get charged automatically every month for your coaching.",
    icon: CreditCardIcon,
  },
  {
    name: "5% Flat Rate",
    description:
      "We take 5% of Coaching Subscription payments to keep this website running.",
    icon: TagIcon,
  },
];
const coachingFeatures = [
  {
    name: "Plan, Track, and Monitor Workouts",
    description:
      "Plan workouts ahead of time, and track your performance as you do them. Check how well your clients perform and update the programs as needed.",
    icon: FireIcon,
  },
  {
    name: "Design Meal Plans",
    description:
      "Set meal plans for clients, monitoring their nutritional intake and how well it correlates with performance in the gym.",
    icon: HeartIcon,
  },
  {
    name: "Share Weight and Progress Pics",
    description:
      "Track weight fluctuations as you build muscle or burn fat, sharing progress pictures along the way for comparison.",
    icon: ScaleIcon,
  },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Repsetter</title>
      </Head>
      <div className="mx-auto mt-2 overflow-hidden px-4 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Made for Personal Trainers
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            A simple workout website that simply works
          </p>
        </div>

        <div className="relative mt-12 lg:grid lg:grid-cols-2 lg:items-center lg:gap-8">
          <div className="relative">
            <h3 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Easy Client Management
            </h3>
            <p className="mt-3 text-lg text-gray-500">
              We streamline the process so you can easily add clients, collect
              subscription payments, and sync workouts so you can focus on
              optimizing your clients&apos; progress.
            </p>

            <dl className="mt-10 space-y-10">
              {clientFeatures.map((item) => (
                <div key={item.name} className="relative">
                  <dt>
                    <div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                      <item.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-lg font-medium leading-6 text-gray-900">
                      {item.name}
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    {item.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative -mx-4 mt-10 lg:mt-0" aria-hidden="true">
            <img
              className="relative mx-auto overflow-hidden rounded-md"
              width={490}
              src="https://tailwindui.com/img/features/feature-example-1.png"
              alt=""
            />
          </div>
        </div>

        <div className="relative mt-12 sm:mt-16 lg:mt-24">
          <div className="lg:grid lg:grid-flow-row-dense lg:grid-cols-2 lg:items-center lg:gap-8">
            <div className="lg:col-start-2">
              <h3 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                Track your Clients&apos; Progress
              </h3>
              <p className="mt-3 text-lg text-gray-500">
                Plan workouts for your clients, allowing them to give feedback
                on how well they went so you can update their programming.
              </p>

              <dl className="mt-10 space-y-10">
                {coachingFeatures.map((item) => (
                  <div key={item.name} className="relative">
                    <dt>
                      <div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                        <item.icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <p className="ml-16 text-lg font-medium leading-6 text-gray-900">
                        {item.name}
                      </p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-500">
                      {item.description}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative -mx-4 mt-10 lg:col-start-1 lg:mt-0">
              <img
                className="relative mx-auto"
                width={490}
                src="https://tailwindui.com/img/features/feature-example-2.png"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
