/* eslint-disable react/destructuring-assignment */
import { useEffect, useState } from "react";
import Modal from "../../Modal";
import { ClipboardCheckIcon } from "@heroicons/react/outline";
import { supabase } from "../../../utils/supabase";
import {
  poundsToKilograms,
  kilogramsToPounds,
} from "../../../utils/exercise-utils";
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

  const [sameRepsForEachSet, setSameRepsForEachSet] = useState(true);
  const [numberOfReps, setNumberOfReps] = useState([10]);

  const [sameWeightForEachSet, setSameWeighForEachSet] = useState(true);
  const [isUsingKilograms, setIsUsingKilograms] = useState(true);
  const [weightKilograms, setWeightKilograms] = useState([0]);
  const [weightPounds, setWeightPounds] = useState([0]);

  const [isWeightInputEmptyString, setIsWeightInputEmptyString] = useState([]);

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
        <div className="">
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
              onInput={(e) => {
                const newNumberOfSets = Number(e.target.value);
                if (sameRepsForEachSet) {
                  setNumberOfReps([numberOfReps[0]]);
                  setWeightKilograms([weightKilograms[0]]);
                  setWeightPounds([weightPounds[0]]);
                  setIsWeightInputEmptyString([isWeightInputEmptyString[0]]);
                } else {
                  setNumberOfReps(
                    new Array(newNumberOfSets).fill(numberOfReps[0])
                  );
                  setWeightKilograms(
                    new Array(newNumberOfSets).fill(weightKilograms[0])
                  );
                  setWeightPounds(
                    new Array(newNumberOfSets).fill(weightPounds[0])
                  );
                  setIsWeightInputEmptyString(
                    new Array(newNumberOfSets).fill(isWeightInputEmptyString[0])
                  );
                }
                setNumberOfSets(newNumberOfSets);
              }}
              name="sets"
              id="sets"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="relative flex self-center">
          <div className="flex h-5 items-center">
            <input
              id="sameRepsForEachSet"
              name="sameRepsForEachSet"
              type="checkbox"
              checked={sameRepsForEachSet}
              onChange={(e) => {
                const newSameRepsForEachSet = e.target.checked;
                if (newSameRepsForEachSet) {
                  setNumberOfReps([numberOfReps[0]]);
                } else {
                  setNumberOfReps(
                    new Array(numberOfSets).fill(numberOfReps[0])
                  );
                }
                setSameRepsForEachSet(newSameRepsForEachSet);
              }}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              htmlFor="sameRepsForEachSet"
              className="font-medium text-gray-700"
            >
              Same Reps for Each Set
            </label>
          </div>
        </div>
        {sameRepsForEachSet && (
          <div className="">
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
                min="0"
                max="20"
                value={numberOfReps}
                onInput={(e) => setNumberOfReps([Number(e.target.value)])}
                name="reps"
                id="reps"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500" id="email-description">
              (0 for AMRAP)
            </p>
          </div>
        )}
        {!sameRepsForEachSet &&
          new Array(numberOfSets).fill(1).map((_, index) => (
            <div className="" key={index}>
              <label
                htmlFor={`reps-${index}`}
                className="block text-sm font-medium text-gray-700"
              >
                Number of Reps (set #{index + 1})
              </label>
              <div className="mt-1">
                <input
                  required
                  type="number"
                  min="0"
                  max="20"
                  value={numberOfReps[index]}
                  onInput={(e) => {
                    const newNumberOfReps = numberOfReps.slice();
                    newNumberOfReps[index] = Number(e.target.value);
                    setNumberOfReps(newNumberOfReps);
                  }}
                  name={`reps-${index}`}
                  id={`reps-${index}`}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500" id="email-description">
                (0 for AMRAP)
              </p>
            </div>
          ))}
        <div className="relative flex self-center">
          <div className="flex h-5 items-center">
            <input
              id="sameWeightForEachSet"
              name="sameWeightForEachSet"
              type="checkbox"
              checked={sameWeightForEachSet}
              onChange={(e) => {
                const newSameWeightForEachSet = e.target.checked;
                if (newSameWeightForEachSet) {
                  setWeightKilograms([weightKilograms[0]]);
                  setWeightPounds([weightPounds[0]]);
                  setIsWeightInputEmptyString([isWeightInputEmptyString[0]]);
                } else {
                  setWeightKilograms(
                    new Array(numberOfSets).fill(weightKilograms[0])
                  );
                  setWeightPounds(
                    new Array(numberOfSets).fill(weightPounds[0])
                  );
                  setIsWeightInputEmptyString(
                    new Array(numberOfSets).fill(isWeightInputEmptyString[0])
                  );
                }
                setSameWeighForEachSet(newSameWeightForEachSet);
              }}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              htmlFor="sameWeightForEachSet"
              className="font-medium text-gray-700"
            >
              Same Weight for Each Set
            </label>
          </div>
        </div>
        {sameWeightForEachSet && (
          <div className="">
            <label
              htmlFor="weight"
              className="block text-sm font-medium text-gray-700"
            >
              Weight
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <div className="relative flex flex-grow items-stretch focus-within:z-10">
                <input
                  type="number"
                  min="0"
                  name="weight"
                  id="weight"
                  className="block w-full rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={
                    isWeightInputEmptyString[0]
                      ? ""
                      : isUsingKilograms
                      ? weightKilograms[0]
                      : weightPounds[0]
                  }
                  placeholder={0}
                  onInput={(e) => {
                    setIsWeightInputEmptyString([e.target.value === ""]);
                    const weight = Number(e.target.value);
                    if (isUsingKilograms) {
                      setWeightKilograms([weight]);
                      setWeightPounds([Math.round(kilogramsToPounds(weight))]);
                    } else {
                      setWeightPounds([weight]);
                      setWeightKilograms([
                        Math.round(poundsToKilograms(weight)),
                      ]);
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setIsUsingKilograms(!isUsingKilograms)}
                className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <span>{isUsingKilograms ? "kg" : "lbs"}</span>
              </button>
            </div>
          </div>
        )}
        {!sameWeightForEachSet &&
          new Array(numberOfSets).fill(1).map((_, index) => (
            <div className="" key={index}>
              <label
                htmlFor={`weight-${index}`}
                className="block text-sm font-medium text-gray-700"
              >
                Weight (set #{index + 1})
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <div className="relative flex flex-grow items-stretch focus-within:z-10">
                  <input
                    type="number"
                    min="0"
                    name={`weight-${index}`}
                    id={`weight-${index}`}
                    className="block w-full rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={
                      isWeightInputEmptyString[index]
                        ? ""
                        : isUsingKilograms
                        ? weightKilograms[index]
                        : weightPounds[index]
                    }
                    placeholder={0}
                    onInput={(e) => {
                      const newIsWeightInputEmptyString =
                        isWeightInputEmptyString.slice();
                      newIsWeightInputEmptyString[index] =
                        e.target.value === "";
                      setIsWeightInputEmptyString(newIsWeightInputEmptyString);

                      const weight = Number(e.target.value);
                      const newWeightKilograms = weightKilograms.slice();
                      const newWeightPounds = weightPounds.slice();
                      if (isUsingKilograms) {
                        newWeightKilograms[index] = weight;
                        newWeightPounds[index] = Math.round(
                          kilogramsToPounds(weight)
                        );
                      } else {
                        newWeightPounds[index] = weight;
                        newWeightKilograms[index] = Math.round(
                          poundsToKilograms(weight)
                        );
                      }
                      setWeightKilograms(newWeightKilograms);
                      setWeightPounds(newWeightPounds);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsUsingKilograms(!isUsingKilograms)}
                  className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <span>{isUsingKilograms ? "kg" : "lbs"}</span>
                </button>
              </div>
            </div>
          ))}
      </form>
    </Modal>
  );
}
