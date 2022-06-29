import AccountCalendarLayout from "../../components/layouts/AccountCalendarLayout";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import { useClient } from "../../context/client-context";
import AddExerciseModal from "../../components/account/modal/AddExerciseModal";
import DeleteExerciseModal from "../../components/account/modal/DeleteExerciseModal";
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

  const [showDeleteExerciseModal, setShowDeleteExerciseModal] = useState(false);
  const [showDeleteExerciseNotification, setShowDeleteExerciseNotification] =
    useState(false);
  const [deleteExerciseStatus, setDeleteExerciseStatus] = useState();
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

      <DeleteExerciseModal
        open={showDeleteExerciseModal}
        setOpen={setShowDeleteExerciseModal}
        selectedResult={selectedExercise}
        setDeleteResultStatus={setDeleteExerciseStatus}
        setShowDeleteResultNotification={setShowDeleteExerciseNotification}
      />
      <Notification
        open={showDeleteExerciseNotification}
        setOpen={setShowDeleteExerciseNotification}
        status={deleteExerciseStatus}
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
                  className="aspect-[4/3] w-full"
                  src={exerciseVideos[exercise.type.id]?.url}
                  muted={true}
                  playsInline={true}
                  autoPlay={true}
                  loop={true}
                ></LazyVideo>
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
