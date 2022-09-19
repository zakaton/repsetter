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
  TrendingDownIcon,
  CameraIcon,
  BookOpenIcon,
  CalendarIcon,
  PencilAltIcon,
  DeviceTabletIcon,
} from "@heroicons/react/outline";
import { TemplateIcon, UserGroupIcon } from "@heroicons/react/solid";

import Image from "next/image";
import screenshot_1 from "../public/features/screenshot_1.png";
import screenshot_2 from "../public/features/screenshot_2.png";
import screenshot_3 from "../public/features/screenshot_3.png";
import screenshot_4 from "../public/features/screenshot_4.png";
import screenshot_5 from "../public/features/screenshot_5.png";
import screenshot_6 from "../public/features/screenshot_6.png";
import screenshot_7 from "../public/features/screenshot_7.png";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const features = [
  {
    title: "Calendar Explorer",
    description: "",
    media: (props) => (
      <div {...props}>
        <Image src={screenshot_1} alt="" />
      </div>
    ),
    list: [
      {
        title: "Summarize each Day",
        description:
          "Shows exercises, bodyweight, and pictures all in one plane",
        icon: BookOpenIcon,
      },
      {
        title: "See what you've Logged",
        description:
          "See which days you've logged exercises, bodyweight, and pictures",
        icon: CalendarIcon,
      },
      {
        title: "View Clients' Diaries",
        description:
          "Easily switch between your diary and your clients' diaries",
        icon: UserGroupIcon,
      },
    ],
  },
  {
    title: "Plan Exercises",
    description: "",
    media: (props) => (
      <div {...props}>
        <Image src={screenshot_2} alt="" />
      </div>
    ),
    list: [
      {
        title: "Plan Ahead",
        description:
          "Prepare weight, number of sets & reps, and other features like set & rest duration",
        icon: ClipboardListIcon,
      },
      {
        title: "Visual Exerise Directory",
        description:
          "Search exercises by name or muscles used, accompanied by images and videos of each exercise",
        icon: SearchIcon,
      },
      {
        title: "Block Programming",
        description:
          "Plan entire Blocks of Programming you can reuse for you and your clients",
        icon: TemplateIcon,
      },
    ],
  },
  {
    title: "Log Exercise Performance",
    description: "",
    media: (props) => (
      <div {...props}>
        <Image src={screenshot_3} alt="" />
      </div>
    ),
    list: [
      {
        title: "Detail Performances",
        description:
          "Log when you did each exercise, how many sets & reps you did, and how difficult it was",
        icon: ClipboardCheckIcon,
      },
      {
        title: "Add Videos",
        description: "Embed YouTube or Google Drive videos of your sets",
        icon: VideoCameraIcon,
      },
      {
        title: "Notes and Feedback",
        description:
          "Add details for before and after your exercises to note for next time you perform that exercise",
        icon: PencilAltIcon,
      },
    ],
  },
  {
    title: "Track Bodyweight",
    description: "",
    media: (props) => (
      <div {...props}>
        <Image src={screenshot_4} alt="" />
      </div>
    ),
    list: [
      {
        title: "Add Multiple Bodyweights a Day",
        description:
          "Set a single bodyweight per day, or add multiple bodyweights, including timestamps and context of each weight change (e.g. drinking water or bowel movements)",
        icon: ScaleIcon,
      },
      {
        title: "Visualize Bodyweight Fluctuations",
        description:
          "View your bodyweight fluctuate throughout the day as you eat, drink, and use the restroom, as well as decline over time from exhaling Carbon Dioxide",
        icon: TrendingDownIcon,
      },
      {
        title: "Withings Scale Integration",
        description:
          "Connect your Withings account to automatically log weight and bodyfat",
        icon: DeviceTabletIcon,
      },
    ],
  },
  {
    title: "Upload Pictures",
    description: "",
    media: (props) => (
      <div {...props}>
        <Image src={screenshot_5} alt="" />
      </div>
    ),
    list: [
      {
        title: "Post up to 3 Angles per Day",
        description: "Upload pictures from the front, side, and back",
        icon: CameraIcon,
      },
      {
        title: "View Bodyweight alongside Pictures",
        description: "Bodyweight is displayed alongside pictures if tracked.",
        icon: ScaleIcon,
      },
    ],
  },
  {
    title: "Visualize Progress",
    media: (props) => (
      <div {...props}>
        <Image src={screenshot_6} alt="" />
      </div>
    ),
    list: [
      {
        title: "Toggle Exercise Features",
        description:
          "Choose which exercise features to graph (top set, number of reps, difficulty, etc)",
        icon: ChartBarIcon,
      },
      {
        title: "View Bodyweight Progress",
        description:
          "View your Bodyweight over time and correlate it with performance",
        icon: ScaleIcon,
      },
    ],
  },
  {
    title: "Coach Clients",
    description:
      "Persons 18+ and older in the United States can coach other users on Repsetter",
    media: (props) => (
      <div {...props}>
        <Image src={screenshot_7} alt="" />
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
        title: "5% Flat fee",
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
            Your New Favorite Workout Diary
          </h2>
          <p className="mt-2 text-lg text-gray-500">
            A simple workout diary that simply works
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
                index % 2 ? "lg:col-start-4" : ""
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
