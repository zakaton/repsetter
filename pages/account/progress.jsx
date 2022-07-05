import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "../../context/user-context";
import Notification from "../../components/Notification";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import ExerciseModal from "../../components/account/modal/ExerciseModal";
import DeleteExerciseModal from "../../components/account/modal/DeleteExerciseModal";
import Table from "../../components/Table";
import ExerciseTypesSelect from "../../components/account/modal/ExerciseTypesSelect";
import { useClient } from "../../context/client-context";

const filterTypes = [];

const orderTypes = [
  {
    label: "Date (Newest)",
    query: "date-newest",
    value: ["date", { ascending: false }],
    current: true,
  },
  {
    label: "Date (Oldest)",
    query: "date-oldest",
    value: ["date", { ascending: true }],
    current: false,
  },
];

export default function Progress() {
  const router = useRouter();
  const { isAdmin, user } = useUser();

  const { selectedClient, setSelectedDate } = useClient();

  const [showEditExerciseModal, setShowEditExerciseModal] = useState(false);
  const [editExerciseStatus, setEditExerciseStatus] = useState(false);
  const [showEditExerciseNotification, setShowEditExerciseNotification] =
    useState(false);

  const [selectedExercise, setSelectedExercise] = useState();
  const [selectedExerciseType, setSelectedExerciseType] = useState();
  const [selectedExerciseTypeName, setSelectedExerciseTypeName] = useState();
  const [checkedQuery, setCheckedQuery] = useState(false);
  useEffect(() => {
    if (!router.isReady || checkedQuery) {
      return;
    }
    console.log(router.query, "LLOL");
    if ("exercise-type" in router.query) {
      const selectedExerciseTypeName = router.query["exercise-type"];
      setSelectedExerciseTypeName(selectedExerciseTypeName);
    }
    setCheckedQuery(true);
  }, [router.isReady, checkedQuery]);

  useEffect(() => {
    if (!router.isReady || !checkedQuery) {
      return;
    }

    const query = {};
    if (selectedExerciseType) {
      query["exercise-type"] = selectedExerciseType.name;
    } else {
      delete router.query["exercise-type"];
    }

    router.replace({ query: { ...router.query, ...query } }, undefined, {
      shallow: true,
    });
  }, [selectedExerciseType]);

  const [results, setResults] = useState();
  const [baseFilter, setBaseFilter] = useState({});
  useEffect(() => {
    const newBaseFilter = {};

    if (selectedClient) {
      newBaseFilter.client = selectedClient.client;
      newBaseFilter.coach = user.id;
    } else {
      newBaseFilter.client = user.id;
    }

    if (selectedExerciseType) {
      newBaseFilter["type.name"] = selectedExerciseType.name;
    }
    setBaseFilter(newBaseFilter);
  }, [selectedClient, user, selectedExerciseType]);

  const clearFiltersListener = () => {
    setSelectedExerciseType();
  };

  return (
    <>
      <ExerciseModal
        open={showEditExerciseModal}
        setOpen={setShowEditExerciseModal}
        selectedResult={selectedExercise}
        setSelectedResult={setSelectedExercise}
        setEditResultStatus={setEditExerciseStatus}
        setShowEditResultNotification={setShowEditExerciseNotification}
      />
      <Notification
        open={showEditExerciseNotification}
        setOpen={setShowEditExerciseNotification}
        status={editExerciseStatus}
      />
      <Table
        clearFiltersListener={clearFiltersListener}
        includeClientSelect={true}
        baseFilter={baseFilter}
        numberOfResultsPerPage={10}
        resultsListener={setResults}
        filterTypes={filterTypes}
        orderTypes={orderTypes}
        tableName="exercise"
        resultName="exercise"
        selectString="*, type(*)"
        title="Progress"
        subtitle={`View your Progress${
          selectedExerciseType ? ` doing ${selectedExerciseType.name}` : ""
        }`}
        DeleteResultModal={isAdmin && DeleteExerciseModal}
        resultMap={(result) => [
          {
            title: "date",
            value: result.date,
          },
          {
            jsx: (
              <button
                onClick={() => {
                  console.log(result.date, new Date(result.date));
                  setSelectedDate(new Date(result.date));
                  router.push("/account/workouts", undefined, {
                    shallow: true,
                  });
                }}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
              >
                View Workout
              </button>
            ),
          },
        ]}
        filterChildren={
          <ExerciseTypesSelect
            selectedExerciseType={selectedExerciseType}
            setSelectedExerciseType={setSelectedExerciseType}
            open={true}
            selectedExerciseTypeName={selectedExerciseTypeName}
            setSelectedExerciseTypeName={setSelectedExerciseTypeName}
          />
        }
      ></Table>
    </>
  );
}

Progress.getLayout = getAccountLayout;
