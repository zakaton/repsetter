import { useUser } from "../../context/user-context";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import { useState, useEffect } from "react";

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

const getNumberOfDaysInMonth = (date) =>
  new Date(date.getUTCFullYear(), date.getUTCMonth() + 1, 0).getUTCDate();

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function AccountCalendarLayout({ children }) {
  const { user } = useUser();
  const [clientEmail, setClientEmail] = useState();

  const yearsRange = [2022, 2023];

  const years = [];
  // FIX - set range based on workouts range
  for (let year = yearsRange[0]; year <= yearsRange[1]; year++) {
    years.push(year);
  }

  const currentDate = new Date();

  const [selectedDate, setSelectedDate] = useState();
  const [previouslySelectedDate, setPreviouslySelectedDate] = useState();
  useEffect(() => {
    // FILL - get day/month/year from query params
    setSelectedDate(currentDate);
    setClientEmail(user.email);
  }, []);

  const [calendar, setCalendar] = useState();
  const populateCalendar = () => {
    console.log("populating calendar");

    const newCalendar = [];
    newCalendar.push(selectedDate);

    const dateBeforeSelectedDate = new Date(selectedDate);
    const addPreviousDate = () => {
      dateBeforeSelectedDate.setUTCDate(
        dateBeforeSelectedDate.getUTCDate() - 1
      );
      newCalendar.unshift(new Date(dateBeforeSelectedDate));
    };
    while (
      dateBeforeSelectedDate.getUTCDate() > 1 &&
      dateBeforeSelectedDate.getUTCDate() <= selectedDate.getUTCDate()
    ) {
      addPreviousDate();
    }
    while (dateBeforeSelectedDate.getUTCDay() !== 0) {
      addPreviousDate();
    }

    const numberOfDaysInMonth = getNumberOfDaysInMonth(selectedDate);
    const dateAfterSelectedDate = new Date(selectedDate);
    const addNextDate = () => {
      dateAfterSelectedDate.setUTCDate(dateAfterSelectedDate.getUTCDate() + 1);
      newCalendar.push(new Date(dateAfterSelectedDate));
    };
    while (
      dateAfterSelectedDate.getUTCDate() >= selectedDate.getUTCDate() &&
      dateAfterSelectedDate.getUTCDate() < numberOfDaysInMonth
    ) {
      addNextDate();
    }
    while (dateAfterSelectedDate.getUTCDay() !== 6) {
      addNextDate();
    }

    setCalendar(newCalendar);
  };

  useEffect(() => {
    if (
      selectedDate &&
      previouslySelectedDate &&
      selectedDate.getUTCFullYear() ==
        previouslySelectedDate.getUTCFullYear() &&
      selectedDate.getUTCMonth() == previouslySelectedDate.getUTCMonth() &&
      selectedDate.getUTCDate() == previouslySelectedDate.getUTCDate()
    ) {
      return;
    }

    if (selectedDate) {
      populateCalendar();
      setPreviouslySelectedDate(selectedDate);
    }
  }, [selectedDate, calendar]);

  return (
    <div className="space-y-6 px-4 pb-6 pt-6 sm:px-6 sm:pt-6">
      <div className="lg:grid lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-y-8 lg:gap-x-10">
        <div className="lg:col-start-1 lg:col-end-8 lg:row-start-1">
          <h3 className="inline text-lg font-medium leading-6 text-gray-900">
            Workouts
          </h3>
          <div className="ml-3 inline-block">
            <select
              id="clientEmail"
              className="mt-1 w-full rounded-md border-gray-300 py-1 pl-2 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              value={clientEmail}
              onInput={(e) => setClientEmail(e.target.value)}
            >
              <option value={user.email}>Me</option>
              {/* FILL - set clients */}
            </select>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            View and Edit{" "}
            {clientEmail === user.email ? "your" : `${clientEmail}'s`} Workouts
          </p>
        </div>
        <div className="mt-8 text-center lg:col-start-8 lg:col-end-13 lg:row-span-2 lg:row-start-1 lg:mt-0 xl:col-start-9">
          <div className="flex items-center text-gray-900">
            <button
              type="button"
              className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
              onClick={() => {
                const newSelectedDate = new Date(selectedDate);
                newSelectedDate.setUTCMonth(newSelectedDate.getUTCMonth() - 1);
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
                value={selectedDate?.getUTCMonth() || 0}
                onInput={(e) => {
                  const newSelectedDate = new Date(selectedDate);
                  newSelectedDate.setUTCMonth(e.target.selectedIndex);
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
                value={selectedDate?.getUTCFullYear()}
                onInput={(e) => {
                  const newSelectedDate = new Date(selectedDate);
                  newSelectedDate.setUTCFullYear(e.target.value);
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
                newSelectedDate.setUTCMonth(newSelectedDate.getUTCMonth() + 1);
                setSelectedDate(newSelectedDate);
              }}
            >
              <span className="sr-only">Next month</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 grid grid-cols-7 text-xs leading-6 text-gray-500">
            <div>S</div>
            <div>M</div>
            <div>T</div>
            <div>W</div>
            <div>T</div>
            <div>F</div>
            <div>S</div>
          </div>
          <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow ring-1 ring-gray-200">
            {calendar &&
              calendar.map((date, dayIdx) => {
                const day = {
                  date,
                  isCurrentMonth:
                    date.getUTCMonth() === selectedDate.getUTCMonth(),
                  isSelected:
                    date.getUTCFullYear() === selectedDate.getUTCFullYear() &&
                    date.getUTCMonth() === selectedDate.getUTCMonth() &&
                    date.getUTCDate() === selectedDate.getUTCDate(),
                  isToday:
                    date.getUTCFullYear() === currentDate.getUTCFullYear() &&
                    date.getUTCMonth() === currentDate.getUTCMonth() &&
                    date.getUTCDate() === currentDate.getUTCDate(),
                };
                return (
                  <button
                    key={day.date.toDateString()}
                    type="button"
                    onClick={() => {
                      setSelectedDate(day.date);
                    }}
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
                      dayIdx === calendar.length - 7 && "rounded-bl-lg",
                      dayIdx === calendar.length - 1 && "rounded-br-lg"
                    )}
                  >
                    <time
                      dateTime={day.date.toDateString()}
                      className={classNames(
                        "mx-auto flex h-7 w-7 items-center justify-center rounded-full",
                        day.isSelected && day.isToday && "bg-blue-600",
                        day.isSelected && !day.isToday && "bg-gray-900"
                      )}
                    >
                      {day.date.getUTCDate()}
                    </time>
                  </button>
                );
              })}
          </div>
          <button
            type="button"
            className="mt-4 w-full rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Workout
          </button>
        </div>
        <div className="mt-8 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 lg:col-start-1 lg:row-start-2 lg:mt-0">
          {children}
        </div>
      </div>
    </div>
  );
}
