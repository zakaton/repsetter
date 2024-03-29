import React, { useEffect, useState } from "react";
import DashboardCalendarLayout from "../../components/layouts/DashboardCalendarLayout";
import { getDashboardLayout } from "../../components/layouts/DashboardLayout";
import ExerciseModal from "../../components/dashboard/modal/ExerciseModal";
import DeleteExerciseModal from "../../components/dashboard/modal/DeleteExerciseModal";
import WeightModal from "../../components/dashboard/modal/WeightModal";
import DeleteWeightModal from "../../components/dashboard/modal/DeleteWeightModal";
import PictureModal from "../../components/dashboard/modal/PictureModal";
import DeletePictureModal from "../../components/dashboard/modal/DeletePictureModal";
import Notification from "../../components/Notification";
import UnderCalendar from "../../components/dashboard/UnderCalendar";
import BlockModal from "../../components/dashboard/modal/BlockModal";
import DeleteBlockModal from "../../components/dashboard/modal/DeleteBlockModal";
import {
  supabase,
  dateFromDateAndTime,
  timeToDate,
  dateToString,
} from "../../utils/supabase";
import { useUser } from "../../context/user-context";
import { usePictures } from "../../context/picture-context";
import {
  useClient,
  firstDayOfBlockTemplate,
} from "../../context/client-context";
import { useExerciseVideos } from "../../context/exercise-videos-context";
import ExerciseTypeVideo from "../../components/ExerciseTypeVideo";
import YouTube from "react-youtube";
import GoogleDriveVideo from "../../components/GoogleDriveVideo";
import {
  PaperClipIcon,
  PlusIcon,
  ClipboardIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  TrashIcon,
} from "@heroicons/react/outline";
import {
  kilogramsToPounds,
  poundsToKilograms,
} from "../../utils/exercise-utils";

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
import { pictureTypes } from "../../utils/picture-utils";
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

const capitalizeFirstLetter = (string) =>
  string[0].toUpperCase() + string.slice(1).toLowerCase();

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Diary() {
  const { user } = useUser();
  const { getExerciseVideo } = useExerciseVideos();
  const {
    selectedClient,
    selectedDate,
    amITheClient,
    selectedClientId,
    getSelectedDate,
    isSelectedDateAfterToday,
    selectedBlock,
    setSelectedBlock,
    checkedQuery,
    getBlocks,

    selectedBlockDate,
    getSelectedBlockDate,
  } = useClient();

  useEffect(() => {
    if (!selectedDate) {
      getSelectedDate();
    }
  }, []);
  useEffect(() => {
    if (!selectedBlockDate) {
      getSelectedBlockDate();
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
  const [selectedExercises, setSelectedExercises] = useState();

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
    if (isGettingExercises && !refresh) {
      return;
    }
    if (!selectedDate && !selectedBlockDate) {
      return;
    }
    setIsGettingExercises(true);
    const matchFilters = {
      client: selectedClientId,
      date: selectedDate?.toDateString(),
    };
    if (!amITheClient) {
      //matchFilters.coach = user.id;
    }
    if (selectedBlock) {
      matchFilters.block = selectedBlock.id;
      matchFilters.is_block_template;
      matchFilters.date = selectedBlockDate.toDateString();
      matchFilters.client = user.id;
    }
    console.log("getting exercises for date", matchFilters.date);
    console.log("matchFilters", matchFilters);
    const { data: exercises, error } = await supabase
      .from("exercise")
      .select("*, type(*), block(*)")
      .match(matchFilters)
      .order("time", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      console.error(error);
    } else {
      console.log("got exercises for date", matchFilters.date, exercises);
      setVideo({});
      setVideoPlayer({});
      setExercises(exercises);
      setGotExerciseForUserId(selectedClientId);
      setGotExerciseForDate(selectedBlock ? selectedBlockDate : selectedDate);
    }
    setIsGettingExercises(false);
  };

  useEffect(() => {
    if (!checkedQuery.block) {
      return;
    }

    if (!selectedDate) {
      return;
    }

    if (!selectedClientId) {
      return;
    }

    if (selectedBlock) {
      return;
    }

    if (!exercises) {
      getExercises();
    } else if (
      gotExerciseForUserId != selectedClientId ||
      selectedDate != gotExerciseForDate
    ) {
      getExercises(true);
      if (gotExerciseForUserId != selectedClientId) {
        getExerciseDates();
      }
    }
  }, [
    exercises,
    selectedClientId,
    selectedClient,
    selectedDate,
    selectedBlock,
    checkedQuery,
  ]);

  useEffect(() => {
    if (exercises) {
      let fromString = ``;
      if (selectedBlock) {
        fromString = `exercise:block=eq.${selectedBlock.id}`;
      } else {
        fromString = `exercise:client=eq.${selectedClientId}`;
      }
      console.log(`subscribing to exercise updates`);
      const subscription = supabase
        .from(fromString)
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
    if (addExerciseStatus?.type === "succeeded") {
      getExercises(true);
      getExerciseDates();
    }
  }, [addExerciseStatus]);
  useEffect(() => {
    if (editExerciseStatus?.type === "succeeded") {
      getExercises(true);
    }
  }, [editExerciseStatus]);
  useEffect(() => {
    if (deleteExerciseStatus?.type === "succeeded") {
      getExercises(true);
      getExerciseDates();
    }
  }, [deleteExerciseStatus]);

  useEffect(() => {
    if (exercises) {
      getExerciseVideo(exercises.map((exercise) => exercise.type.id));
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
    if (selectedBlock) {
      await getExerciseDatesForBlock();
      return;
    }

    console.log(
      "getting exercise dates for the month",
      calendar[0].toDateString(),
      calendar[calendar.length - 1].toDateString()
    );
    console.log(
      "getting exercise dates for user",
      amITheClient,
      selectedClient,
      selectedClientId
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
      checkedQuery.block &&
      !selectedBlock &&
      selectedClientId &&
      calendar &&
      selectedDate &&
      calendar[0].getFullYear() != firstDayOfBlockTemplate.getFullYear() &&
      (!lastSelectedDate ||
        lastSelectedDate.getFullYear() !== selectedDate.getFullYear() ||
        lastSelectedDate.getMonth() !== selectedDate.getMonth())
    ) {
      setLastSelectedDate(selectedDate);
      getExerciseDates();
      getWeightDates();
      getPictureDates();
    }
  }, [calendar, selectedClientId, selectedBlock, checkedQuery]);

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

          block,

          number_of_sets_assigned,
          number_of_reps_assigned,
          is_weight_in_kilograms,
          weight_assigned,
        } = uniqueExercise;

        const insertedExercise = {
          type: uniqueExercise.type.id,

          date: (selectedBlock
            ? selectedBlockDate
            : selectedDate
          ).toDateString(),

          block: selectedBlock ? selectedBlock.id : block?.id,
          is_block_template: selectedBlock ? true : false,

          client: selectedClientId,
          client_email: amITheClient
            ? user.email
            : selectedClient?.client_email,

          number_of_sets_assigned,
          number_of_reps_assigned,
          is_weight_in_kilograms,
          weight_assigned,
        };
        if (selectedBlock) {
          insertedExercise.client = user.id;
          insertedExercise.client_email = user.email;
        }

        if (!amITheClient) {
          Object.assign(insertedExercise, {
            coach: user.id,
            coach_email: user.email,
          });
        } else if (coach && coach_email) {
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
      getExercises(true);
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
  const [selectedWeights, setSelectedWeights] = useState();
  const [gotWeightForUserId, setGotWeightForUserId] = useState();
  const [gotWeightForDate, setGotWeightForDate] = useState();
  const [weights, setWeights] = useState();
  const [isGettingWeights, setIsGettingWeights] = useState(false);
  const [lastWeightBeforeToday, setLastWeightBeforeToday] = useState();
  const [firstWeightAfterToday, setFirstWeightAfterToday] = useState();
  const getWeights = async (refresh) => {
    console.log(
      "getWeights",
      weights,
      refresh,
      selectedClientId,
      isGettingWeights
    );
    if (weights && !refresh) {
      return;
    }
    if (!selectedClientId) {
      return;
    }
    if (isGettingWeights && !refresh) {
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
      .order("time", { ascending: true })
      .order("created_at", { ascending: true });

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
    console.log("done getting weights");
    setIsGettingWeights(false);
  };

  useEffect(() => {
    if (!checkedQuery.block) {
      return;
    }

    if (!selectedDate) {
      return;
    }

    if (!selectedClientId) {
      return;
    }

    if (selectedBlock) {
      return;
    }

    if (!weights) {
      getWeights();
    } else if (
      gotWeightForUserId != selectedClientId ||
      selectedDate != gotWeightForDate
    ) {
      getWeights(true);
      if (gotWeightForUserId != selectedClientId) {
        getWeightDates();
      }
    }
  }, [
    weights,
    selectedClientId,
    selectedClient,
    selectedDate,
    selectedBlock,
    checkedQuery,
  ]);

  useEffect(() => {
    if (weights) {
      console.log(`subscribing to weight updates`);
      const subscription = supabase
        .from(`weight:client=eq.${selectedClientId}`)
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

  useEffect(() => {
    if (weightStatus?.type === "succeeded") {
      getWeights(true);
      getWeightDates();
    }
  }, [weightStatus]);
  useEffect(() => {
    if (deleteWeightStatus?.type === "succeeded") {
      getWeights(true);
      getWeightDates();
    }
  }, [deleteWeightStatus]);

  const [isUsingKilograms, setIsUsingKilograms] = useState(false);

  const [showPictureModal, setShowPictureModal] = useState(false);
  const [showPictureNotification, setShowPictureNotification] = useState(false);
  const [pictureStatus, setPictureStatus] = useState();

  const [showDeletePictureModal, setShowDeletePictureModal] = useState(false);
  const [showDeletePictureNotification, setShowDeletePictureNotification] =
    useState(false);
  const [deletePictureStatus, setDeletePictureStatus] = useState();

  const [weightChartOptions, setWeightChartOptions] = useState();
  const [weightChartData, setWeightChartData] = useState();

  useEffect(() => {
    if (
      weights &&
      weights.length > 1 &&
      weights?.every((weight) => weight.time)
    ) {
      const fromDate = new Date(selectedDate);
      fromDate.setHours(0);
      const toDate = new Date(selectedDate);
      toDate.setHours(24);

      const newWeightChartOptions = {
        scales: {
          x: {
            offset: true,
            type: "time",
            time: {
              unit: "hour",
            },
            //min: fromDate,
            //max: toDate,
          },
          y: {
            type: "linear",
            display: true,
            //min: 0,
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
            intersect: true,
            callbacks: {
              title: function (context) {
                const { time } = context[0].raw;
                return time;
              },
              label: function (context) {
                const label = context.dataset.label;
                let data = context.dataset.data[context.dataIndex];
                let value = data.y;
                return `${label}: ${value.toFixed(1)} ${
                  isUsingKilograms ? "kg" : "lbs"
                }`;
              },
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
              return {
                x: date,
                y: weightValue,
                event: weight.event,
                time: date.toLocaleTimeString([], {
                  timeStyle: "short",
                }),
              };
            }),
            segment: {
              borderColor: (context) => {
                const event = context?.p1?.raw?.event;
                return weightEventColors[event || "none"];
              },
            },
            /*
            pointBackgroundColor: (context) => {
              const event = context?.raw?.event;
              return weightEventColors[event || "none"];
            },
            */
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

  const { pictures, getPicture } = usePictures();
  const [selectedPictureTypes, setSelectedPictureTypes] = useState();
  const [pictureType, setPictureType] = useState(pictureTypes[0]);
  useEffect(() => {
    if (!checkedQuery.block) {
      return;
    }

    if (!selectedDate) {
      return;
    }

    if (!selectedClientId) {
      return;
    }

    if (selectedBlock) {
      return;
    }

    getPicture(selectedClientId, { date: selectedDate });

    if (
      selectedDate != gotPictureDatesForDate &&
      selectedClientId != gotPictureDatesForClientId
    ) {
      getPictureDates();
    }
  }, [selectedClientId, selectedDate, selectedBlock, checkedQuery]);

  useEffect(() => {
    if (pictureStatus?.type === "succeeded") {
      getPicture(selectedClientId, { date: selectedDate }, true);
      getPictureDates();
    }
  }, [pictureStatus]);
  useEffect(() => {
    if (deletePictureStatus?.type === "succeeded") {
      getPicture(selectedClientId, { date: selectedDate }, true);
      getPictureDates();
    }
  }, [deletePictureStatus]);

  const isGettingPictures = !(
    selectedDate && pictures?.[selectedClientId]?.[dateToString(selectedDate)]
  );
  const userPictures =
    (selectedDate &&
      pictures?.[selectedClientId]?.[dateToString(selectedDate)]) ||
    {};
  const userPictureTypes = Object.keys(userPictures);
  const numberOfUserPictures = userPictureTypes.length;

  const [pictureDates, setPictureDates] = useState();
  const [gotPictureDatesForDate, setGotPictureDatesForDate] = useState();
  const [gotPictureDatesForClientId, setGotPictureDatesForClientId] =
    useState();
  const getPictureDates = async () => {
    const newPictureDates = [];
    const previousMonth = new Date(selectedDate);
    previousMonth.setDate(15);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const nextMonth = new Date(selectedDate);
    nextMonth.setDate(15);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const searchDates = [previousMonth, selectedDate, nextMonth];
    const searches = searchDates.map((date) =>
      dateToString(date).split("-").slice(0, 2).join("-")
    );

    console.log("getPictureDates", searches, searchDates);
    await Promise.all(
      searches.map(async (search) => {
        const { data: monthPictureDates, error: monthPictureDatesError } =
          await supabase.storage.from("picture").list(selectedClientId, {
            limit: 31 * pictureTypes.length,
            sortBy: { column: "name", order: "asc" },
            search,
          });
        if (monthPictureDatesError) {
          console.error(monthPictureDatesError);
        } else {
          console.log("monthPictureDates", search, monthPictureDates);
          monthPictureDates.forEach(({ name }) => {
            const dateString = name.split("_")[0];
            if (!newPictureDates.find(({ date }) => date === dateString)) {
              newPictureDates.push({ date: dateString });
            }
          });
        }
      })
    );

    console.log("newPictureDates", newPictureDates);
    setPictureDates(newPictureDates);
  };

  const [datesDots, setDatesDots] = useState({});
  useEffect(() => {
    if (exerciseDates || weightDates || pictureDates) {
      console.log(
        "updating date dots",
        exerciseDates,
        weightDates,
        pictureDates
      );
      const newDatesDots = {};
      exerciseDates?.forEach((exerciseDate) => {
        const dots = newDatesDots[exerciseDate.date] || [];
        dots.push({ color: "bg-blue-500" });
        newDatesDots[exerciseDate.date] = dots;
      });
      weightDates?.forEach((weightDate) => {
        const dots = newDatesDots[weightDate.date] || [];
        dots.push({ color: "bg-yellow-500" });
        newDatesDots[weightDate.date] = dots;
      });
      pictureDates?.forEach((pictureDate) => {
        const dots = newDatesDots[pictureDate.date] || [];
        dots.push({ color: "bg-green-500" });
        newDatesDots[pictureDate.date] = dots;
      });
      console.log("newDatesDots", newDatesDots);
      setDatesDots(newDatesDots);
    }
  }, [exerciseDates, weightDates, pictureDates]);

  const [showExercises, setShowExercises] = useState(true);
  const [showWeights, setShowWeights] = useState(true);
  const [showPictures, setShowPictures] = useState(true);

  const [datesToHighlight, setDatesToHighlight] = useState();

  const getExerciseDatesForBlock = async () => {
    console.log("getting exercise dates for block", selectedBlock);
    const { data: exerciseDates, error } = await supabase.rpc(
      "get_block_exercise_dates",
      {
        block_id: selectedBlock.id,
      }
    );
    if (error) {
      console.error(error);
    } else {
      console.log("exerciseDates", exerciseDates);
      setExerciseDates(exerciseDates);
    }
  };
  useEffect(() => {
    if (selectedBlock) {
      setWeightDates();
      setPictureDates();
      getExerciseDates();
      getExercises();
      setLastSelectedDate();
    }
  }, [selectedBlock]);

  useEffect(() => {
    if (selectedBlock) {
      if (selectedBlockDate != gotExerciseForDate) {
        getExercises(true);
      }
    }
  }, [selectedBlockDate]);

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showBlockNotification, setShowBlockNotification] = useState(false);
  const [blockStatus, setBlockStatus] = useState();

  const [showDeleteBlockModal, setShowDeleteBlockModal] = useState(false);
  const [showDeleteBlockNotification, setShowDeleteBlockNotification] =
    useState(false);
  const [deleteBlockStatus, setDeleteBlockStatus] = useState();

  const clearNotifications = () => {
    setShowAddExerciseNotification(false);
    setShowDeleteExerciseNotification(false);
    setShowEditExerciseNotification(false);
    setShowWeightNotification(false);
    setShowDeleteWeightNotification(false);
    setShowPictureNotification(false);
    setShowDeletePictureNotification(false);
    setShowBlockNotification(false);
    setShowDeleteBlockNotification(false);
  };
  useEffect(() => {
    if (
      showAddExerciseModal ||
      showDeleteExerciseModal ||
      showEditExerciseModal ||
      showWeightModal ||
      showDeleteWeightModal ||
      showPictureModal ||
      showDeletePictureModal ||
      showBlockModal ||
      showDeleteBlockModal
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
    showBlockModal,
    showDeleteBlockModal,
  ]);

  useEffect(() => {
    if (blockStatus?.type === "succeeded") {
      console.log("GET BLOKS!");
      getBlocks(true);
    }
  }, [blockStatus]);
  useEffect(() => {
    if (deleteBlockStatus?.type === "succeeded") {
      setSelectedBlock();
    }
  }, [deleteBlockStatus]);

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
        selectedResults={selectedExercises}
        setSelectedResult={setSelectedExercise}
        setSelectedResults={setSelectedExercises}
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
        selectedResults={selectedWeights}
        setSelectedResults={setSelectedWeights}
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
        pictureType={pictureType}
        setPictureType={setPictureType}
      />
      <Notification
        open={showPictureNotification}
        setOpen={setShowPictureNotification}
        status={pictureStatus}
      />

      <DeletePictureModal
        open={showDeletePictureModal}
        setOpen={setShowDeletePictureModal}
        types={selectedPictureTypes}
        setTypes={setSelectedPictureTypes}
        setDeleteResultStatus={setDeletePictureStatus}
        setShowDeleteResultNotification={setShowDeletePictureNotification}
      />
      <Notification
        open={showDeletePictureNotification}
        setOpen={setShowDeletePictureNotification}
        status={deletePictureStatus}
      />

      <BlockModal
        open={showBlockModal}
        setOpen={setShowBlockModal}
        selectedResult={selectedBlock}
        setResultStatus={setBlockStatus}
        setShowBlockNotification={setShowBlockNotification}
      ></BlockModal>
      <Notification
        open={showBlockNotification}
        setOpen={setShowBlockNotification}
        status={blockStatus}
      ></Notification>

      <DeleteBlockModal
        open={showDeleteBlockModal}
        setOpen={setShowDeleteBlockModal}
        selectedResult={selectedBlock}
        setDeleteResultStatus={setDeleteBlockStatus}
        setShowDeleteResultNotification={setShowDeleteBlockNotification}
      ></DeleteBlockModal>
      <Notification
        open={showDeleteBlockNotification}
        setOpen={setShowDeleteBlockNotification}
        status={deleteBlockStatus}
      ></Notification>

      <DashboardCalendarLayout
        aboveCalendar={
          selectedBlock && (
            <>
              <div className="mb-3 space-y-2 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3 sm:space-y-0">
                <button
                  type="button"
                  className={classNames(
                    "col-span-1 inline-flex w-full justify-center self-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm sm:mt-0 sm:py-2 sm:text-sm",
                    "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  )}
                  onClick={() => {
                    setShowBlockModal(true);
                  }}
                >
                  Block Details
                </button>
                <button
                  type="button"
                  className={classNames(
                    "col-span-1 inline-flex w-full justify-center self-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm sm:mt-0 sm:py-2 sm:text-sm",
                    "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  )}
                  onClick={() => {
                    setShowDeleteBlockModal(true);
                  }}
                >
                  Delete Block
                </button>
              </div>
            </>
          )
        }
        showCalendarControls={!selectedBlock}
        includeClientSelect={{ showBlocks: true }}
        datesToHighlight={datesToHighlight}
        underCalendar={
          <UnderCalendar
            refreshExercises={() => {
              getExerciseDates();
              getExercises(true);
            }}
            setDatesToHighlight={setDatesToHighlight}
            setSelectedExercises={setSelectedExercises}
            setShowDeleteExerciseModal={setShowDeleteExerciseModal}
          />
        }
        setCalendar={setCalendar}
        tableName="diary"
        resultNamePlural="diary"
        subtitle={`View and edit ${
          selectedClient && !selectedBlock
            ? `${selectedClient.client_email}'s`
            : "your"
        } ${
          selectedBlock
            ? `"${selectedBlock.name}" block`
            : "weight, pictures, and exercises"
        }`}
        datesDots={datesDots}
      >
        <div className="relative min-h-[3rem]">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="relative z-10 flex justify-start">
              <button
                onClick={() => {
                  setShowExercises(!showExercises);
                }}
                className="flex bg-white pr-2 text-base text-blue-500"
              >
                {showExercises ? (
                  <ChevronDownIcon
                    className="m-auto inline h-4 w-4"
                    aria-hidden="true"
                  />
                ) : (
                  <ChevronRightIcon
                    className="m-auto inline h-4 w-4"
                    aria-hidden="true"
                  />
                )}
                <span className="pl-0.5">Exercises</span>
              </button>
            </div>
            <div className="w-full border-t border-gray-300" />
          </div>
          <div
            className={classNames(
              "relative flex justify-end sm:justify-center",
              showExercises ? "" : "invisible"
            )}
          >
            <span className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setShowAddExerciseModal(true)}
                className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <span className="sr-only">Add Exercise</span>
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
                  "relative inline-flex items-center border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-400",
                  copiedExercises?.length > 0
                    ? "hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    : "bg-gray-100"
                )}
              >
                <span className="sr-only">Paste</span>
                <ClipboardIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled={!(exercises?.length > 0)}
                onClick={() => {
                  setSelectedExercises(exercises);
                  setShowDeleteExerciseModal(true);
                }}
                className={classNames(
                  "relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-400",
                  exercises?.length > 0
                    ? "hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    : "bg-gray-100"
                )}
              >
                <span className="sr-only">Delete Exercises</span>
                <TrashIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </span>
          </div>
        </div>
        {showExercises && (
          <>
            {!isGettingExercises && exercises && (
              <>
                {exercises.length > 0 && (
                  <div className="mb-2">
                    {exercises.map((exercise, index) => (
                      <div
                        key={exercise.id}
                        className={classNames(
                          "py-5",
                          index === 0 ? "pb-5" : "border-gray-20 border-t"
                        )}
                      >
                        <dl
                          className={
                            "grid grid-cols-1 gap-x-4 gap-y-6 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                          }
                        >
                          <div className="sm:col-span-1">
                            <ExerciseTypeVideo
                              exerciseTypeId={exercise.type.id}
                              fetchVideo={false}
                            ></ExerciseTypeVideo>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">
                              Name
                            </dt>
                            <dd className="mt-1 break-words text-sm text-gray-900">
                              {`${exercise.type.name}${
                                exercise.style ? ` (${exercise.style})` : ""
                              }`}
                            </dd>
                          </div>
                          {exercise.block && (
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">
                                Block
                              </dt>
                              <dd className="mt-1 break-words text-sm text-gray-900">
                                {exercise.block.name}
                              </dd>
                            </div>
                          )}
                          {exercise.time && (
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">
                                Time
                              </dt>
                              <dd className="mt-1 break-words text-sm text-gray-900">
                                {timeToDate(exercise.time).toLocaleTimeString(
                                  [],
                                  {
                                    timeStyle: "short",
                                  }
                                )}
                              </dd>
                            </div>
                          )}
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">
                              Muscles Used
                            </dt>
                            <dd className="mt-1 break-words text-sm text-gray-900">
                              {exercise.type.muscles.join(", ")}
                            </dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">
                              Exercise Group
                            </dt>
                            <dd className="mt-1 break-words text-sm text-gray-900">
                              {exercise.type.group}
                            </dd>
                          </div>
                          {exercise.coach_email && (
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">
                                Coach
                              </dt>
                              <dd className="mt-1 break-words text-sm text-gray-900">
                                {exercise.coach_email}
                              </dd>
                            </div>
                          )}
                          {exercise.number_of_sets_performed === null && (
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">
                                Sets
                              </dt>
                              <dd className="mt-1 break-words text-sm text-gray-900">
                                {exercise.number_of_sets_assigned}
                              </dd>
                            </div>
                          )}
                          {exercise.number_of_sets_performed !== null && (
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">
                                Sets
                              </dt>
                              <dd className="mt-1 break-words text-sm text-gray-900">
                                {exercise.number_of_sets_performed}/
                                {exercise.number_of_sets_assigned}
                              </dd>
                            </div>
                          )}
                          {exercise.number_of_reps_assigned && (
                            <>
                              {exercise.number_of_reps_performed === null && (
                                <div className="sm:col-span-1">
                                  <dt className="text-sm font-medium text-gray-500">
                                    Reps
                                  </dt>
                                  <dd className="mt-1 break-words text-sm text-gray-900">
                                    {exercise.number_of_reps_assigned
                                      .map((reps) =>
                                        reps == 0 ? "amrap" : reps
                                      )
                                      .join(", ")}
                                  </dd>
                                </div>
                              )}
                              {exercise.number_of_reps_performed !== null && (
                                <div className="sm:col-span-1">
                                  <dt className="text-sm font-medium text-gray-500">
                                    Reps
                                  </dt>
                                  <dd className="mt-1 break-words text-sm text-gray-900">
                                    {exercise.number_of_reps_performed
                                      .map(
                                        (numberOfReps, index) =>
                                          `${numberOfReps}/${
                                            exercise.number_of_reps_assigned[
                                              index
                                            ] ||
                                            exercise.number_of_reps_assigned[0]
                                          }`
                                      )
                                      .join(", ")}
                                  </dd>
                                </div>
                              )}
                            </>
                          )}

                          {exercise.weight_assigned?.some(
                            (weight) => weight > 0
                          ) && (
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">
                                Weight (
                                {exercise.is_weight_in_kilograms ? "kg" : "lbs"}
                                )
                              </dt>
                              <dd className="mt-1 break-words text-sm text-gray-900">
                                {exercise.weight_performed === null &&
                                  exercise.weight_assigned.join(", ")}
                                {exercise.weight_performed !== null &&
                                  exercise.weight_performed
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

                          {exercise.rest_duration?.some((rest) => rest > 0) && (
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">
                                Rest Duration (min)
                              </dt>
                              <dd className="mt-1 break-words text-sm text-gray-900">
                                {exercise.rest_duration.join(", ")}
                              </dd>
                            </div>
                          )}
                          {exercise.set_duration_assigned?.some(
                            (value) => value > 0
                          ) && (
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">
                                Set Duration (min)
                              </dt>
                              <dd className="mt-1 break-words text-sm text-gray-900">
                                {exercise.set_duration_performed === null &&
                                  exercise.set_duration_assigned.join(", ")}
                                {exercise.set_duration_performed !== null &&
                                  exercise.set_duration_performed
                                    .map(
                                      (durationPerformed, index) =>
                                        `${durationPerformed}/${
                                          exercise.set_duration_assigned[
                                            index
                                          ] || exercise.set_duration_assigned[0]
                                        }`
                                    )
                                    .join(", ")}
                              </dd>
                            </div>
                          )}
                          {exercise.speed_assigned?.some(
                            (value) => value > 0
                          ) && (
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">
                                Speed (mph)
                              </dt>
                              <dd className="mt-1 break-words text-sm text-gray-900">
                                {exercise.speed_performed === null &&
                                  exercise.speed_assigned.join(", ")}
                                {exercise.speed_performed !== null &&
                                  exercise.speed_performed
                                    .map(
                                      (speedPerformed, index) =>
                                        `${speedPerformed}/${
                                          exercise.speed_assigned[index] ||
                                          exercise.speed_assigned[0]
                                        }`
                                    )
                                    .join(", ")}
                              </dd>
                            </div>
                          )}
                          {exercise.level_assigned?.some(
                            (value) => value > 0
                          ) && (
                            <>
                              <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">
                                  Level
                                </dt>
                                <dd className="mt-1 break-words text-sm text-gray-900">
                                  {exercise.level_performed === null &&
                                    exercise.level_assigned.join(", ")}
                                  {exercise.level_performed !== null &&
                                    exercise.level_performed
                                      .map(
                                        (levelPerformed, index) =>
                                          `${levelPerformed}/${
                                            exercise.level_assigned[index] ||
                                            exercise.level_assigned[0]
                                          }`
                                      )
                                      .join(", ")}
                                </dd>
                              </div>
                            </>
                          )}
                          {exercise.distance_assigned?.some(
                            (value) => value > 0
                          ) && (
                            <>
                              <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">
                                  Distance ({exercise.distance_unit})
                                </dt>
                                <dd className="mt-1 break-words text-sm text-gray-900">
                                  {exercise.distance_performed === null &&
                                    exercise.distance_assigned.join(", ")}
                                  {exercise.distance_performed !== null &&
                                    exercise.distance_performed
                                      .map(
                                        (distancePerformed, index) =>
                                          `${distancePerformed}/${
                                            exercise.distance_assigned[index] ||
                                            exercise.distance_assigned[0]
                                          }`
                                      )
                                      .join(", ")}
                                </dd>
                              </div>
                            </>
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
                                      {video.isGoogleDriveVideo ? (
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
                                            const newVideoPlayer = {
                                              ...videoPlayer,
                                            };
                                            newVideoPlayer[exercise.id] =
                                              newVideoPlayer[exercise.id] || [];
                                            newVideoPlayer[exercise.id][index] =
                                              e.target;
                                            setVideoPlayer(newVideoPlayer);
                                          }}
                                          onEnd={(e) => {
                                            e.target.seekTo(video.start || 0);
                                            e.target.playVideo();
                                          }}
                                        ></YouTube>
                                      )}
                                    </dd>
                                  </div>
                                </React.Fragment>
                              )
                          )}
                          {exercise.notes?.length > 0 && (
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">
                                Notes
                              </dt>
                              <dd className="mt-1 break-words text-sm text-gray-900">
                                {exercise.notes}
                              </dd>
                            </div>
                          )}
                          {exercise.feedback?.length > 0 && (
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">
                                Feedback
                              </dt>
                              <dd className="mt-1 break-words text-sm text-gray-900">
                                {exercise.feedback}
                              </dd>
                            </div>
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
                  </div>
                )}
                {exercises.length === 0 && (
                  <div className="text-sm font-medium text-gray-500">
                    No exercises found.
                  </div>
                )}
              </>
            )}
            {isGettingExercises && (
              <div className="text-sm font-medium text-gray-500">
                Getting exercises...
              </div>
            )}
          </>
        )}

        {!selectedBlock && (
          <>
            <div className="relative min-h-[3rem]">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="relative z-10 flex justify-start">
                  <button
                    type="button"
                    onClick={() => {
                      setShowWeights(!showWeights);
                    }}
                    className="flex bg-white pr-2 text-base text-yellow-600"
                  >
                    {showWeights ? (
                      <ChevronDownIcon
                        className="m-auto inline h-4 w-4"
                        aria-hidden="true"
                      />
                    ) : (
                      <ChevronRightIcon
                        className="m-auto inline h-4 w-4"
                        aria-hidden="true"
                      />
                    )}
                    <span className="pl-0.5">Bodyweight</span>
                  </button>
                </div>
                <div className="w-full border-t border-gray-300" />
              </div>
              <div
                className={classNames(
                  "relative flex justify-end sm:justify-center",
                  showWeights ? "" : "invisible"
                )}
              >
                <span className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                  {!isSelectedDateAfterToday && (
                    <>
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
                          amITheClient &&
                            !weights?.some((weight) => weight.time == null)
                            ? ""
                            : amITheClient
                            ? "rounded-l-md"
                            : "rounded-md"
                        )}
                      >
                        <span className="sr-only">Toggle Weight</span>
                        {isUsingKilograms ? "kg" : "lbs"}
                      </button>
                      {amITheClient && (
                        <button
                          type="button"
                          disabled={!(weights?.length > 0)}
                          onClick={() => {
                            setSelectedWeights(weights);
                            setShowDeleteWeightModal(true);
                          }}
                          className={classNames(
                            "relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-400",
                            weights?.length > 0
                              ? "hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              : "bg-gray-100"
                          )}
                        >
                          <span className="sr-only">Delete Weights</span>
                          <TrashIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      )}
                    </>
                  )}
                </span>
              </div>
            </div>
            {showWeights && (
              <>
                {!isGettingWeights && weights && (
                  <>
                    {weights.length > 0 && (
                      <>
                        {weightChartData && weightChartOptions && (
                          <Line
                            options={weightChartOptions}
                            data={weightChartData}
                          />
                        )}
                        {weights
                          .slice()
                          .sort((a, b) => {
                            const [aHour, aMinute, aCreated_at] =
                              a.time.split(":");
                            const [bHour, bMinute, bCreated_at] =
                              b.time.split(":");
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
                            let bodyfatDifference = null;
                            if (previousWeight) {
                              let previousWeightValue = previousWeight.weight;
                              if (
                                weight.is_weight_in_kilograms !==
                                previousWeight.is_weight_in_kilograms
                              ) {
                                previousWeightValue =
                                  weight.is_weight_in_kilograms
                                    ? poundsToKilograms(previousWeightValue)
                                    : kilogramsToPounds(previousWeightValue);
                              }
                              if (
                                weight.bodyfat_percentage !== null &&
                                previousWeight.bodyfat_percentage !== null
                              ) {
                                bodyfatDifference =
                                  weight.bodyfat_percentage -
                                  previousWeight.bodyfat_percentage;
                              }
                              weightDifference =
                                weight.weight - previousWeightValue;
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
                                      {weight.is_weight_in_kilograms ==
                                      isUsingKilograms
                                        ? weight.weight
                                        : (isUsingKilograms
                                            ? poundsToKilograms(weight.weight)
                                            : kilogramsToPounds(weight.weight)
                                          ).toFixed(1)}{" "}
                                      {isUsingKilograms ? "kg" : "lbs"}{" "}
                                      {previousWeight && (
                                        <span
                                          className={
                                            weightDifference < 0
                                              ? "text-red-500"
                                              : "text-green-500"
                                          }
                                        >
                                          ({weightDifference < 0 ? "" : "+"}
                                          {(weight.is_weight_in_kilograms ==
                                          isUsingKilograms
                                            ? weightDifference
                                            : isUsingKilograms
                                            ? poundsToKilograms(
                                                weightDifference
                                              )
                                            : kilogramsToPounds(
                                                weightDifference
                                              )
                                          ).toFixed(1)}
                                          )
                                        </span>
                                      )}
                                    </dd>
                                  </div>
                                  {weight.bodyfat_percentage !== null && (
                                    <div className="sm:col-span-1">
                                      <dt className="text-sm font-medium text-gray-500">
                                        Bodyfat Percentage
                                      </dt>
                                      <dd className="mt-1 break-words text-sm text-gray-900">
                                        {weight.bodyfat_percentage}%{" "}
                                        {bodyfatDifference && (
                                          <span
                                            className={
                                              bodyfatDifference < 0
                                                ? "text-red-500"
                                                : "text-green-500"
                                            }
                                          >
                                            ({bodyfatDifference < 0 ? "" : "+"}
                                            {bodyfatDifference.toFixed(1)})
                                          </span>
                                        )}
                                      </dd>
                                    </div>
                                  )}
                                  {weight.time !== null && (
                                    <div className="sm:col-span-1">
                                      <dt className="text-sm font-medium text-gray-500">
                                        Time
                                      </dt>
                                      <dd className="mt-1 break-words text-sm text-gray-900">
                                        {timeToDate(
                                          weight.time
                                        ).toLocaleTimeString([], {
                                          timeStyle: "short",
                                        })}
                                      </dd>
                                    </div>
                                  )}
                                  {weight.time !== null &&
                                    weight.event !== null && (
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
                                        Edit
                                        <span className="sr-only"> weight</span>
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
                      </>
                    )}
                    {weights.length === 0 && (
                      <div className="text-sm font-medium text-gray-500">
                        No bodyweight found.
                      </div>
                    )}
                  </>
                )}
                {isGettingWeights && (
                  <div className="text-sm font-medium text-gray-500">
                    Getting bodyweight...
                  </div>
                )}
              </>
            )}
          </>
        )}

        {!selectedBlock && (
          <>
            <div className="relative min-h-[3rem]">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="relative z-10 flex justify-start">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPictures(!showPictures);
                    }}
                    className="flex bg-white pr-2 text-base text-green-600"
                  >
                    {showPictures ? (
                      <ChevronDownIcon
                        className="m-auto inline h-4 w-4"
                        aria-hidden="true"
                      />
                    ) : (
                      <ChevronRightIcon
                        className="m-auto inline h-4 w-4"
                        aria-hidden="true"
                      />
                    )}
                    <span className="pl-0.5">Pictures</span>
                  </button>
                </div>
                <div className="w-full border-t border-gray-300" />
              </div>
              <div
                className={classNames(
                  "relative flex justify-end sm:justify-center",
                  showPictures ? "" : "invisible"
                )}
              >
                <span className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                  {amITheClient && !isSelectedDateAfterToday && userPictures && (
                    <>
                      {numberOfUserPictures < pictureTypes.length && (
                        <button
                          type="button"
                          onClick={() => {
                            const existingTypes = userPictureTypes;
                            const newPictureType = pictureTypes.find(
                              (type) => !existingTypes.includes(type)
                            );
                            setPictureType(newPictureType);
                            setShowPictureModal(true);
                          }}
                          className={classNames(
                            "relative inline-flex items-center border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                            numberOfUserPictures === 0
                              ? "rounded-md"
                              : "rounded-l-md"
                          )}
                        >
                          <span className="sr-only">Add Picture</span>
                          <PlusIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      )}
                      {numberOfUserPictures > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPictureTypes(
                              pictureTypes.filter((pictureType) =>
                                userPictureTypes.includes(pictureType)
                              )
                            );
                            setShowDeletePictureModal(true);
                          }}
                          className={classNames(
                            "relative inline-flex items-center border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                            numberOfUserPictures === pictureTypes.length
                              ? "rounded-md"
                              : "rounded-r-md"
                          )}
                        >
                          <span className="sr-only">Delete Pictures</span>
                          <TrashIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      )}
                    </>
                  )}
                </span>
              </div>
            </div>
            {showPictures && (
              <>
                {!isGettingPictures && (
                  <>
                    {numberOfUserPictures > 0 && (
                      <ul
                        role="list"
                        className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 xl:gap-x-8"
                      >
                        {pictureTypes
                          .filter((type) => type in userPictures)
                          .map((type) => (
                            <li className="relative flex flex-col" key={type}>
                              <p className="pointer-events-none mt-2 block truncate text-center text-base font-medium text-gray-900">
                                {capitalizeFirstLetter(type)}
                              </p>
                              <img
                                loading="lazy"
                                src={userPictures[type]}
                                alt={`${type} progress picture`}
                                className="rounded-lg"
                              ></img>
                              {amITheClient && (
                                <div className="mt-3 space-y-2 xs:mt-2 xs:grid xs:grid-flow-row-dense xs:grid-cols-2 xs:gap-2 xs:space-y-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPictureType(type);
                                      setShowPictureModal(true);
                                    }}
                                    className="w-full justify-center rounded-md border border-transparent bg-blue-600 px-2 py-1 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedPictureTypes([type]);
                                      setShowDeletePictureModal(true);
                                    }}
                                    className="w-full justify-center rounded-md border border-transparent bg-red-600 px-2 py-1 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:text-sm"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </li>
                          ))}
                      </ul>
                    )}
                    {numberOfUserPictures === 0 && (
                      <div className="text-sm font-medium text-gray-500">
                        No pictures found.
                      </div>
                    )}
                  </>
                )}
                {isGettingPictures && (
                  <div className="text-sm font-medium text-gray-500">
                    Getting Pictures...
                  </div>
                )}
              </>
            )}
          </>
        )}
      </DashboardCalendarLayout>
    </>
  );
}

Diary.getLayout = getDashboardLayout;
