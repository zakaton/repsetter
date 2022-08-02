import Head from "next/head";
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  TagIcon,
  SearchIcon,
  VideoCameraIcon,
  ClipboardListIcon,
  ClipboardCheckIcon,
  ScaleIcon,
  ChartBarIcon,
  TrendingUpIcon,
} from "@heroicons/react/outline";

import Image from "next/image";
import screenshot_1 from "../public/features/screenshot_1.png";
import screenshot_2 from "../public/features/screenshot_2.png";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const features = [
  {
    title: "Plan and Log Exercises",
    description: "",
    media: (props) => (
      <div {...props}>
        <Image src={screenshot_1} alt="" />
      </div>
    ),
    list: [
      {
        title: "Search Exercises",
        description:
          "Search exercises by name or muscles used, accompanied by images and videos of each exercise",
        icon: SearchIcon,
      },
      {
        title: "Plan Exercises",
        description:
          "Specify weight, number of sets/reps, and other features like set/rest duration ahead of time",
        icon: ClipboardListIcon,
      },
      {
        title: "Log Exercises",
        description:
          "Specify when you did each exercise, how many sets/reps you actually did, as well as how difficult it was",
        icon: ClipboardCheckIcon,
      },
      {
        title: "Upload Sets",
        description:
          "Embed videos of your sets that you've uploaded to YouTube",
        icon: VideoCameraIcon,
      },
    ],
  },
  {
    title: "Track Bodyweight",
    description: "",
    media: (props) => (
      <div {...props}>
        <Image src={screenshot_2} alt="" />
      </div>
    ),
    list: [
      {
        title: "Add Multiple Weights a Day",
        description:
          "Set a single weight per day, or add multiple weights, adding timestamps and what the most recent weight change was due to (e.g. drinking water or bowel movements)",
        icon: ScaleIcon,
      },
      {
        title: "Visualize Bodyweight Fluctuations",
        description:
          "View your bodyweight fluctuate throughout the day you eat, drink, and use the restoom, as well as decline over time due to exhaling Carbon Dioxide",
        icon: TrendingUpIcon,
      },
    ],
  },
  {
    title: "Upload Progress Pictures",
    description: "",
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
  {
    title: "Monitor Progress",
    description: "",
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
  {
    title: "Coach Clients",
    description: "",
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
      <div className="mx-auto mt-2 px-4 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Made to Work
          </h2>
          <p className="mt-2 text-lg text-gray-500">
            A simple workout website that simply works
          </p>
        </div>

        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="relative mt-12 lg:grid lg:grid-flow-row-dense lg:grid-cols-5 lg:items-center lg:gap-10"
          >
            <div
              className={classNames(
                "lg:col-span-2",
                index % 2 ? "lg:col-start-4 lg:self-baseline" : ""
              )}
            >
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

            <div className="-mx-4 mt-10 lg:col-span-3 lg:mt-0">
              <feature.media className="flex overflow-hidden rounded-lg shadow-md"></feature.media>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
