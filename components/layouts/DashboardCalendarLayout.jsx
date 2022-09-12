import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import { useState, useEffect, useLayoutEffect } from "react";
import Head from "next/head";
import { useClient } from "../../context/client-context";
import ClientsSelect from "../dashboard/ClientsSelect";

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

const highlightColors = {
  copy: "bg-blue-100",
  paste: "bg-blue-100",
  delete: "bg-red-100",
};

const capitalizeFirstLetter = (string) =>
  string[0].toUpperCase() + string.slice(1).toLowerCase();

const getNumberOfDaysInMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function DashboardCalendarLayout({
  children,
  title,
  subtitle,
  tableName,
  resultName,
  resultNamePlural,
  underCalendar,
  yearsRange = [2021, 2022],
  setCalendar: setCalendarParent,
  datesDots = {},
  datesToHighlight,
}) {
  resultName = resultName || tableName;
  resultNamePlural = resultNamePlural || resultName + "s";

  const ResultName = capitalizeFirstLetter(resultName);
  const ResultNamePlural = capitalizeFirstLetter(resultNamePlural);

  title = title || ResultNamePlural;

  const { selectedClient, selectedDate, setSelectedDate } = useClient();

  const years = [];
  for (let year = yearsRange[0]; year <= yearsRange[1]; year++) {
    years.push(year);
  }

  const currentDate = new Date();
  const [previouslySelectedDate, setPreviouslySelectedDate] = useState();

  const [calendar, setCalendar] = useState();
  const populateCalendar = () => {
    console.log("populating calendar");

    const newCalendar = [];
    newCalendar.push(selectedDate);

    const dateBeforeSelectedDate = new Date(selectedDate);
    const addPreviousDate = () => {
      dateBeforeSelectedDate.setDate(dateBeforeSelectedDate.getDate() - 1);
      newCalendar.unshift(new Date(dateBeforeSelectedDate));
    };
    while (
      dateBeforeSelectedDate.getDate() > 1 &&
      dateBeforeSelectedDate.getDate() <= selectedDate.getDate()
    ) {
      addPreviousDate();
    }
    while (dateBeforeSelectedDate.getDay() !== 0) {
      addPreviousDate();
    }

    const numberOfDaysInMonth = getNumberOfDaysInMonth(selectedDate);
    const dateAfterSelectedDate = new Date(selectedDate);
    const addNextDate = () => {
      dateAfterSelectedDate.setDate(dateAfterSelectedDate.getDate() + 1);
      newCalendar.push(new Date(dateAfterSelectedDate));
    };
    while (
      dateAfterSelectedDate.getDate() >= selectedDate.getDate() &&
      dateAfterSelectedDate.getDate() < numberOfDaysInMonth
    ) {
      addNextDate();
    }
    while (dateAfterSelectedDate.getDay() !== 6) {
      addNextDate();
    }

    setCalendar(newCalendar);
  };

  useEffect(() => {
    setCalendarParent?.(calendar);
  }, [calendar]);

  useLayoutEffect(() => {
    if (
      selectedDate &&
      previouslySelectedDate &&
      selectedDate.getFullYear() == previouslySelectedDate.getFullYear() &&
      selectedDate.getMonth() == previouslySelectedDate.getMonth() &&
      selectedDate.getDate() == previouslySelectedDate.getDate()
    ) {
      return;
    }

    if (selectedDate) {
      populateCalendar();
      setPreviouslySelectedDate(selectedDate);
    }
  }, [selectedDate, calendar]);

  return (
    <>
      <Head>
        <title>{title} - Repsetter</title>
      </Head>
      <div className="space-y-6 px-4 pb-6 pt-4 sm:px-6">
        <div className="lg:grid lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-y-6 lg:gap-x-8">
          <div className="lg:col-span-8 lg:col-start-1 lg:row-start-1">
            <h3 className="inline text-lg font-medium leading-6 text-gray-900">
              {title}
            </h3>
            <ClientsSelect />
            <p className="mt-2 text-sm text-gray-500">
              {subtitle ||
                `View and edit ${
                  selectedClient?.client_email
                    ? selectedClient?.client_email + "'s"
                    : "your"
                } ${resultNamePlural}`}
            </p>
          </div>
          <div className="mt-6 text-center lg:col-start-9 lg:col-end-13 lg:row-span-2 lg:row-start-1 lg:mt-0">
            <div className="flex items-center text-gray-900">
              <button
                type="button"
                className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                onClick={() => {
                  const newSelectedDate = new Date(selectedDate);
                  newSelectedDate.setMonth(newSelectedDate.getMonth() - 1);
                  setSelectedDate(newSelectedDate);
                }}
              >
                <span className="sr-only">Previous month</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              <div className="flex-auto">
                <select
                  id="month"
                  className="mt-1 rounded-md border-gray-300 py-1 pl-2 pr-8 font-semibold focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  value={selectedDate?.getMonth() || 0}
                  onInput={(e) => {
                    const newSelectedDate = new Date(selectedDate);
                    newSelectedDate.setMonth(e.target.selectedIndex);
                    setSelectedDate(newSelectedDate);
                  }}
                >
                  {months.map((month, index) => (
                    <option key={month} value={index}>
                      {month}
                    </option>
                  ))}
                </select>

                <select
                  id="year"
                  className="mt-1 ml-4 rounded-md border-gray-300 py-1 pl-2 pr-8 font-semibold focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  value={selectedDate?.getFullYear()}
                  onInput={(e) => {
                    const newSelectedDate = new Date(selectedDate);
                    newSelectedDate.setFullYear(e.target.value);
                    setSelectedDate(newSelectedDate);
                  }}
                >
                  {years.map((year) => (
                    <option key={year}>{year}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                onClick={() => {
                  const newSelectedDate = new Date(selectedDate);
                  newSelectedDate.setMonth(newSelectedDate.getMonth() + 1);
                  setSelectedDate(newSelectedDate);
                }}
              >
                <span className="sr-only">Next month</span>
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-2 overflow-hidden rounded-md shadow ring-1 ring-black ring-opacity-5 lg:flex lg:flex-auto lg:flex-col">
              <div className="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs font-semibold leading-6 text-gray-700 lg:flex-none">
                <div className="bg-white py-2">
                  S<span className="sr-only sm:not-sr-only">un</span>
                </div>
                <div className="bg-white py-2">
                  M<span className="sr-only sm:not-sr-only">on</span>
                </div>
                <div className="bg-white py-2">
                  T<span className="sr-only sm:not-sr-only">ue</span>
                </div>
                <div className="bg-white py-2">
                  W<span className="sr-only sm:not-sr-only">ed</span>
                </div>
                <div className="bg-white py-2">
                  T<span className="sr-only sm:not-sr-only">hu</span>
                </div>
                <div className="bg-white py-2">
                  F<span className="sr-only sm:not-sr-only">ri</span>
                </div>
                <div className="bg-white py-2">
                  S<span className="sr-only sm:not-sr-only">at</span>
                </div>
              </div>
              <div className="flex bg-gray-200 text-xs leading-6 text-gray-700 lg:flex-auto">
                <div className="isolate grid w-full grid-cols-7 gap-px">
                  {calendar &&
                    calendar.map((date, dayIdx) => {
                      const dateString = [
                        date.getFullYear(),
                        date.getMonth() + 1,
                        date.getDate(),
                      ]
                        .map((number) => (number < 10 ? `0${number}` : number))
                        .join("-");
                      const day = {
                        date,
                        isCurrentMonth:
                          date.getMonth() === selectedDate.getMonth(),
                        isSelected:
                          date.toDateString() === selectedDate.toDateString(),
                        isToday:
                          date.toDateString() === currentDate.toDateString(),
                        dots: datesDots[dateString] || [],
                        dateString,
                      };
                      if (datesToHighlight) {
                        day.shouldHighlight = date >= datesToHighlight.fromDate;
                        if (datesToHighlight.dateRangeToCopy === "day") {
                          day.shouldHighlight &&=
                            date < datesToHighlight.toDate;
                        } else {
                          day.shouldHighlight &&=
                            date <= datesToHighlight.toDate;
                        }
                        if (day.shouldHighlight) {
                          day.highlightColor =
                            highlightColors[datesToHighlight.type];
                        }
                      }
                      return (
                        <button
                          key={day.date}
                          type="button"
                          onClick={() => {
                            setSelectedDate(day.date);
                          }}
                          className={classNames(
                            !day.shouldHighlight &&
                              (day.isCurrentMonth ? "bg-white" : "bg-gray-50"),
                            (day.isSelected || day.isToday) && "font-semibold",
                            day.isSelected && "text-white",
                            !day.isSelected && day.isToday && "text-blue-600",
                            !day.isSelected &&
                              day.isCurrentMonth &&
                              !day.isToday &&
                              "text-gray-900",
                            !day.isSelected &&
                              !day.isCurrentMonth &&
                              !day.isToday &&
                              "text-gray-500",
                            day.shouldHighlight && day.highlightColor,
                            "flex h-14 flex-col py-2 px-3 hover:bg-gray-100 focus:z-10"
                          )}
                        >
                          <time
                            dateTime={day.date}
                            className={classNames(
                              day.isSelected &&
                                "flex h-6 w-6 items-center justify-center rounded-full",
                              day.isSelected && day.isToday && "bg-blue-600",
                              day.isSelected && !day.isToday && "bg-gray-900",
                              "ml-auto"
                            )}
                          >
                            {day.date.getDate()}
                          </time>
                          {day.dots.length > 0 && (
                            <span className="-mx-0.5 mt-auto flex flex-wrap-reverse">
                              {day.dots.map(({ color }, index) => (
                                <span
                                  key={index}
                                  className={classNames(
                                    "mx-0.5 mb-1 h-1.5 w-1.5 rounded-full",
                                    color || "bg-gray-400"
                                  )}
                                />
                              ))}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
            {underCalendar}
          </div>
          <div className="mt-8 text-sm leading-6 lg:col-span-8 lg:col-start-1 lg:row-start-2 lg:mt-0">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
