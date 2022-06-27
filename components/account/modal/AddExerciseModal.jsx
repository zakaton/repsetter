/* eslint-disable react/destructuring-assignment */
import { useEffect, useState } from "react";
import Modal from "../../Modal";
import { ClipboardCheckIcon } from "@heroicons/react/outline";
import { supabase } from "../../../utils/supabase";
import { useClient } from "../../../context/client-context";
import ExerciseTypesSelect from "./ExerciseTypesSelect";

export default function AddExerciseModal(props) {
  const {
    open,
    setOpen,
    setCreateResultStatus: setAddExerciseStatus,
    setShowCreateResultNotification: setShowAddExerciseNotification,
  } = props;

  const { selectedClient, selectedDate, amITheClient, isSelectedDateToday } =
    useClient();

  useEffect(() => {
    if (!open) {
      setDidAddExercise(false);
    }
  }, [open]);

  useEffect(() => {
    if (open && didAddExercise) {
      setShowAddExerciseNotification(false);
    }
  }, [open]);

  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [didAddExercise, setDidAddExercise] = useState(false);

  const [selectedExerciseType, setSelectedExerciseType] = useState();
  const [numberOfSets, setNumberOfSets] = useState(3);
  const [numberOfReps, setNumberOfReps] = useState(10);

  return (
    <Modal
      {...props}
      title="Add Exercise"
      message={
        <>
          Add an exercise to{" "}
          <span className="font-semibold">
            {selectedClient ? `${selectedClient.client_email}'s` : "your"}
          </span>{" "}
          workout for{" "}
          <span className="font-semibold">{selectedDate.toDateString()}</span>
        </>
      }
      Icon={ClipboardCheckIcon}
      Button={
        <button
          type="submit"
          form="addExerciseForm"
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
        >
          {isAddingExercise
            ? "Adding Exercise..."
            : didAddExercise
            ? "Added Exercise!"
            : "Add Exercise"}
        </button>
      }
    >
      <form
        id="addExerciseForm"
        method="POST"
        className="my-5 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setIsAddingExercise(true);
          const form = e.target;
          // FILL
          console.log(form);
          return;
          setIsAddingExercise(false);
          setDidAddExercise(true);
          const status = {
            type: "succeeded",
            title: "Successfully added Exercise",
          };
          setAddExerciseStatus(status);
          setShowAddExerciseNotification(true);
          setOpen(false);
          if (status.type === "succeeded") {
            console.log(status);
          } else {
            console.error(status);
          }
        }}
      >
        <div className="sm:col-span-2">
          <ExerciseTypesSelect
            selectedExerciseType={selectedExerciseType}
            setSelectedExerciseType={setSelectedExerciseType}
            open={open}
          />
        </div>
        <div className="sm:col-span-1">
          <label
            htmlFor="sets"
            className="block text-sm font-medium text-gray-700"
          >
            Number of Sets
          </label>
          <div className="mt-1">
            <input
              required
              type="number"
              min="1"
              max="10"
              value={numberOfSets}
              onInput={(e) => setNumberOfSets(e.target.value)}
              name="sets"
              id="sets"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="sm:col-span-1">
          <label
            htmlFor="reps"
            className="block text-sm font-medium text-gray-700"
          >
            Number of Reps
          </label>
          <div className="mt-1">
            <input
              required
              type="number"
              min="1"
              max="20"
              value={numberOfReps}
              onInput={(e) => setNumberOfReps(e.target.value)}
              name="reps"
              id="reps"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
