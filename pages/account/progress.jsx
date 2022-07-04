import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "../../context/user-context";
import Notification from "../../components/Notification";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import ExerciseModal from "../../components/account/modal/ExerciseModal";
import DeleteExerciseModal from "../../components/account/modal/DeleteExerciseModal";
import Table from "../../components/Table";
import { useExerciseVideos } from "../../context/exercise-videos-context";
import { muscles, muscleGroups } from "../../utils/exercise-utils";
import LazyVideo from "../../components/LazyVideo";
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

  const { selectedClient } = useClient();

  const [showEditExerciseModal, setShowEditExerciseModal] = useState(false);
  const [editExerciseStatus, setEditExerciseStatus] = useState(false);
  const [showEditExerciseNotification, setShowEditExerciseNotification] =
    useState(false);

  const [selectedExercise, setSelectedExercise] = useState();
  const [selectedExerciseType, setSelectedExerciseType] = useState();

  const { exerciseVideos, getExerciseVideo } = useExerciseVideos();
  const [results, setResults] = useState();
  useEffect(() => {
    if (results) {
      results.forEach((result) => {
        getExerciseVideo(result.id);
      });
    }
  }, [results]);

  const [baseFilter, setBaseFilter] = useState({});

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
        subtitle="View your Progress"
        DeleteResultModal={isAdmin && DeleteExerciseModal}
        resultMap={(result) => [
          {
            title: "date",
            value: result.date,
          },
        ]}
        filterChildren={
          <ExerciseTypesSelect
            selectedExerciseType={selectedExerciseType}
            setSelectedExerciseType={setSelectedExerciseType}
            open={true}
          />
        }
      ></Table>
    </>
  );
}

Progress.getLayout = getAccountLayout;
