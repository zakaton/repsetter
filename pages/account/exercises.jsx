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
import { muscles, muscleGroups, timeToDate } from "../../utils/exercise-utils";
import ExerciseTypeVideo from "../../components/ExerciseTypeVideo";
import { useExerciseVideos } from "../../context/exercise-videos-context";
import YouTube from "react-youtube";
import { useSelectedExerciseType } from "../../context/selected-exercise-context";
import MyLink from "../../components/MyLink";
import { stringToDate } from "../../utils/picture-utils";

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
  const {
    selectedExerciseType,
    setSelectedExerciseType,
    selectedExerciseTypeName,
    setSelectedExerciseTypeName,
  } = useSelectedExerciseType();

  const [exercises, setExercises] = useState();
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
    if (exercises) {
      exercises.forEach((exercise) => getExerciseVideo(exercise.type.id));
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
    } else {
      for (let id in videoPlayer) {
        videoPlayer[id].forEach((player) => player?.playVideo());
      }
    }
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
        DeleteResultModal={isAdmin && DeleteExerciseModal}
        resultMap={(exercise, index) => [
          {
            title: "date",
            value: exercise.date,
          },
          exercise.time && {
            title: "time",
            value: timeToDate(exercise.time).toLocaleTimeString([], {
              timeStyle: "short",
            }),
          },
          !selectedExerciseType &&
            exercise.type.id in exerciseVideos && {
              jsx: (
                <ExerciseTypeVideo
                  width="100px"
                  exerciseTypeId={exercise.type.id}
                ></ExerciseTypeVideo>
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
          ...(video[exercise.id]?.map(
            (video, index) =>
              video && {
                jsx: (
                  <YouTube
                    videoId={video.videoId}
                    className="aspect-[16/9] w-full"
                    iframeClassName="aspect-[16/9] w-full"
                    opts={{
                      height: "100%",
                      width: "100%",
                      playerVars: {
                        autoplay: 1,
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
          {
            jsx: (
              <MyLink
                onClick={() => {
                  setSelectedDate(stringToDate(exercise.date));
                }}
                href={`/account/diary?date=${stringToDate(
                  exercise.date
                ).toDateString()}${
                  selectedClient ? `&client=${selectedClient.client_email}` : ""
                }`}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Full Diary
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

Exercises.getLayout = getAccountLayout;
