import { useEffect, useState } from "react";
import { useUser } from "../../context/user-context";
import Notification from "../../components/Notification";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import WeightModal from "../../components/account/modal/WeightModal";
import DeleteWeightModal from "../../components/account/modal/DeleteWeightModal";
import { weightEvents } from "../../utils/weight-utils";
import Table from "../../components/Table";
import { useClient } from "../../context/client-context";
import MyLink from "../../components/MyLink";
import { timeToDate, stringToDate } from "../../utils/supabase";
import { usePictures } from "../../context/picture-context";

const filterTypes = [
  {
    name: "Weight Event",
    query: "weight-event",
    column: "event",
    checkboxes: weightEvents.map((weightEvent) => ({
      value: weightEvent,
      label: weightEvent,
      defaultChecked: false,
    })),
  },
  {
    name: "Bodyweight Unit",
    query: "bodyweight-unit",
    column: "bodyweight-unit",
    requiresBodyweight: true,
    defaultValue: "lbs",
    radios: [
      { value: "lbs", label: "lbs", defaultChecked: true },
      { value: "kg", label: "kg" },
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
  const { user, isLoading } = useUser();

  const { selectedClient, setSelectedDate, selectedClientId, amITheClient } =
    useClient();

  const [showEditWeightModal, setShowEditWeightModal] = useState(false);
  const [editWeightStatus, setEditWeightStatus] = useState(false);
  const [showEditWeightNotification, setShowEditWeightNotification] =
    useState(false);

  const [selectedWeight, setSelectedWeight] = useState();

  const [weights, setWeights] = useState();
  const [baseFilter, setBaseFilter] = useState({});
  useEffect(() => {
    if (isLoading) {
      return;
    }

    console.log("selectedClientId", selectedClientId);

    const newBaseFilter = {};
    newBaseFilter.client = selectedClientId;
    setBaseFilter(newBaseFilter);
  }, [user, isLoading, selectedClientId]);

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
      <WeightModal
        open={showEditWeightModal}
        setOpen={setShowEditWeightModal}
        selectedResult={selectedWeight}
        setSelectedResult={setSelectedWeight}
        setResultStatus={setEditWeightStatus}
        setShowResultNotification={setShowEditWeightNotification}
      />
      <Notification
        open={showEditWeightNotification}
        setOpen={setShowEditWeightNotification}
        status={editWeightStatus}
      />
      <Table
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
            ? Object.keys(todaysPictures).map((type) => ({
                jsx: (
                  <>
                    <img src={todaysPictures[type]} alt={type} width="100" />
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
            weight.event && {
              title: "event",
              value: weight.event,
            },
            ...pictureItems,
            {
              jsx: (
                <button
                  onClick={() => {
                    setSelectedWeight(weight);
                    setShowEditWeightModal(true);
                  }}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Edit
                </button>
              ),
            },
            {
              jsx: (
                <MyLink
                  onClick={() => {
                    setSelectedDate(stringToDate(weight.date));
                  }}
                  href={`/account/diary?date=${stringToDate(
                    weight.date
                  ).toDateString()}${
                    selectedClient
                      ? `&client=${selectedClient.client_email}`
                      : ""
                  }`}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Full Diary
                </MyLink>
              ),
            },
          ];
        }}
      />
    </>
  );
}

Bodyweight.getLayout = getAccountLayout;
