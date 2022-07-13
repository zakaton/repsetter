import AccountCalendarLayout from "../../components/layouts/AccountCalendarLayout";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import { useClient } from "../../context/client-context";
import ExerciseModal from "../../components/account/modal/ExerciseModal";
import DeleteExerciseModal from "../../components/account/modal/DeleteExerciseModal";
import DeleteWeightModal from "../../components/account/modal/DeleteWeightModal";
import WeightModal from "../../components/account/modal/WeightModal";
import React, { useEffect, useState } from "react";
import Notification from "../../components/Notification";
import { supabase } from "../../utils/supabase";
import { useUser } from "../../context/user-context";
import { useExerciseVideos } from "../../context/exercise-videos-context";
import LazyVideo from "../../components/LazyVideo";
import YouTube from "react-youtube";
import {
  PaperClipIcon,
  PlusIcon,
  ClipboardIcon,
} from "@heroicons/react/outline";
import {
  kilogramsToPounds,
  poundsToKilograms,
} from "../../utils/exercise-utils";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Diary() {
  const { user } = useUser();
  const { exerciseVideos, getExerciseVideo } = useExerciseVideos();
  const {
    selectedClient,
    selectedDate,
    amITheClient,
    selectedClientId,
    getSelectedDate,
  } = useClient();

  useEffect(() => {
    if (!selectedDate) {
      getSelectedDate();
    }
  }, []);

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
      setVideo({});
      setVideoPlayer({});
      setExercises(exercises);
      setGotExerciseForUserId(selectedClientId);
      setGotExerciseForDate(selectedDate);
    }
    setIsGettingExercises(false);
  };

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

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
          getExerciseDates();
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
          getExerciseDates();
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

  const [calendar, setCalendar] = useState();
  const [lastSelectedDate, setLastSelectedDate] = useState();
  const [exerciseDates, setExerciseDates] = useState();
  const getExerciseDates = async () => {
    console.log(
      "getting exercise dates for the month",
      calendar[0].toDateString(),
      calendar[calendar.length - 1].toDateString()
    );
    const { data: exerciseDates, error } = await supabase
      .rpc("get_exercise_dates", {
        email: amITheClient ? user.email : selectedClient.client_email,
      })
      .gte("date", calendar[0].toDateString())
      .lte("date", calendar[calendar.length - 1].toDateString());
    if (error) {
      console.error(error);
    } else {
      console.log("exerciseDates", exerciseDates);
      setExerciseDates(exerciseDates);
    }
  };
  const [weightDates, setWeightDates] = useState();
  const getWeightDates = async () => {
    console.log(
      "getting weight dates for the month",
      calendar[0].toDateString(),
      calendar[calendar.length - 1].toDateString()
    );
    const { data: weightDates, error } = await supabase
      .rpc("get_weight_dates", {
        email: amITheClient ? user.email : selectedClient.client_email,
      })
      .gte("date", calendar[0].toDateString())
      .lte("date", calendar[calendar.length - 1].toDateString());
    if (error) {
      console.error(error);
    } else {
      console.log("weightDates", weightDates);
      setWeightDates(weightDates);
    }
  };
  useEffect(() => {
    if (
      calendar &&
      selectedDate &&
      (!lastSelectedDate ||
        lastSelectedDate.getUTCFullYear() !== selectedDate.getUTCFullYear() ||
        lastSelectedDate.getUTCMonth() !== selectedDate.getUTCMonth())
    ) {
      setLastSelectedDate(selectedDate);
      getExerciseDates();
      getWeightDates();
    }
  }, [calendar]);

  const [datesDots, setDatesDots] = useState({});
  useEffect(() => {
    if (exerciseDates || weightDates) {
      const newDatesDots = {};
      weightDates?.forEach((weightDate) => {
        const dots = newDatesDots[weightDate.date] || [];
        dots.push({ color: "bg-yellow-500" });
        newDatesDots[weightDate.date] = dots;
      });
      exerciseDates?.forEach((exerciseDate) => {
        const dots = newDatesDots[exerciseDate.date] || [];
        dots.push({ color: "bg-blue-500" });
        newDatesDots[exerciseDate.date] = dots;
      });
      setDatesDots(newDatesDots);
    }
  }, [exerciseDates, weightDates]);

  const [copiedExercises, setCopiedExercises] = useState();
  const copyExercises = () => {
    if (exercises?.length > 0) {
      setCopiedExercises(exercises);
    }
  };
  const [isPastingExercises, setIsPastingExercises] = useState(false);
  const pasteExercises = async () => {
    if (isPastingExercises) {
      return;
    }
    if (copiedExercises) {
      setIsPastingExercises(true);
      const uniqueExercises = copiedExercises.filter(
        (copiedExercise) =>
          !exercises?.find(
            (exercise) => exercise.type.id === copiedExercise.type.id
          )
      );
      const newExercises = uniqueExercises.map((uniqueExercise) => {
        const {
          client,
          client_email,

          coach,
          coach_email,

          number_of_sets_assigned,
          number_of_reps_assigned,
          is_weight_in_kilograms,
          weight_assigned,
        } = uniqueExercise;

        const insertedExercise = {
          type: uniqueExercise.type.id,

          date: selectedDate.toDateString(),

          client,
          client_email,

          number_of_sets_assigned,
          number_of_reps_assigned,
          is_weight_in_kilograms,
          weight_assigned,
        };

        if (coach && coach_email) {
          Object.assign(insertedExercise, { coach, coach_email });
        }

        return insertedExercise;
      });
      console.log("newExercises", newExercises);
      const { data: pastedExercises, error } = await supabase
        .from("exercise")
        .insert(newExercises);
      if (error) {
        console.error(error);
      } else {
        console.log("pastedExercises", pastedExercises);
      }
      setIsPastingExercises(false);
      getExerciseDates();
    }
  };

  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showWeightNotification, setShowWeightNotification] = useState(false);
  const [weightStatus, setWeightStatus] = useState();

  const [showDeleteWeightModal, setShowDeleteWeightModal] = useState(false);
  const [showDeleteWeightNotification, setShowDeleteWeightNotification] =
    useState(false);
  const [deleteWeightStatus, setDeleteWeightStatus] = useState();

  const [selectedWeight, setSelectedWeight] = useState();
  const [gotWeightForUserId, setGotWeightForUserId] = useState();
  const [gotWeightForDate, setGotWeightForDate] = useState();
  const [weights, setWeights] = useState();
  const [isGettingWeights, setIsGettingWeights] = useState(false);
  const [lastWeightBeforeToday, setLastWeightBeforeToday] = useState();
  const getWeights = async (refresh) => {
    if (weights && !refresh) {
      return;
    }
    if (!selectedClientId) {
      return;
    }
    if (isGettingWeights) {
      return;
    }
    console.log("getting weights for date", selectedDate.toDateString());
    setIsGettingWeights(true);
    const matchFilters = {
      client: selectedClientId,
      date: selectedDate.toDateString(),
    };
    console.log("matchFilters", matchFilters);
    const { data: weights, error } = await supabase
      .from("weight")
      .select("*")
      .match(matchFilters)
      .order("time", { ascending: true });
    if (error) {
      console.error(error);
    } else {
      console.log("got weights for date", selectedDate.toDateString(), weights);
      setWeights(weights);
      setGotWeightForUserId(selectedClientId);
      setGotWeightForDate(selectedDate);

      const {
        data: lastWeightBeforeToday,
        error: getLastWeightBeforeTodayError,
      } = await supabase
        .from("weight")
        .select("*")
        .match({ client: selectedClientId })
        .lt("date", selectedDate.toDateString())
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (getLastWeightBeforeTodayError) {
        console.error(getLastWeightBeforeTodayError);
      } else {
        console.log("lastWeightBeforeToday", lastWeightBeforeToday);
        setLastWeightBeforeToday(lastWeightBeforeToday);
      }
    }
    setIsGettingWeights(false);
  };

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    if (!weights) {
      getWeights();
    } else if (
      gotWeightForUserId != selectedClientId ||
      selectedDate != gotWeightForDate
    ) {
      getWeights(true);
    }
  }, [weights, selectedClientId, selectedClient, selectedDate]);

  useEffect(() => {
    if (weights) {
      console.log(`subscribing to weight updates`);
      const subscription = supabase
        .from(`weight:date=eq.${selectedDate.toDateString()}`)
        .on("INSERT", (payload) => {
          console.log(`new weight`, payload);
          getWeights(true);
          getWeightDates();
        })
        .on("UPDATE", (payload) => {
          console.log(`updated weight`, payload);
          getWeights(true);
        })
        .on("DELETE", (payload) => {
          console.log(`deleted weight`, payload);
          const deletedWeight = payload.old;
          // eslint-disable-next-line no-shadow
          setWeights(
            weights.filter((weight) => weight?.id !== deletedWeight.id)
          );
          getWeightDates();
        })
        .subscribe();
      return () => {
        console.log("unsubscribing to weight updates");
        supabase.removeSubscription(subscription);
      };
    }
  }, [weights]);

  const [isUsingKilograms, setIsUsingKilograms] = useState(false);

  const formatTime = (time) => {
    let [hours, minutes] = time.split(":");
    let suffix = "AM";
    if (hours >= 12) {
      suffix = "PM";
      if (hours > 12) {
        hours -= 12;
      }
    }
    return `${hours}:${minutes} ${suffix}`;
  };

  const clearNotifications = () => {
    setShowAddExerciseNotification(false);
    setShowDeleteExerciseNotification(false);
    setShowEditExerciseNotification(false);
    setShowWeightNotification(false);
    setShowDeleteWeightNotification(false);
  };
  useEffect(() => {
    if (
      showAddExerciseModal ||
      showDeleteExerciseModal ||
      showEditExerciseModal ||
      showWeightModal ||
      showDeleteWeightModal
    ) {
      clearNotifications();
    }
  }, [
    showAddExerciseModal,
    showDeleteExerciseModal,
    showEditExerciseModal,
    showWeightModal,
    showDeleteWeightModal,
  ]);

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

      <WeightModal
        open={showWeightModal}
        setOpen={setShowWeightModal}
        selectedResult={selectedWeight}
        setSelectedResult={setSelectedWeight}
        existingResults={weights}
        setResultStatus={setWeightStatus}
        setShowResultNotification={setShowWeightNotification}
        lastWeightBeforeToday={lastWeightBeforeToday}
      />
      <Notification
        open={showWeightNotification}
        setOpen={setShowWeightNotification}
        status={weightStatus}
      />

      <DeleteWeightModal
        open={showDeleteWeightModal}
        setOpen={setShowDeleteWeightModal}
        selectedResult={selectedWeight}
        setSelectedResult={setSelectedWeight}
        setDeleteResultStatus={setDeleteWeightStatus}
        setShowDeleteResultNotification={setShowDeleteWeightNotification}
      />
      <Notification
        open={showDeleteWeightNotification}
        setOpen={setShowDeleteWeightNotification}
        status={deleteWeightStatus}
      />

      <AccountCalendarLayout
        setCalendar={setCalendar}
        tableName="diary"
        resultNamePlural="diary"
        subtitle="View and edit your weight, pictures, and exercises"
        datesDots={datesDots}
      >
        <div className="relative">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="relative flex justify-start">
              <span className="bg-white pr-2 text-base text-yellow-600">
                Bodyweight
              </span>
            </div>
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-end sm:justify-center">
            <span className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
              {amITheClient && !weights?.some((weight) => weight.time == null) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedWeight();
                    setShowWeightModal(true);
                  }}
                  className={classNames(
                    "relative inline-flex items-center border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                    "rounded-l-md"
                  )}
                >
                  <span className="sr-only">Add Weight</span>
                  <PlusIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsUsingKilograms(!isUsingKilograms)}
                className={classNames(
                  "relative inline-flex items-center border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                  !weights?.some((weight) => weight.time == null)
                    ? "rounded-r-md"
                    : "rounded-md"
                )}
              >
                <span className="sr-only">Toggle Weight</span>
                {isUsingKilograms ? "kg" : "lbs"}
              </button>
            </span>
          </div>
        </div>
        {weights
          ?.slice()
          .sort((a, b) => {
            const [aHour, aMinute, aCreated_at] = a.time.split(":");
            const [bHour, bMinute, bCreated_at] = b.time.split(":");
            if (aHour != bHour) {
              return aHour - bHour;
            } else if (aMinute != bMinute) {
              return aMinute - bMinute;
            } else {
              return aCreated_at - bCreated_at;
            }
          })
          .map((weight, index, weights) => {
            let previousWeight;
            if (index === 0) {
              previousWeight = lastWeightBeforeToday;
            } else {
              previousWeight = weights[index - 1];
            }
            let weightDifference;
            if (previousWeight) {
              let previousWeightValue = previousWeight.weight;
              if (
                weight.is_weight_in_kilograms !==
                previousWeight.is_weight_in_kilograms
              ) {
                previousWeightValue = weight.is_weight_in_kilograms
                  ? poundsToKilograms(previousWeightValue)
                  : kilogramsToPounds(previousWeightValue);
              }
              weightDifference = weight.weight - previousWeightValue;
            }
            return (
              <div
                key={weight.id}
                className={classNames(
                  "py-5",
                  index === 0 ? "" : "border-gray-20 border-t"
                )}
              >
                <dl
                  className={
                    "grid grid-cols-3 gap-x-4 gap-y-6 xs:grid-cols-4 sm:grid-cols-5"
                  }
                >
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Weight
                    </dt>
                    <dd className="mt-1 break-words text-sm text-gray-900">
                      {weight.is_weight_in_kilograms == isUsingKilograms
                        ? weight.weight
                        : (isUsingKilograms
                            ? poundsToKilograms(weight.weight)
                            : kilogramsToPounds(weight.weight)
                          ).toFixed(1)}{" "}
                      {isUsingKilograms ? "kgs" : "lbs"}{" "}
                      {previousWeight && (
                        <span
                          className={
                            weightDifference < 0
                              ? "text-red-500"
                              : "text-green-500"
                          }
                        >
                          ({weightDifference < 0 ? "" : "+"}
                          {weightDifference})
                        </span>
                      )}
                    </dd>
                  </div>
                  {weight.time !== null && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Time
                      </dt>
                      <dd className="mt-1 break-words text-sm text-gray-900">
                        {formatTime(weight.time)}
                      </dd>
                    </div>
                  )}
                  {weight.time !== null && weight.event !== null && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Event
                      </dt>
                      <dd className="mt-1 break-words text-sm text-gray-900">
                        {weight.event}
                      </dd>
                    </div>
                  )}
                  {amITheClient && (
                    <div className="sm:col-span-1">
                      <button
                        onClick={() => {
                          setSelectedWeight(weight);
                          setShowWeightModal(true);
                        }}
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        Edit<span className="sr-only"> weight</span>
                      </button>
                    </div>
                  )}
                  {amITheClient && (
                    <div className="sm:col-span-1">
                      <button
                        onClick={() => {
                          setSelectedWeight(weight);
                          setShowDeleteWeightModal(true);
                        }}
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-1.5 px-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        Delete
                        <span className="sr-only"> weight</span>
                      </button>
                    </div>
                  )}
                </dl>
              </div>
            );
          })}
        <div className="relative pt-2">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="relative flex justify-start">
              <span className="bg-white pr-2 text-base text-blue-500">
                Exercises
              </span>
            </div>
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-end sm:justify-center">
            <span className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setShowAddExerciseModal(true)}
                className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <span className="sr-only">Add</span>
                <PlusIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => {
                  copyExercises();
                }}
                disabled={exercises?.length === 0}
                className={classNames(
                  "relative inline-flex items-center border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-400",
                  exercises?.length > 0
                    ? "hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    : "bg-gray-100"
                )}
              >
                <span className="sr-only">Copy</span>
                <PaperClipIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled={!(copiedExercises?.length > 0)}
                onClick={() => {
                  pasteExercises();
                }}
                className={classNames(
                  "relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-400",
                  copiedExercises?.length > 0
                    ? "hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    : "bg-gray-100"
                )}
              >
                <span className="sr-only">Paste</span>
                <ClipboardIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </span>
          </div>
        </div>
        {exercises?.map((exercise, index) => (
          <div
            key={exercise.id}
            className={classNames(
              "pt-5",
              index === 0 ? "" : "border-gray-20 border-t"
            )}
          >
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
                  width="100%"
                  height="100%"
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
                      {exercise.weight_performed
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
              {exercise.difficulty !== null && (
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

Diary.getLayout = getAccountLayout;
