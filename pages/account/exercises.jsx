import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "../../context/user-context";
import Notification from "../../components/Notification";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import ExerciseTypeModal from "../../components/account/modal/ExerciseTypeModal";
import DeleteExerciseTypeModal from "../../components/account/modal/DeleteExerciseTypeModal";
import Table from "../../components/Table";
import { useExerciseVideos } from "../../context/exercise-videos-context";
import { muscles, muscleGroups } from "../../utils/exercise-utils";

const filterTypes = [
  ...muscleGroups.map((muscleGroup) => ({
    name: `Muscles (${muscleGroup})`,
    query: "muscles",
    column: "muscles",
    checkboxes: muscles
      .filter((muscle) => muscle.group === muscleGroup)
      .map((muscle) => ({
        value: muscle.name,
        label: muscle.name,
        defaultChecked: false,
      })),
  })),
];

const orderTypes = [
  {
    label: "Name",
    query: "name",
    value: ["name", { ascending: true }],
    current: true,
  },
  {
    label: "Date Created",
    query: "date-created",
    value: ["created_at", { ascending: false }],
    current: false,
  },
];

export default function Exercises() {
  const router = useRouter();
  const { isAdmin } = useUser();

  const [showEditExerciseTypeModal, setShowEditExerciseTypeModal] =
    useState(false);
  const [editExerciseTypeStatus, setEditExerciseTypeStatus] = useState(false);
  const [
    showEditExerciseTypeNotification,
    setShowEditExerciseTypeNotification,
  ] = useState(false);

  const [selectedExercise, setSelectedExercise] = useState();

  const { exerciseVideos, getExerciseVideo } = useExerciseVideos();
  const [results, setResults] = useState();
  useEffect(() => {
    if (results) {
      results.forEach((result) => {
        getExerciseVideo(result.id);
      });
    }
  }, [results]);

  return (
    <>
      <ExerciseTypeModal
        open={showEditExerciseTypeModal}
        setOpen={setShowEditExerciseTypeModal}
        setCreateResultStatus={setEditExerciseTypeStatus}
        setShowCreateResultNotification={setShowEditExerciseTypeNotification}
        selectedExercise={selectedExercise}
        setSelectedExercise={setSelectedExercise}
      ></ExerciseTypeModal>
      <Notification
        open={showEditExerciseTypeNotification}
        setOpen={setShowEditExerciseTypeNotification}
        status={editExerciseTypeStatus}
      />
      <Table
        resultsListener={setResults}
        filterTypes={filterTypes}
        orderTypes={orderTypes}
        tableName="exercise_type"
        resultName="exercise"
        title="Exercises"
        subtitle="View all Exercises"
        CreateResultModal={isAdmin && ExerciseTypeModal}
        DeleteResultModal={isAdmin && DeleteExerciseTypeModal}
        resultMap={(result) => [
          {
            title: "name",
            value: result.name,
          },
          result.muscles && {
            title: "muscles",
            value: result.muscles.join(", "),
          },
          result.id in exerciseVideos && {
            jsx: (
              <video
                src={exerciseVideos[result.id].url}
                autoPlay
                muted
                loop
                className="h-28"
                playsInline
              ></video>
            ),
          },
          isAdmin && {
            jsx: (
              <button
                onClick={() => {
                  setSelectedExercise(result);
                  setShowEditExerciseTypeModal(true);
                }}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Edit<span className="sr-only"> exercise</span>
              </button>
            ),
          },
        ]}
      ></Table>
    </>
  );
}

Exercises.getLayout = getAccountLayout;