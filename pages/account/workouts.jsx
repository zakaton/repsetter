import AccountCalendarLayout from "../../components/layouts/AccountCalendarLayout";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import { useClient } from "../../context/client-context";
import ExerciseModal from "../../components/account/modal/ExerciseModal";
import DeleteExerciseModal from "../../components/account/modal/DeleteExerciseModal";
import React, { useEffect, useState } from "react";
import Notification from "../../components/Notification";
import { supabase } from "../../utils/supabase";
import { useUser } from "../../context/user-context";
import { useExerciseVideos } from "../../context/exercise-videos-context";
import LazyVideo from "../../components/LazyVideo";
import YouTube from "react-youtube";

export default function Workouts() {
  const { user } = useUser();
  const { exerciseVideos, getExerciseVideo } = useExerciseVideos();
  const { selectedClient, selectedDate, amITheClient, selectedClientId } =
    useClient();

  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showAddExerciseNotification, setShowAddExerciseNotification] =
    useState(false);
  const [addExerciseStatus, setAddExerciseStatus] = useState();

  const [showDeleteExerciseModal, setShowDeleteExerciseModal] = useState(false);
  const [showDeleteExerciseNotification, setShowDeleteExerciseNotification] =
    useState(false);
  const [deleteExerciseStatus, setDeleteExerciseStatus] = useState();

  const [showEditExerciseModal, setShowEditExerciseModal] = useState(false);
  const [showEditExerciseNotification, setShowEditExerciseNotification] =
    useState(false);
  const [editExerciseStatus, setEditExerciseStatus] = useState();

  const [selectedExercise, setSelectedExercise] = useState();

  const [gotExerciseForUserId, setGotExerciseForUserId] = useState();
  const [gotExerciseForDate, setGotExerciseForDate] = useState();

  const [exercises, setExercises] = useState();
  const [isGettingExercises, setIsGettingExercises] = useState(false);
  const getExercises = async (refresh) => {
    if (exercises && !refresh) {
      return;
    }
    if (!selectedClientId) {
      return;
    }
    if (isGettingExercises) {
      return;
    }
    console.log("getting exercises for date", selectedDate.toDateString());
    setIsGettingExercises(true);
    const matchFilters = {
      client: selectedClientId,
      date: selectedDate.toDateString(),
    };
    if (!amITheClient) {
      matchFilters.coach = user.id;
    }
    console.log("matchFilters", matchFilters);
    const { data: exercises, error } = await supabase
      .from("exercise")
      .select("*, type(*)")
      .match(matchFilters);
    if (error) {
      console.error(error);
    } else {
      console.log(
        "got exercises for date",
        selectedDate.toDateString(),
        exercises
      );
      setExercises(exercises);
      setGotExerciseForUserId(selectedClientId);
      setGotExerciseForDate(selectedDate);
    }
    setIsGettingExercises(false);
  };

  useEffect(() => {
    if (!exercises) {
      getExercises();
    } else if (
      gotExerciseForUserId != selectedClientId ||
      selectedDate != gotExerciseForDate
    ) {
      getExercises(true);
    }
  }, [exercises, selectedClientId, selectedClient, selectedDate]);

  useEffect(() => {
    if (exercises) {
      console.log(`subscribing to exercise updates`);
      const subscription = supabase
        .from(`exercise:date=eq.${selectedDate.toDateString()}`)
        .on("INSERT", (payload) => {
          console.log(`new exercise`, payload);
          getExercises(true);
        })
        .on("UPDATE", (payload) => {
          console.log(`updated exercise`, payload);
          getExercises(true);
        })
        .on("DELETE", (payload) => {
          console.log(`deleted exercise`, payload);
          const deletedExercise = payload.old;
          // eslint-disable-next-line no-shadow
          setExercises(
            exercises.filter((exercise) => exercise?.id !== deletedExercise.id)
          );
        })
        .subscribe();
      return () => {
        console.log("unsubscribing to exercise updates");
        supabase.removeSubscription(subscription);
      };
    }
  }, [exercises]);

  useEffect(() => {
    if (exercises) {
      exercises.forEach((exercise) => getExerciseVideo(exercise.type.id));
    }
  }, [exercises]);

  const clearNotifications = () => {
    setShowAddExerciseNotification(false);
    setShowDeleteExerciseNotification(false);
    setShowEditExerciseNotification(false);
  };
  useEffect(() => {
    if (
      showAddExerciseModal ||
      showDeleteExerciseModal ||
      showEditExerciseModal
    ) {
      clearNotifications();
    }
  }, [showAddExerciseModal, showDeleteExerciseModal, showEditExerciseModal]);

  const [videoPlayer, setVideoPlayer] = useState({});
  useEffect(() => {
    if (
      showAddExerciseModal ||
      showDeleteExerciseModal ||
      showEditExerciseModal
    ) {
      for (let id in videoPlayer) {
        videoPlayer[id].forEach((player) => player?.pauseVideo());
      }
    } else {
      for (let id in videoPlayer) {
        videoPlayer[id].forEach((player) => player?.playVideo());
      }
    }
  }, [showAddExerciseModal, showDeleteExerciseModal, showEditExerciseModal]);

  const [video, setVideo] = useState({});
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
    }
  }, [exercises]);

  return (
    <>
      <ExerciseModal
        open={showAddExerciseModal}
        setOpen={setShowAddExerciseModal}
        setCreateResultStatus={setAddExerciseStatus}
        setShowCreateResultNotification={setShowAddExerciseNotification}
        existingExercises={exercises}
      />
      <Notification
        open={showAddExerciseNotification}
        setOpen={setShowAddExerciseNotification}
        status={addExerciseStatus}
      />

      <DeleteExerciseModal
        open={showDeleteExerciseModal}
        setOpen={setShowDeleteExerciseModal}
        selectedResult={selectedExercise}
        setSelectedResult={setSelectedExercise}
        setDeleteResultStatus={setDeleteExerciseStatus}
        setShowDeleteResultNotification={setShowDeleteExerciseNotification}
      />
      <Notification
        open={showDeleteExerciseNotification}
        setOpen={setShowDeleteExerciseNotification}
        status={deleteExerciseStatus}
      />

      <ExerciseModal
        open={showEditExerciseModal}
        setOpen={setShowEditExerciseModal}
        selectedResult={selectedExercise}
        setSelectedResult={setSelectedExercise}
        setEditResultStatus={setEditExerciseStatus}
        setShowEditResultNotification={setShowEditExerciseNotification}
        existingExercises={exercises}
      />
      <Notification
        open={showEditExerciseNotification}
        setOpen={setShowEditExerciseNotification}
        status={editExerciseStatus}
      />

      <AccountCalendarLayout
        tableName="workout"
        underCalendar={
          <div className="flex gap-x-3">
            <button
              type="button"
              onClick={() => setShowAddExerciseModal(true)}
              className="mt-4 w-full rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Exercise
            </button>
          </div>
        }
      >
        {exercises?.map((exercise) => (
          <div key={exercise.id} className="border-t border-gray-200 py-5">
            <dl
              className={
                "grid grid-cols-1 gap-x-4 gap-y-6 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              }
            >
              <div className="sm:col-span-1">
                <LazyVideo
                  onSuspend={(e) => {
                    document.addEventListener("click", () => e.target.play(), {
                      once: true,
                    });
                  }}
                  width="100"
                  className="aspect-[4/3]"
                  src={exerciseVideos[exercise.type.id]?.url}
                  muted={true}
                  playsInline={true}
                  autoPlay={true}
                  loop={true}
                ></LazyVideo>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 break-words text-sm text-gray-900">
                  {exercise.type.name}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Muscles Used
                </dt>
                <dd className="mt-1 break-words text-sm text-gray-900">
                  {exercise.type.muscles.join(", ")}
                </dd>
              </div>
              {amITheClient && exercise.coach_email && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Coach</dt>
                  <dd className="mt-1 break-words text-sm text-gray-900">
                    {exercise.coach_email}
                  </dd>
                </div>
              )}
              {exercise.number_of_sets_performed === null && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Sets</dt>
                  <dd className="mt-1 break-words text-sm text-gray-900">
                    {exercise.number_of_sets_assigned}
                  </dd>
                </div>
              )}
              {exercise.number_of_sets_performed !== null && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Sets</dt>
                  <dd className="mt-1 break-words text-sm text-gray-900">
                    {exercise.number_of_sets_performed}/
                    {exercise.number_of_sets_assigned}
                  </dd>
                </div>
              )}
              {exercise.number_of_reps_performed === null && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Reps</dt>
                  <dd className="mt-1 break-words text-sm text-gray-900">
                    {exercise.number_of_reps_assigned
                      .map((reps) => (reps == 0 ? "amrap" : reps))
                      .join(", ")}
                  </dd>
                </div>
              )}
              {exercise.number_of_reps_performed !== null && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Reps</dt>
                  <dd className="mt-1 break-words text-sm text-gray-900">
                    {exercise.number_of_reps_performed
                      .map(
                        (numberOfReps, index) =>
                          `${numberOfReps}/${
                            exercise.number_of_reps_assigned[index] ||
                            exercise.number_of_reps_assigned[0]
                          }`
                      )
                      .join(", ")}
                  </dd>
                </div>
              )}
              {exercise.weight_assigned.some((weight) => weight > 0) &&
                exercise.weight_performed === null && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Weight ({exercise.is_weight_in_kilograms ? "kg" : "lbs"})
                    </dt>
                    <dd className="mt-1 break-words text-sm text-gray-900">
                      {exercise.weight_assigned.join(", ")}
                    </dd>
                  </div>
                )}
              {exercise.weight_assigned.some((weight) => weight > 0) &&
                exercise.weight_performed !== null && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Weight ({exercise.is_weight_in_kilograms ? "kg" : "lbs"})
                    </dt>
                    <dd className="mt-1 break-words text-sm text-gray-900">
                      {exercise.number_of_reps_performed
                        .map(
                          (weight, index) =>
                            `${weight}/${
                              exercise.weight_assigned[index] ||
                              exercise.weight_assigned[0]
                            }`
                        )
                        .join(", ")}
                    </dd>
                  </div>
                )}
              {exercise.number_of_reps_performed !== null && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Difficulty
                  </dt>
                  <dd className="mt-1 break-words text-sm text-gray-900">
                    {exercise.difficulty
                      .map((value) => `${value}/10`)
                      .join(", ")}
                  </dd>
                </div>
              )}
              {video[exercise.id]?.map(
                (video, index) =>
                  video && (
                    <React.Fragment key={index}>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Set #{index + 1}
                        </dt>
                        <dd className="mt-1 break-words text-sm text-gray-900">
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
                        </dd>
                      </div>
                    </React.Fragment>
                  )
              )}
              <div className="sm:col-span-1">
                <button
                  onClick={() => {
                    setSelectedExercise(exercise);
                    setShowEditExerciseModal(true);
                  }}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Edit<span className="sr-only"> exercise</span>
                </button>
              </div>
              <div className="sm:col-span-1">
                <button
                  onClick={() => {
                    setSelectedExercise(exercise);
                    setShowDeleteExerciseModal(true);
                  }}
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-1.5 px-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Delete
                  <span className="sr-only"> exercise</span>
                </button>
              </div>
            </dl>
          </div>
        ))}
      </AccountCalendarLayout>
    </>
  );
}

Workouts.getLayout = getAccountLayout;
