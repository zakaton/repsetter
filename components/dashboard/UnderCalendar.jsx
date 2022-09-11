import MultiDateSelect from "./MultiDateSelect";
import { useState, useEffect } from "react";
import { useClient } from "../../context/client-context";
import { useUser } from "../../context/user-context";
import {
  supabase,
  dateFromDateAndTime,
  timeToDate,
  dateToString,
  stringToDate,
} from "../../utils/supabase";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const getDates = (dateRangeToCopy, selectedDate) => {
  let fromDate = new Date(selectedDate);
  let toDate = new Date(selectedDate);
  switch (dateRangeToCopy) {
    case "day":
      toDate.setDate(toDate.getDate() + 1);
      break;
    case "week":
      fromDate.setDate(fromDate.getDate() - fromDate.getDay());
      toDate.setDate(toDate.getDate() + (6 - toDate.getDay()));
      break;
    case "month":
      fromDate.setDate(1);
      const numberOfDaysInMonth = new Date(
        fromDate.getFullYear(),
        fromDate.getMonth() + 1,
        0
      ).getDate();
      toDate.setDate(numberOfDaysInMonth);
      break;
    case "block":
      fromDate.setDate(fromDate.getDate() - fromDate.getDay());
      toDate = new Date(fromDate);
      toDate.setDate(toDate.getDate() + 7 * 4 - 1);
      break;
    default:
      break;
  }
  console.log("getDates", fromDate, toDate);
  return { fromDate, toDate };
};

export default function UnderCalendar({
  refreshExercises,
  setShowDeleteExerciseModal,
  setSelectedExercises,
  setDatesToHighlight,
}) {
  const { selectedClient, selectedDate, amITheClient, selectedClientId } =
    useClient();
  const { user } = useUser();

  const [copyActiveOption, setCopyActiveOption] = useState();
  const [deleteActiveOption, setDeleteActiveOption] = useState();
  const highlightDates = (dateRangeToCopy, type) => {
    if (dateRangeToCopy) {
      const { fromDate, toDate } = getDates(dateRangeToCopy, selectedDate);
      setDatesToHighlight?.({ fromDate, toDate, type, dateRangeToCopy });
    } else {
      setDatesToHighlight?.();
    }
  };
  useEffect(() => {
    highlightDates(copyActiveOption, "copy");
  }, [copyActiveOption]);
  useEffect(() => {
    highlightDates(deleteActiveOption, "delete");
  }, [deleteActiveOption]);

  const [copiedExercises, setCopiedExercises] = useState();
  const [copiedExercisesFromDate, setCopiedExercisesFromDate] = useState();
  const [isGettingExercises, setIsGettingExercises] = useState(false);
  const [copiedExercisesForDateRange, setCopiedExercisesForDateRange] =
    useState();
  const getExercisesWithinRange = async (
    dateRangeToCopy = copiedExercisesForDateRange
  ) => {
    const matchFilters = {
      client: selectedClientId,
    };
    if (dateRangeToCopy === "day") {
      matchFilters.date = selectedDate.toDateString();
    }
    console.log("matchFilters", matchFilters);
    let query = supabase.from("exercise").select("*").match(matchFilters);
    if (dateRangeToCopy !== "day") {
      const { fromDate, toDate } = getDates(dateRangeToCopy, selectedDate);
      console.log("getting exercises from-to", fromDate, toDate);
      query = query
        .gte("date", fromDate.toDateString())
        .lte("date", toDate.toDateString());
    }
    const { data: exercises, error } = await query
      .order("date", { ascending: true })
      .order("time", { ascending: true })
      .order("created_at", { ascending: true });
    return { exercises, error };
  };
  const getExercisesToCopy = async (dateRangeToCopy) => {
    /*
    if (copiedExercises && dateRangeToCopy == copiedExercisesForDateRange) {
      return;
    }
    */
    if (!selectedClientId) {
      return;
    }
    if (isGettingExercises) {
      return;
    }
    console.log("getting exercises for dateRangeToCopy", dateRangeToCopy);
    setIsGettingExercises(true);
    const { exercises, error } = await getExercisesWithinRange(dateRangeToCopy);
    const { fromDate } = getDates(dateRangeToCopy, selectedDate);
    if (error) {
      console.error(error);
    } else {
      console.log(
        "got exercises for dateRangeToCopy",
        dateRangeToCopy,
        exercises
      );
      setCopiedExercisesFromDate(fromDate);
      setCopiedExercisesForDateRange(dateRangeToCopy);
      setCopiedExercises(exercises);
    }
    setIsGettingExercises(false);
  };

  const [dateRangeToCopy, setDateRangeToCopy] = useState();
  useEffect(() => {
    if (dateRangeToCopy) {
      console.log("dateRangeToCopy", dateRangeToCopy);
      getExercisesToCopy(dateRangeToCopy);
      setDateRangeToCopy();
    }
  }, [dateRangeToCopy]);

  const [isPastingExercises, setIsPastingExercises] = useState(false);
  const pasteExercises = async () => {
    if (isPastingExercises) {
      return;
    }
    if (!copiedExercises || copiedExercises?.length === 0) {
      return;
    }

    console.log("PASTE!");
    setIsPastingExercises(true);

    const { exercises: existingExercises, error } =
      await getExercisesWithinRange(copiedExercisesForDateRange);

    const { fromDate, toDate } = getDates(
      copiedExercisesForDateRange,
      selectedDate
    );
    const shiftedCopiedExercises = copiedExercises.map((copiedExercise) => {
      const {
        client,
        client_email,

        date,

        coach,
        coach_email,

        number_of_sets_assigned,
        number_of_reps_assigned,
        is_weight_in_kilograms,
        weight_assigned,
      } = copiedExercise;

      const originalCopiedDate = stringToDate(date);
      const daysSinceOriginalDate = Math.floor(
        (originalCopiedDate - copiedExercisesFromDate) / (1000 * 60 * 60 * 24)
      );
      const newDate = new Date(fromDate);
      newDate.setDate(newDate.getDate() + daysSinceOriginalDate);

      console.log("from-to", originalCopiedDate, copiedExercisesFromDate);
      console.log("originalCopiedDate", originalCopiedDate);
      console.log("daysSinceOriginalDate", daysSinceOriginalDate);
      console.log("newDate", newDate);

      const insertedExercise = {
        type: copiedExercise.type,

        date: newDate.toDateString(),

        client: selectedClientId,
        client_email: selectedClient.client_email,

        number_of_sets_assigned,
        number_of_reps_assigned,
        is_weight_in_kilograms,
        weight_assigned,
      };

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
    const filteredExercisesToCopy = shiftedCopiedExercises.filter(
      (copiedExercise) => {
        return existingExercises.every((existingExercise) => {
          return (
            existingExercise.date != copiedExercise.date &&
            existingExercise.type != copiedExercise.type
          );
        });
      }
    );
    console.log("filteredExercisesToCopy", filteredExercisesToCopy);
    if (filteredExercisesToCopy.length > 0) {
      const { data: pastedExercises, error } = await supabase
        .from("exercise")
        .insert(filteredExercisesToCopy);
      if (error) {
        console.error(error);
      } else {
        console.log("pastedExercises", pastedExercises);
      }
      refreshExercises();
    }
    setIsPastingExercises(false);
  };

  const [dateRangeToDelete, setDateRangeToDelete] = useState();
  useEffect(() => {
    if (dateRangeToDelete) {
      console.log("dateRangeToDelete", dateRangeToDelete);
      setDateRangeToDelete();
      deleteExercises(dateRangeToDelete);
    }
  }, [dateRangeToDelete]);

  const [isGettingExercisesToDelete, setIsGettingExercisesToDelete] =
    useState(false);
  const deleteExercises = async (dateRangeToDelete) => {
    if (isGettingExercisesToDelete) {
      return;
    }
    setIsGettingExercisesToDelete(true);
    const { exercises, error } = await getExercisesWithinRange(
      dateRangeToDelete
    );
    if (error) {
      console.error(error);
    } else {
      console.log("exercises to delete", exercises);
      if (exercises.length) {
        setSelectedExercises(exercises);
        setShowDeleteExerciseModal(true);
      }
    }
    setIsGettingExercisesToDelete(false);
  };

  return (
    <div className="mt-3 space-y-2 sm:mt-3 sm:grid sm:grid-flow-row-dense sm:grid-cols-3 sm:gap-3 sm:space-y-0">
      <MultiDateSelect
        activeOption={copyActiveOption}
        setActiveOption={setCopyActiveOption}
        title="Copy Exercises"
        className="col-span-2 w-full"
        setDateRange={setDateRangeToCopy}
        color="blue"
        onClick={() => setDateRangeToCopy("day")}
      />
      <button
        type="button"
        disabled={!(copiedExercises?.length > 0)}
        className={classNames(
          "col-span-1 inline-flex w-full justify-center self-center rounded-md border border-transparent px-4 py-1 text-base font-medium text-white shadow-sm sm:mt-0 sm:py-2 sm:text-sm",
          copiedExercises?.length > 0
            ? "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            : "bg-blue-400"
        )}
        onClick={() => pasteExercises()}
        onMouseEnter={() => {
          highlightDates(copiedExercisesForDateRange, "paste");
        }}
        onMouseLeave={() => {
          highlightDates();
        }}
      >
        Paste
      </button>
      <MultiDateSelect
        activeOption={deleteActiveOption}
        setActiveOption={setDeleteActiveOption}
        title="Delete Exercises"
        className="col-span-3 w-full"
        setDateRange={setDateRangeToDelete}
        color="red"
        onClick={() => setDateRangeToDelete("day")}
      />
    </div>
  );
}
