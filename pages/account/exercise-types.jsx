import { useEffect, useState } from "react";
import { useUser } from "../../context/user-context";
import Notification from "../../components/Notification";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import ExerciseTypeModal from "../../components/account/modal/ExerciseTypeModal";
import DeleteExerciseTypeModal from "../../components/account/modal/DeleteExerciseTypeModal";
import Table from "../../components/Table";
import { useExerciseVideos } from "../../context/exercise-videos-context";
import { muscles, muscleGroups } from "../../utils/exercise-utils";
import MyLink from "../../components/MyLink";
import ExerciseTypeVideo from "../../components/ExerciseTypeVideo";

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

export default function ExerciseTypes() {
  const { isAdmin } = useUser();

  const [showEditExerciseTypeModal, setShowEditExerciseTypeModal] =
    useState(false);
  const [editExerciseTypeStatus, setEditExerciseTypeStatus] = useState(false);
  const [
    showEditExerciseTypeNotification,
    setShowEditExerciseTypeNotification,
  ] = useState(false);

  const [selectedExerciseType, setSelectedExerciseType] = useState();

  const { exerciseVideos, getExerciseVideo } = useExerciseVideos();
  const [results, setResults] = useState();
  useEffect(() => {
    if (results) {
      getExerciseVideo(results.map(({ id }) => id));
    }
  }, [results]);

  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);
  const modalListener = (isAnyModalOpen) => {
    setIsAnyModalOpen(isAnyModalOpen);
  };

  useEffect(() => {
    if (showEditExerciseTypeModal || isAnyModalOpen) {
      setShowEditExerciseTypeNotification(false);
    }
  }, [showEditExerciseTypeModal, isAnyModalOpen]);

  useEffect(() => {
    if (editExerciseTypeStatus?.type === "succeeded") {
      getExerciseVideo(editExerciseTypeStatus.exerciseTypeId, true);
      setRefreshResults(true);
    }
  }, [editExerciseTypeStatus]);

  const [refreshResults, setRefreshResults] = useState(false);

  return (
    <>
      <ExerciseTypeModal
        open={showEditExerciseTypeModal}
        setOpen={setShowEditExerciseTypeModal}
        setCreateResultStatus={setEditExerciseTypeStatus}
        setShowCreateResultNotification={setShowEditExerciseTypeNotification}
        selectedExerciseType={selectedExerciseType}
        setSelectedExerciseType={setSelectedExerciseType}
      ></ExerciseTypeModal>
      <Notification
        open={showEditExerciseTypeNotification}
        setOpen={setShowEditExerciseTypeNotification}
        status={editExerciseTypeStatus}
      />
      <Table
        modalListener={modalListener}
        resultsListener={setResults}
        refreshResults={refreshResults}
        setRefreshResults={setRefreshResults}
        filterTypes={filterTypes}
        orderTypes={orderTypes}
        tableName="exercise_type"
        resultName="exercise"
        title="Exercise Types"
        subtitle="View all Exercise Types"
        className={
          "grid grid-cols-2 gap-x-4 gap-y-6 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7"
        }
        CreateResultModal={isAdmin && ExerciseTypeModal}
        DeleteResultModal={isAdmin && DeleteExerciseTypeModal}
        resultMap={(result) => [
          {
            title: "name",
            value: result.name,
          },
          result.id in exerciseVideos && {
            jsx: (
              <ExerciseTypeVideo
                exerciseTypeId={result.id}
                fetchVideo={false}
              ></ExerciseTypeVideo>
            ),
          },
          result.muscles?.length > 0 && {
            title: "muscles",
            value: result.muscles.join(", "),
          },
          result.features?.length > 0 && {
            title: "features",
            value: result.features.join(", "),
          },
          isAdmin && {
            jsx: (
              <button
                onClick={() => {
                  setSelectedExerciseType(result);
                  setShowEditExerciseTypeModal(true);
                }}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Edit<span className="sr-only"> exercise</span>
              </button>
            ),
          },
          isAdmin && {
            jsx: (
              <MyLink
                href={`/account/exercises?exercise-type=${result.name}`}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
              >
                View
              </MyLink>
            ),
          },
        ]}
      ></Table>
    </>
  );
}

ExerciseTypes.getLayout = getAccountLayout;
