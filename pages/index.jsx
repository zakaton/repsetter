import Head from "next/head";
import {
  ScaleIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  TagIcon,
  FireIcon,
  CameraIcon,
} from "@heroicons/react/outline";

import Image from "next/image";
import screenshot_1 from "../public/features/screenshot_1.png";
import screenshot_2 from "../public/features/screenshot_2.png";

const features = [
  {
    title: "Track your Progress",
    description: "Plan workouts, measure bodyweight, and add pictures",
    media: (props) => (
      <div {...props}>
        <Image src={screenshot_1} alt="" />
      </div>
    ),
    list: [
      {
        title: "Plan, Track, and Monitor Workouts",
        description:
          "Plan workouts ahead of time, and track your performance as you do them. Check how well your clients perform and update the programs as needed.",
        icon: FireIcon,
      },
      {
        title: "Post Progress Pics",
        description:
          "Post front, back, and side pictures each day, checking progress on each angle",
        icon: CameraIcon,
      },
      {
        title: "Log Weight",
        description:
          "Track weight fluctuations as you build muscle or burn fat",
        icon: ScaleIcon,
      },
    ],
  },

  {
    title: "Easy Client Management",
    description:
      "We streamline the process so you can easily add clients, collect subscription payments, and sync workouts so you can focus on optimizing your clients' progress.",
    media: (props) => (
      <div {...props}>
        <Image src={screenshot_2} alt="" />
      </div>
    ),
    list: [
      {
        title: "Custom Subscription Pricing",
        description:
          "Set your own prices for each client, charging more for your more demanding clients.",
        icon: CurrencyDollarIcon,
      },
      {
        title: "Automatic Billing",
        description:
          "Clients get charged automatically every month for your coaching.",
        icon: CreditCardIcon,
      },
      {
        title: "5% Flat Rate",
        description:
          "We take 5% of Coaching Subscription payments to keep this website running.",
        icon: TagIcon,
      },
    ],
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
          <p className="mt-3 text-lg text-gray-500">
            A simple workout website that simply works
          </p>
        </div>

        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="relative mt-12 lg:grid lg:grid-flow-row-dense lg:grid-cols-2 lg:items-center lg:gap-10"
          >
            <div className={index % 2 ? "lg:col-start-2 lg:self-baseline" : ""}>
              <h3 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                {feature.title}
              </h3>
              <p className="mt-3 text-lg text-gray-500">
                {feature.description}
              </p>

              <dl className="mt-10 space-y-10">
                {feature.list.map((item) => (
                  <div key={item.title} className="relative">
                    <dt>
                      <div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                        <item.icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <p className="ml-16 text-lg font-medium leading-6 text-gray-900">
                        {item.title}
                      </p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-500">
                      {item.description}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="-mx-4 mt-10 lg:mt-0">
              <feature.media className="flex overflow-hidden rounded-lg shadow-lg"></feature.media>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
