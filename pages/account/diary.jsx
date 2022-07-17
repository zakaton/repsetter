import React, { useEffect, useState } from "react";
import AccountCalendarLayout from "../../components/layouts/AccountCalendarLayout";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import ExerciseModal from "../../components/account/modal/ExerciseModal";
import DeleteExerciseModal from "../../components/account/modal/DeleteExerciseModal";
import WeightModal from "../../components/account/modal/WeightModal";
import DeleteWeightModal from "../../components/account/modal/DeleteWeightModal";
import PictureModal from "../../components/account/modal/PictureModal";
import DeletePictureModal from "../../components/account/modal/DeletePictureModal";
import Notification from "../../components/Notification";
import { supabase, dateFromDateAndTime } from "../../utils/supabase";
import { useUser } from "../../context/user-context";
import { useClient } from "../../context/client-context";
import { useExerciseVideos } from "../../context/exercise-videos-context";
import LazyVideo from "../../components/LazyVideo";
import YouTube from "react-youtube";
import {
  PaperClipIcon,
  PlusIcon,
  ClipboardIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/outline";
import {
  kilogramsToPounds,
  poundsToKilograms,
} from "../../utils/exercise-utils";
import { dateToString } from "../../utils/picture-utils";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  TimeScale,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { weightEventColors } from "../../utils/weight-utils";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  TimeScale,
  Legend
);

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

  window.s = supabase;
  window.u = user;

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
      getExerciseDates();
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
      getPictureDates();
    }
  }, [calendar]);

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
  const [firstWeightAfterToday, setFirstWeightAfterToday] = useState();
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
      setLastWeightBeforeToday();
      setFirstWeightAfterToday();
      if (weights.length > 0) {
        setIsUsingKilograms(weights[0].is_weight_in_kilograms);
      }
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
        .order("time", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (getLastWeightBeforeTodayError) {
        console.error(getLastWeightBeforeTodayError);
      } else {
        console.log("lastWeightBeforeToday", lastWeightBeforeToday);
        setLastWeightBeforeToday(lastWeightBeforeToday);
      }

      const {
        data: firstWeightAfterToday,
        error: getFirstWeightAfterTodayError,
      } = await supabase
        .from("weight")
        .select("*")
        .match({ client: selectedClientId })
        .gt("date", selectedDate.toDateString())
        .order("date", { ascending: true })
        .order("time", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (getFirstWeightAfterTodayError) {
        console.error(getFirstWeightAfterTodayError);
      } else {
        console.log("firstWeightAfterToday", firstWeightAfterToday);
        setFirstWeightAfterToday(firstWeightAfterToday);
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
      getWeightDates();
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

  const [showPictureModal, setShowPictureModal] = useState(false);
  const [showPictureNotification, setShowPictureNotification] = useState(false);
  const [pictureStatus, setPictureStatus] = useState();

  const [showDeletePictureModal, setShowDeletePictureModal] = useState(false);
  const [showDeletePictureNotification, setShowDeletePictureNotification] =
    useState(false);
  const [deletePictureStatus, setDeletePictureStatus] = useState();

  const clearNotifications = () => {
    setShowAddExerciseNotification(false);
    setShowDeleteExerciseNotification(false);
    setShowEditExerciseNotification(false);
    setShowWeightNotification(false);
    setShowDeleteWeightNotification(false);
    setShowPictureNotification(false);
    setShowDeletePictureNotification(false);
  };
  useEffect(() => {
    if (
      showAddExerciseModal ||
      showDeleteExerciseModal ||
      showEditExerciseModal ||
      showWeightModal ||
      showDeleteWeightModal ||
      showPictureModal ||
      showDeletePictureModal
    ) {
      clearNotifications();
    }
  }, [
    showAddExerciseModal,
    showDeleteExerciseModal,
    showEditExerciseModal,
    showWeightModal,
    showDeleteWeightModal,
    showPictureModal,
    showDeletePictureModal,
  ]);

  const [weightChartOptions, setWeightChartOptions] = useState();
  const [weightChartData, setWeightChartData] = useState();

  const fromDate = new Date(selectedDate);
  fromDate.setHours(0);
  const toDate = new Date(selectedDate);
  toDate.setHours(24);

  useEffect(() => {
    if (
      weights &&
      weights.length > 1 &&
      weights?.every((weight) => weight.time)
    ) {
      const newWeightChartOptions = {
        scales: {
          x: {
            offset: true,
            type: "time",
            time: {
              unit: "hour",
            },
            min: fromDate,
            max: toDate,
          },
          y: {
            type: "linear",
            display: true,
            min: 0,
            title: {
              display: true,
              text: `Weight (${isUsingKilograms ? "kg" : "lbs"})`,
            },
          },
        },
        responsive: true,
        animation: true,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          title: {
            display: false,
          },
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              footer: function (context) {
                const { event } = context[0].raw;
                if (event?.length > 0 && event !== "none") {
                  return `${event}`;
                }
              },
            },
          },
        },
      };
      console.log("newWeightChartOptions", newWeightChartOptions);
      setWeightChartOptions(newWeightChartOptions);
      const allWeights = [];
      if (lastWeightBeforeToday?.time) {
        const date = dateFromDateAndTime(
          lastWeightBeforeToday.date,
          lastWeightBeforeToday.time
        );
        if (selectedDate.getTime() - date.getTime() < 1000 * 60 * 60 * 12) {
          allWeights.push(lastWeightBeforeToday);
        }
      }
      allWeights.push(...weights);
      if (firstWeightAfterToday?.time) {
        const date = dateFromDateAndTime(
          firstWeightAfterToday.date,
          firstWeightAfterToday.time
        );
        if (
          date.getTime() - selectedDate.getTime() <
          1000 * 60 * 60 * (24 + 12)
        ) {
          allWeights.push(firstWeightAfterToday);
        }
      }
      console.log("allWeights", allWeights);
      const newWeightChartData = {
        datasets: [
          {
            label: "Weight",
            data: allWeights.map((weight) => {
              const date = dateFromDateAndTime(weight.date, weight.time);
              let weightValue = weight.weight;
              if (isUsingKilograms != weight.is_weight_in_kilograms) {
                weightValue = isUsingKilograms
                  ? poundsToKilograms(weightValue)
                  : kilogramsToPounds(weightValue);
              }
              return { x: date, y: weightValue, event: weight.event };
            }),
            segment: {
              borderColor: (context) => {
                const event = context?.p1?.raw?.event;
                return weightEventColors[event || "none"];
              },
            },
            pointBackgroundColor: (context) => {
              const event = context?.raw?.event;
              return weightEventColors[event || "none"];
            },
            borderColor: "rgb(250, 204, 21)",
            backgroundColor: "rgba(250, 204, 21, 0.5)",
          },
        ],
      };
      console.log("newWeightChartData", newWeightChartData);
      setWeightChartData(newWeightChartData);
    } else {
      console.log("Clearing chart data/options");
      setWeightChartOptions();
      setWeightChartData();
    }
  }, [weights, lastWeightBeforeToday, firstWeightAfterToday, isUsingKilograms]);

  const [gotPictureForUserId, setGotPictureForUserId] = useState();
  const [gotPictureForDate, setGotPictureForDate] = useState();
  const [pictureUrl, setPictureUrl] = useState();
  const getPicture = async () => {
    const userId = amITheClient ? user.id : selectedClientId;
    const { signedURL, error } = await supabase.storage
      .from("picture")
      .createSignedUrl(`${userId}/${dateToString(selectedDate)}.jpg`, 60);
    if (error) {
      console.error(error);
      setPictureUrl();
    } else {
      setPictureUrl(signedURL);
      setGotPictureForDate(selectedDate);
      setGotPictureForUserId(selectedClientId);
    }
    console.log(error, signedURL);
  };

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    if (!pictureUrl) {
      getPicture();
    } else if (
      gotPictureForUserId != selectedClientId ||
      selectedDate != gotPictureForDate
    ) {
      getPicture(true);
      getPictureDates();
    }
  }, [pictureUrl, selectedClientId, selectedDate]);

  useEffect(() => {
    if (pictureStatus?.type === "succeeded") {
      getPicture();
      getPictureDates();
    }
  }, [pictureStatus]);
  useEffect(() => {
    if (deletePictureStatus?.type === "succeeded") {
      getPicture();
      getPictureDates();
    }
  }, [deletePictureStatus]);

  const [pictureDates, setPictureDates] = useState();
  const getPictureDates = async () => {
    const userId = amITheClient ? user.id : selectedClientId;

    const newPictureDates = [];
    const previousMonth = new Date(selectedDate);
    previousMonth.setUTCDate(15);
    previousMonth.setUTCMonth(previousMonth.getUTCMonth() - 1);
    const nextMonth = new Date(selectedDate);
    nextMonth.setUTCDate(15);
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
    const searchDates = [previousMonth, selectedDate, nextMonth];
    const searches = searchDates.map((date) =>
      dateToString(date).split("-").slice(0, 2).join("-")
    );

    console.log("getPictureDates", searches, searchDates);
    await Promise.all(
      searches.map(async (search) => {
        const { data: monthPictureDates, error: monthPictureDatesError } =
          await supabase.storage.from("picture").list(userId, {
            limit: 31,
            sortBy: { column: "name", order: "asc" },
            search,
          });
        if (monthPictureDatesError) {
          console.error(monthPictureDatesError);
        } else {
          console.log("monthPictureDates", search, monthPictureDates);
          monthPictureDates.forEach(({ name }) =>
            newPictureDates.push({ date: name.split(".")[0] })
          );
        }
      })
    );

    console.log("newPictureDates", newPictureDates);
    setPictureDates(newPictureDates);
  };

  const [datesDots, setDatesDots] = useState({});
  useEffect(() => {
    if (exerciseDates || weightDates || pictureDates) {
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
      pictureDates?.forEach((pictureDate) => {
        const dots = newDatesDots[pictureDate.date] || [];
        dots.push({ color: "bg-green-500" });
        newDatesDots[pictureDate.date] = dots;
      });
      setDatesDots(newDatesDots);
    }
  }, [exerciseDates, weightDates, pictureDates]);

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

      <PictureModal
        open={showPictureModal}
        setOpen={setShowPictureModal}
        setResultStatus={setPictureStatus}
        setShowResultNotification={setShowPictureNotification}
      />
      <Notification
        open={showPictureNotification}
        setOpen={setShowPictureNotification}
        status={pictureStatus}
      />

      <DeletePictureModal
        open={showDeletePictureModal}
        setOpen={setShowDeletePictureModal}
        setDeleteResultStatus={setDeletePictureStatus}
        setShowDeleteResultNotification={setShowDeletePictureNotification}
      />
      <Notification
        open={showDeletePictureNotification}
        setOpen={setShowDeletePictureNotification}
        status={deletePictureStatus}
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
              <span className="bg-white pr-2 text-base text-green-600">
                Picture
              </span>
            </div>
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-end sm:justify-center">
            <span className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
              {amITheClient && !pictureUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setShowPictureModal(true);
                  }}
                  className={classNames(
                    "relative inline-flex items-center border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                    "rounded-md"
                  )}
                >
                  <span className="sr-only">Add Weight</span>
                  <PlusIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
              {amITheClient && pictureUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setShowPictureModal(true);
                  }}
                  className={classNames(
                    "relative inline-flex items-center border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                    "rounded-l-md"
                  )}
                >
                  <span className="sr-only">Edit Picture</span>
                  <PencilIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
              {amITheClient && pictureUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setShowDeletePictureModal(true);
                  }}
                  className={classNames(
                    "relative inline-flex items-center border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                    "rounded-r-md"
                  )}
                >
                  <span className="sr-only">Delete Picture</span>
                  <TrashIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </span>
          </div>
        </div>
        {pictureUrl && (
          <div className="mt-4 mb-2">
            <img
              src={pictureUrl}
              className="m-auto"
              alt="progress picture"
            ></img>
          </div>
        )}
        {(amITheClient || weights?.length > 0) && (
          <div className="relative pt-2">
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
                {amITheClient &&
                  !weights?.some((weight) => weight.time == null) && (
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
        )}
        {weightChartData && weightChartOptions && (
          <Line options={weightChartOptions} data={weightChartData} />
        )}
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
                          {(isUsingKilograms
                            ? poundsToKilograms(weightDifference)
                            : kilogramsToPounds(weightDifference)
                          ).toFixed(Number.isInteger(weightDifference) ? 0 : 1)}
                          )
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
