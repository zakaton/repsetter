import AccountCalendarLayout from "../../components/layouts/AccountCalendarLayout";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import { useClient } from "../../context/client-context";
import AddExerciseModal from "../../components/account/modal/AddExerciseModal";
import { useEffect, useState } from "react";
import Notification from "../../components/Notification";
import { supabase } from "../../utils/supabase";
import { useUser } from "../../context/user-context";
import { useExerciseVideos } from "../../context/exercise-videos-context";
import LazyVideo from "../../components/LazyVideo";

export default function Workouts() {
  const { user } = useUser();
  const { exerciseVideos, getExerciseVideo } = useExerciseVideos();
  const { selectedClient, selectedDate, amITheClient, selectedClientId } =
    useClient();

  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showAddExerciseNotification, setShowAddExerciseNotification] =
    useState(false);
  const [addExerciseStatus, setAddExerciseStatus] = useState();

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
        .from(`exercise`)
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

  return (
    <>
      <AddExerciseModal
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
          <div key={exercise.id}>
            <LazyVideo
              src={exerciseVideos[exercise.type.id]?.url}
              muted={true}
              playsInline={true}
              autoPlay={true}
              loop={true}
            ></LazyVideo>
          </div>
        ))}
      </AccountCalendarLayout>
    </>
  );
}

Workouts.getLayout = getAccountLayout;
