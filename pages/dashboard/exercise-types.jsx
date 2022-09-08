import { useEffect, useState } from "react";
import { useUser } from "../../context/user-context";
import Notification from "../../components/Notification";
import { getDashboardLayout } from "../../components/layouts/DashboardLayout";
import ExerciseTypeModal from "../../components/dashboard/modal/ExerciseTypeModal";
import DeleteExerciseTypeModal from "../../components/dashboard/modal/DeleteExerciseTypeModal";
import Table from "../../components/Table";
import { useExerciseVideos } from "../../context/exercise-videos-context";
import {
  muscles,
  muscleGroups,
  exerciseTypeGroups,
} from "../../utils/exercise-utils";
import MyLink from "../../components/MyLink";
import ExerciseTypeVideo from "../../components/ExerciseTypeVideo";
import { useSelectedExerciseType } from "../../context/selected-exercise-context";
import { useClient } from "../../context/client-context";

const exerciseGroupTypes = {
  name: "Exercise Group",
  query: "group",
  column: "group",
  radios: [
    {
      value: null,
      label: "any",
      defaultChecked: true,
    },
    ...exerciseTypeGroups.map((group) => ({
      value: group,
      label: group,
      defaultChecked: false,
    })),
  ],
};
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
  exerciseGroupTypes,
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

  const { setSelectedExerciseType: _setSelectedExerciseType } =
    useSelectedExerciseType();

  const { selectedClient, setSelectedDate, amITheClient } = useClient();

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

  const [clearNotifications, setClearNotifications] = useState(false);

  useEffect(() => {
    if (showEditExerciseTypeModal || isAnyModalOpen) {
      setShowEditExerciseTypeNotification(false);
      setClearNotifications(true);
    }
  }, [showEditExerciseTypeModal, isAnyModalOpen]);

  useEffect(() => {
    if (editExerciseTypeStatus?.type === "succeeded") {
      getExerciseVideo(editExerciseTypeStatus.exerciseTypeId, true);
      setRefreshResults(true);
    }
  }, [editExerciseTypeStatus]);

  const [refreshResults, setRefreshResults] = useState(false);

  const [baseFilter, setBaseFilter] = useState({});

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
        baseFilter={baseFilter}
        numberOfResultsPerPage={10}
        modalListener={modalListener}
        resultsListener={setResults}
        refreshResults={refreshResults}
        setRefreshResults={setRefreshResults}
        clearNotifications={clearNotifications}
        setClearNotifications={setClearNotifications}
        filterTypes={filterTypes}
        orderTypes={orderTypes}
        tableName="exercise_type"
        resultName="exercise"
        title="Exercise Types"
        subtitle="View all Exercise Types"
        className={
          "grid grid-cols-2 gap-x-4 gap-y-6 xs:grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-9"
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
          result.group && {
            title: "group",
            value: result.group,
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
          {
            jsx: (
              <MyLink
                onClick={(e) => {
                  _setSelectedExerciseType(result);
                }}
                href={`/dashboard/exercises?exercise-type=${result.id}`}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
              >
                View
              </MyLink>
            ),
          },
          {
            jsx: (
              <MyLink
                onClick={(e) => {
                  _setSelectedExerciseType(result);
                }}
                href={`/dashboard/progress?exercise-type=${result.id}${
                  selectedClient ? `&client=${selectedClient.client_email}` : ""
                }`}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Progress
              </MyLink>
            ),
          },
        ]}
      ></Table>
    </>
  );
}

ExerciseTypes.getLayout = getDashboardLayout;
