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
import { muscles, muscleGroups } from "../../utils/exercise-utils";
import LazyVideo from "../../components/LazyVideo";
import { useExerciseVideos } from "../../context/exercise-videos-context";

const muscleFilterTypes = muscleGroups.map((muscleGroup) => ({
  name: `Muscles (${muscleGroup})`,
  query: "muscles",
  column: "type.muscles",
  checkboxes: muscles
    .filter((muscle) => muscle.group === muscleGroup)
    .map((muscle) => ({
      value: muscle.name,
      label: muscle.name,
      defaultChecked: false,
    })),
}));
const baseFilterTypes = [];

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

export default function Exercises() {
  const router = useRouter();
  const { isAdmin, user } = useUser();

  const { exerciseVideos, getExerciseVideo } = useExerciseVideos();

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

  useEffect(() => {
    if (results) {
      results.forEach((exercise) => getExerciseVideo(exercise.type.id));
    }
  }, [results]);

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
        filterTypes={
          selectedExerciseType
            ? baseFilterTypes
            : [...baseFilterTypes, ...muscleFilterTypes]
        }
        orderTypes={orderTypes}
        tableName="exercise"
        resultName="exercise"
        selectString="*, type!inner(*)"
        title="Exercises"
        subtitle={`View your Progress${
          selectedExerciseType ? ` doing ${selectedExerciseType.name}` : ""
        }`}
        DeleteResultModal={isAdmin && DeleteExerciseModal}
        resultMap={(exercise) => [
          {
            title: "date",
            value: exercise.date,
          },
          exercise.type.id in exerciseVideos && {
            jsx: (
              <LazyVideo
                onSuspend={(e) => {
                  document.addEventListener("click", () => e.target.play(), {
                    once: true,
                  });
                }}
                width="100px"
                src={exerciseVideos[exercise.type.id].url}
                muted={true}
                playsInline={true}
                autoPlay={true}
                loop={true}
              ></LazyVideo>
            ),
          },
          {
            title: "name",
            value: exercise.type.name,
          },
          {
            title: "muscles",
            value: exercise.type.muscles.join(", "),
          },
          {
            title: "sets",
            value:
              exercise.number_of_sets_performed === null
                ? exercise.number_of_sets_assigned
                : `${exercise.number_of_sets_performed}/${exercise.number_of_sets_assigned}`,
          },
          {
            title: "reps",
            value:
              exercise.number_of_reps_performed === null
                ? exercise.number_of_reps_assigned
                    .map((reps) => (reps == 0 ? "amrap" : reps))
                    .join(", ")
                : exercise.number_of_reps_performed
                    .map(
                      (numberOfReps, index) =>
                        `${numberOfReps}/${
                          exercise.number_of_reps_assigned[index] ||
                          exercise.number_of_reps_assigned[0]
                        }`
                    )
                    .join(", "),
          },
          exercise.weight_assigned.some((weight) => weight > 0) && {
            title: `Weight (${exercise.is_weight_in_kilograms ? "kg" : "lbs"})`,
            value:
              exercise.weight_performed === null
                ? exercise.weight_assigned.join(", ")
                : exercise.weight_performed
                    .map(
                      (weight, index) =>
                        `${weight}/${
                          exercise.weight_assigned[index] ||
                          exercise.weight_assigned[0]
                        }`
                    )
                    .join(", "),
          },
          exercise.difficulty !== null && {
            title: "difficulty",
            value: exercise.difficulty.map((value) => `${value}/10`).join(", "),
          },
          // videos
          {
            jsx: (
              <button
                onClick={() => {
                  setSelectedDate(new Date(exercise.date));
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

Exercises.getLayout = getAccountLayout;
