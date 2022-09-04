import { useEffect, useState } from "react";
import { useUser } from "../../context/user-context";
import Notification from "../../components/Notification";
import { getDashboardLayout } from "../../components/layouts/DashboardLayout";
import ExerciseModal from "../../components/dashboard/modal/ExerciseModal";
import DeleteExerciseModal from "../../components/dashboard/modal/DeleteExerciseModal";
import Table from "../../components/Table";
import ExerciseTypesSelect from "../../components/dashboard/modal/ExerciseTypesSelect";
import { useClient } from "../../context/client-context";
import { muscles, muscleGroups } from "../../utils/exercise-utils";
import ExerciseTypeVideo from "../../components/ExerciseTypeVideo";
import { useExerciseVideos } from "../../context/exercise-videos-context";
import YouTube from "react-youtube";
import GoogleDriveVideo from "../../components/GoogleDriveVideo";
import { useSelectedExerciseType } from "../../context/selected-exercise-context";
import MyLink from "../../components/MyLink";
import { timeToDate, stringToDate } from "../../utils/supabase";

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
    value: [
      ["date", { ascending: false }],
      ["time", { ascending: true }],
      ["created_at", { ascending: true }],
    ],
    current: true,
  },
  {
    label: "Date (Oldest)",
    query: "date-oldest",
    value: [
      ["date", { ascending: false }],
      ["time", { ascending: false }],
      ["created_at", { ascending: true }],
    ],
    current: false,
  },
];

export default function Exercises() {
  const { user } = useUser();

  const { exerciseVideos, getExerciseVideo } = useExerciseVideos();

  const { selectedClientId, selectedClient, setSelectedDate, amITheClient } =
    useClient();

  const [showEditExerciseModal, setShowEditExerciseModal] = useState(false);
  const [editExerciseStatus, setEditExerciseStatus] = useState(false);
  const [showEditExerciseNotification, setShowEditExerciseNotification] =
    useState(false);

  const [selectedExercise, setSelectedExercise] = useState();
  const {
    selectedExerciseType,
    setSelectedExerciseType,
    selectedExerciseTypeName,
    setSelectedExerciseTypeName,
  } = useSelectedExerciseType();

  const [exercises, setExercises] = useState();
  const [baseFilter, setBaseFilter] = useState();
  useEffect(() => {
    if (!selectedClientId) {
      return;
    }

    const newBaseFilter = {
      client: selectedClientId,
    };

    if (selectedExerciseType) {
      newBaseFilter["type.name"] = selectedExerciseType.name;
    }
    setBaseFilter(newBaseFilter);
  }, [selectedClientId, user, selectedExerciseType]);

  const clearFiltersListener = () => {
    setSelectedExerciseType();
  };

  useEffect(() => {
    if (exercises) {
      getExerciseVideo(exercises.map((exercise) => exercise.type.id));
    }
  }, [exercises]);

  const [video, setVideo] = useState({});
  const [videoPlayer, setVideoPlayer] = useState({});
  useEffect(() => {
    if (exercises) {
      const newVideo = { ...video };
      exercises.forEach((exercise) => {
        if (!newVideo[exercise.id] && exercise.video !== null) {
          newVideo[exercise.id] = exercise.video.map((video) =>
            JSON.parse(video)
          );
        }
      });
      setVideo(newVideo);
      setVideoPlayer({});
    }
  }, [exercises]);

  const modalListener = (isAnyModalOpen) => {
    if (isAnyModalOpen) {
      for (let id in videoPlayer) {
        videoPlayer[id].forEach((player) => player?.pauseVideo());
      }
      setShowEditExerciseModal(false);
      clearNotifications();
    } else {
      for (let id in videoPlayer) {
        videoPlayer[id].forEach((player) => player?.playVideo());
      }
    }
  };

  const clearNotifications = () => {
    setShowEditExerciseNotification(false);
  };

  const [refreshResults, setRefreshResults] = useState(false);

  useEffect(() => {
    if (editExerciseStatus?.type === "succeeded") {
      setRefreshResults(true);
    }
  }, [editExerciseStatus]);

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
        refreshResults={refreshResults}
        setRefreshResults={setRefreshResults}
        clearFiltersListener={clearFiltersListener}
        includeClientSelect={true}
        baseFilter={baseFilter}
        numberOfResultsPerPage={10}
        resultsListener={setExercises}
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
        subtitle={`View ${
          selectedClient ? `${selectedClient.client_email}'s` : "your"
        } ${
          selectedExerciseType
            ? `progress doing ${selectedExerciseType.name}`
            : "exercises"
        }`}
        DeleteResultModal={amITheClient && DeleteExerciseModal}
        resultMap={(exercise, index) => [
          {
            title: "name",
            value: exercise.type.name,
          },
          !selectedExerciseType &&
            exercise.type.id in exerciseVideos && {
              jsx: (
                <ExerciseTypeVideo
                  exerciseTypeId={exercise.type.id}
                  fetchVideo={false}
                ></ExerciseTypeVideo>
              ),
            },
          {
            title: "date",
            value: stringToDate(exercise.date).toDateString(),
          },
          exercise.time && {
            title: "time",
            value: timeToDate(exercise.time).toLocaleTimeString([], {
              timeStyle: "short",
            }),
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
          exercise.number_of_reps_assigned?.some((value) => value > 0) && {
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
          exercise.set_duration_assigned?.some((value) => value > 0) && {
            title: "set duration (min)",
            value:
              exercise.set_duration_performed === null
                ? exercise.set_duration_assigned.join(", ")
                : exercise.set_duration_performed
                    .map(
                      (setDurationPerformed, index) =>
                        `${setDurationPerformed}/${
                          exercise.set_duration_assigned[index] ||
                          exercise.set_duration_assigned[0]
                        }`
                    )
                    .join(", "),
          },

          exercise.speed_assigned?.some((value) => value > 0) && {
            title: "speed (mph)",
            value:
              exercise.speed_performed === null
                ? exercise.speed_assigned.join(", ")
                : exercise.speed_performed
                    .map(
                      (speedPerformed, index) =>
                        `${speedPerformed}/${
                          exercise.speed_assigned[index] ||
                          exercise.speed_assigned[0]
                        }`
                    )
                    .join(", "),
          },
          exercise.level_assigned?.some((value) => value > 0) && {
            title: "level",
            value:
              exercise.level_performed === null
                ? exercise.level_assigned.join(", ")
                : exercise.level_performed
                    .map(
                      (levelPerformed, index) =>
                        `${levelPerformed}/${
                          exercise.level_assigned[index] ||
                          exercise.level_assigned[0]
                        }`
                    )
                    .join(", "),
          },
          exercise.distance_assigned?.some((value) => value > 0) && {
            title: `distance (${exercise.distance_unit})`,
            value:
              exercise.distance_performed === null
                ? exercise.distance_assigned.join(", ")
                : exercise.distance_performed
                    .map(
                      (distancePerformed, index) =>
                        `${distancePerformed}/${
                          exercise.distance_assigned[index] ||
                          exercise.distance_assigned[0]
                        }`
                    )
                    .join(", "),
          },
          exercise.weight_assigned?.some((value) => value > 0) && {
            title: `weight (${exercise.is_weight_in_kilograms ? "kg" : "lbs"})`,
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
          exercise.rest_duration?.some((value) => value > 0) && {
            title: "rest duration (min)",
            value: exercise.rest_duration.join(", "),
          },
          exercise.difficulty !== null && {
            title: "difficulty",
            value: exercise.difficulty.map((value) => `${value}/10`).join(", "),
          },
          ...(video[exercise.id]?.map(
            (video, index) =>
              video && {
                jsx: video.isGoogleDriveVideo ? (
                  <GoogleDriveVideo
                    videoId={video.videoId}
                    className="w-full rounded-lg"
                  ></GoogleDriveVideo>
                ) : (
                  <YouTube
                    videoId={video.videoId}
                    className=""
                    iframeClassName="rounded-lg"
                    opts={{
                      height: "100%",
                      width: "100%",
                      playerVars: {
                        autoplay: 0,
                        loop: 1,
                        playsinline: 1,
                        modestbranding: 1,
                        controls: 1,
                        enablejsapi: 1,
                        start: video.start || 0,
                        end: video.end,
                      },
                    }}
                    onReady={(e) => {
                      e.target.mute();
                      console.log("player", e.target);
                      console.log(video);
                      const newVideoPlayer = { ...videoPlayer };
                      newVideoPlayer[exercise.id] =
                        newVideoPlayer[exercise.id] || [];
                      newVideoPlayer[exercise.id][index] = e.target;
                      setVideoPlayer(newVideoPlayer);
                    }}
                    onEnd={(e) => {
                      e.target.seekTo(video.start || 0);
                      e.target.playVideo();
                    }}
                  ></YouTube>
                ),
              }
          ) || []),
          exercise.notes?.length > 0 && {
            title: "notes",
            value: exercise.notes,
          },
          exercise.feedback?.length > 0 && {
            title: "feedback",
            value: exercise.feedback,
          },
          {
            jsx: (
              <button
                onClick={() => {
                  setSelectedExercise(exercise);
                  setShowEditExerciseModal(true);
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
                  setSelectedDate(stringToDate(exercise.date));
                }}
                href={`/dashboard/diary?date=${stringToDate(
                  exercise.date
                ).toDateString()}${
                  selectedClient ? `&client=${selectedClient.client_email}` : ""
                }`}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Diary
              </MyLink>
            ),
          },
          {
            jsx: (
              <MyLink
                onClick={() => {
                  setSelectedExerciseType(exercise.type);
                }}
                href={`/dashboard/progress?exercise-type=${exercise.type.id}${
                  selectedClient ? `&client=${selectedClient.client_email}` : ""
                }`}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Progress
              </MyLink>
            ),
          },
        ]}
        filterChildren={
          <ExerciseTypesSelect
            selectedExerciseType={selectedExerciseType}
            setSelectedExerciseType={setSelectedExerciseType}
            selectedExerciseTypeName={selectedExerciseTypeName}
            setSelectedExerciseTypeName={setSelectedExerciseTypeName}
          />
        }
        modalListener={modalListener}
      ></Table>
    </>
  );
}

Exercises.getLayout = getDashboardLayout;
