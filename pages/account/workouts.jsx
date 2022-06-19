import { getAccountCalendarLayout } from "../../components/layouts/AccountCalendarLayout";
import { useUser } from "../../context/user-context";
import Head from "next/head";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";

const months = [
  "January",
  "Feburary",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const years = [2022, 2023];

const days = [
  { date: "2021-12-27" },
  { date: "2021-12-28" },
  { date: "2021-12-29" },
  { date: "2021-12-30" },
  { date: "2021-12-31" },
  { date: "2022-01-01", isCurrentMonth: true },
  { date: "2022-01-02", isCurrentMonth: true },
  { date: "2022-01-03", isCurrentMonth: true },
  { date: "2022-01-04", isCurrentMonth: true },
  { date: "2022-01-05", isCurrentMonth: true },
  { date: "2022-01-06", isCurrentMonth: true },
  { date: "2022-01-07", isCurrentMonth: true },
  { date: "2022-01-08", isCurrentMonth: true },
  { date: "2022-01-09", isCurrentMonth: true },
  { date: "2022-01-10", isCurrentMonth: true },
  { date: "2022-01-11", isCurrentMonth: true },
  { date: "2022-01-12", isCurrentMonth: true, isToday: true },
  { date: "2022-01-13", isCurrentMonth: true },
  { date: "2022-01-14", isCurrentMonth: true },
  { date: "2022-01-15", isCurrentMonth: true },
  { date: "2022-01-16", isCurrentMonth: true },
  { date: "2022-01-17", isCurrentMonth: true },
  { date: "2022-01-18", isCurrentMonth: true },
  { date: "2022-01-19", isCurrentMonth: true },
  { date: "2022-01-20", isCurrentMonth: true },
  { date: "2022-01-21", isCurrentMonth: true },
  { date: "2022-01-22", isCurrentMonth: true, isSelected: true },
  { date: "2022-01-23", isCurrentMonth: true },
  { date: "2022-01-24", isCurrentMonth: true },
  { date: "2022-01-25", isCurrentMonth: true },
  { date: "2022-01-26", isCurrentMonth: true },
  { date: "2022-01-27", isCurrentMonth: true },
  { date: "2022-01-28", isCurrentMonth: true },
  { date: "2022-01-29", isCurrentMonth: true },
  { date: "2022-01-30", isCurrentMonth: true },
  { date: "2022-01-31", isCurrentMonth: true },
  { date: "2022-02-01" },
  { date: "2022-02-02" },
  { date: "2022-02-03" },
  { date: "2022-02-04" },
  { date: "2022-02-05" },
  { date: "2022-02-06" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Workouts() {
  const { user } = useUser();
  return (
    <>
      <Head>
        <title>Workouts - Repsetter</title>
      </Head>
      <div className="space-y-6 px-4 pb-6 pt-6 sm:px-6 sm:pt-6">
        <div className="lg:grid lg:grid-cols-12 lg:grid-rows-2 lg:gap-x-10">
          <div className="lg:col-start-1 lg:col-end-8 lg:row-start-1">
            <h3 className="inline text-lg font-medium leading-6 text-gray-900">
              Workouts
            </h3>
            <div className="ml-3 inline-block">
              <select
                id="clientEmail"
                className="mt-1 w-full rounded-md border-gray-300 py-1 pl-2 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                defaultValue="Me"
              >
                <option>Me</option>
                <option>United States</option>
                <option>Mexico</option>
              </select>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              View and Edit workouts for [YOU or CLIENT_EMAIL]
            </p>
          </div>
          <div className="mt-8 text-center lg:col-start-8 lg:col-end-13 lg:row-span-2 lg:row-start-1 lg:mt-0 xl:col-start-9">
            <div className="flex items-center text-gray-900">
              <button
                type="button"
                className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Previous month</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              <div className="flex-auto">
                <select
                  id="month"
                  className="mt-1 rounded-md border-gray-300 py-1 pl-2 pr-8 font-semibold focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  defaultValue="January"
                >
                  {months.map((month) => (
                    <option key={month}>{month}</option>
                  ))}
                </select>

                <select
                  id="year"
                  className="mt-1 ml-4 rounded-md border-gray-300 py-1 pl-2 pr-8 font-semibold focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  defaultValue="2022"
                >
                  {years.map((year) => (
                    <option key={year}>{year}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Next month</span>
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 grid grid-cols-7 text-xs leading-6 text-gray-500">
              <div>M</div>
              <div>T</div>
              <div>W</div>
              <div>T</div>
              <div>F</div>
              <div>S</div>
              <div>S</div>
            </div>
            <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow ring-1 ring-gray-200">
              {days.map((day, dayIdx) => (
                <button
                  key={day.date}
                  type="button"
                  className={classNames(
                    "py-1.5 hover:bg-gray-100 focus:z-10",
                    day.isCurrentMonth ? "bg-white" : "bg-gray-50",
                    (day.isSelected || day.isToday) && "font-semibold",
                    day.isSelected && "text-white",
                    !day.isSelected &&
                      day.isCurrentMonth &&
                      !day.isToday &&
                      "text-gray-900",
                    !day.isSelected &&
                      !day.isCurrentMonth &&
                      !day.isToday &&
                      "text-gray-400",
                    day.isToday && !day.isSelected && "text-blue-600",
                    dayIdx === 0 && "rounded-tl-lg",
                    dayIdx === 6 && "rounded-tr-lg",
                    dayIdx === days.length - 7 && "rounded-bl-lg",
                    dayIdx === days.length - 1 && "rounded-br-lg"
                  )}
                >
                  <time
                    dateTime={day.date}
                    className={classNames(
                      "mx-auto flex h-7 w-7 items-center justify-center rounded-full",
                      day.isSelected && day.isToday && "bg-blue-600",
                      day.isSelected && !day.isToday && "bg-gray-900"
                    )}
                  >
                    {day.date.split("-").pop().replace(/^0/, "")}
                  </time>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="mt-4 w-full rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Workout
            </button>
          </div>
          <div className="mt-8 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 lg:col-start-1 lg:row-start-2 lg:mt-0">
            Hello
          </div>
        </div>
      </div>
    </>
  );
}

Workouts.getLayout = getAccountCalendarLayout;
