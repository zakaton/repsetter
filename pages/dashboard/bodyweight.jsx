import { useEffect, useState } from "react";
import { useUser } from "../../context/user-context";
import { getDashboardLayout } from "../../components/layouts/DashboardLayout";
import WeightModal from "../../components/dashboard/modal/WeightModal";
import DeleteWeightModal from "../../components/dashboard/modal/DeleteWeightModal";
import { weightEvents } from "../../utils/weight-utils";
import Table from "../../components/Table";
import { useClient } from "../../context/client-context";
import MyLink from "../../components/MyLink";
import { timeToDate, stringToDate } from "../../utils/supabase";
import { usePictures } from "../../context/picture-context";
import { pictureTypes } from "../../utils/picture-utils";

const filterTypes = [
  {
    name: "Weight Event",
    query: "weight-event",
    column: "event?in",
    checkboxes: [
      ...weightEvents.map(({ name }, index) => ({
        value: name,
        label: name,
        defaultChecked: false,
      })),
    ],
  },
];

const orderTypes = [
  {
    label: "Date (Newest)",
    query: "date-newest",
    value: [
      ["date", { ascending: false }],
      ["time", { ascending: true }],
    ],
    current: true,
  },
  {
    label: "Date (Oldest)",
    query: "date-oldest",
    value: [
      ["date", { ascending: true }],
      ["time", { ascending: true }],
    ],
    current: false,
  },
];

export default function Bodyweight() {
  const { user } = useUser();

  const { selectedClient, setSelectedDate, selectedClientId, amITheClient } =
    useClient();

  const [weights, setWeights] = useState();
  const [baseFilter, setBaseFilter] = useState();
  useEffect(() => {
    if (!selectedClientId) {
      return;
    }

    console.log("selectedClientId", selectedClientId);

    const newBaseFilter = {};
    newBaseFilter.client = selectedClientId;
    setBaseFilter(newBaseFilter);
  }, [user, selectedClientId]);

  console.log("baseFilter", baseFilter);

  const { pictures, getPicture } = usePictures();
  useEffect(() => {
    if (weights && selectedClientId) {
      getPicture(selectedClientId, {
        date: weights.map(({ date }) => stringToDate(date)),
      });
    }
  }, [weights, selectedClientId]);

  return (
    <>
      <Table
        EditResultModal={WeightModal}
        className={
          "grid grid-cols-2 gap-x-4 gap-y-6 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7"
        }
        includeClientSelect={true}
        baseFilter={baseFilter}
        numberOfResultsPerPage={10}
        resultsListener={setWeights}
        filterTypes={filterTypes}
        orderTypes={orderTypes}
        tableName="weight"
        resultName="weight"
        selectString="*"
        title="Bodyweight"
        subtitle={`View ${
          selectedClient ? `${selectedClient.client_email}'s` : "your"
        } bodyweight.`}
        DeleteResultModal={amITheClient && DeleteWeightModal}
        resultMap={(weight, index) => {
          const todaysPictures = pictures?.[selectedClientId]?.[weight.date];
          const pictureItems = todaysPictures
            ? pictureTypes
                .filter((type) => type in todaysPictures)
                .map((type) => ({
                  jsx: (
                    <>
                      <img
                        src={todaysPictures[type]}
                        alt={type}
                        width="100"
                        className="rounded-lg"
                        loading="lazy"
                      />
                    </>
                  ),
                }))
            : [];
          return [
            {
              title: "date",
              value: stringToDate(weight.date).toDateString(),
            },
            weight.time && {
              title: "time",
              value: timeToDate(weight.time).toLocaleTimeString([], {
                timeStyle: "short",
              }),
            },
            {
              title: "weight",
              value: `${weight.weight} (${
                weight.is_weight_in_kilograms ? "kg" : "lbs"
              })`,
            },
            weight.bodyfat_percentage !== null && {
              title: "bodyfat percentage",
              value: `${weight.bodyfat_percentage}%`,
            },
            ...pictureItems,
            weight.event && {
              title: "event",
              value: weight.event,
            },
            {
              jsx: (
                <MyLink
                  onClick={() => {
                    setSelectedDate(stringToDate(weight.date));
                  }}
                  href={`/dashboard/diary?date=${stringToDate(
                    weight.date
                  ).toDateString()}${
                    selectedClient
                      ? `&client=${selectedClient.client_email}`
                      : ""
                  }`}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Diary
                </MyLink>
              ),
            },
          ];
        }}
      />
    </>
  );
}

Bodyweight.getLayout = getDashboardLayout;
