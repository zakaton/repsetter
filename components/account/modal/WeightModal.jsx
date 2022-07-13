/* eslint-disable react/destructuring-assignment */
import { useEffect, useState } from "react";
import Modal from "../../Modal";
import { ScaleIcon } from "@heroicons/react/outline";
import { supabase } from "../../../utils/supabase";
import { useClient } from "../../../context/client-context";
import { useUser } from "../../../context/user-context";
import {
  kilogramsToPounds,
  poundsToKilograms,
} from "../../../utils/exercise-utils";
import { weightEvents } from "../../../utils/weight-utils";

export default function WeightModal(props) {
  const {
    open,
    setOpen,
    selectedResult: selectedWeight,
    setSelectedResult: setSelectedWeight,
    setResultStatus: setWeightStatus,
    setShowResultNotification: setShowWeightNotification,
    existingResults: existingWeights = [],
    lastWeightBeforeToday,
  } = props;

  const { selectedDate } = useClient();
  const { user } = useUser();

  useEffect(() => {
    if (!open) {
      setDidAddWeight(false);
      setDidUpdateWeight(false);

      setIsAddingWeight(false);
      setIsUpdatingWeight(false);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      console.log("existingWeights", existingWeights, selectedWeight);
      if (selectedWeight) {
        setWeight(selectedWeight.weight);
        setIsWeightEmptyString(false);
        setIsUsingKilograms(selectedWeight.is_weight_in_kilograms);
        if (selectedWeight.time !== null) {
          setTime(selectedWeight.time);
          setWeightEvent(selectedWeight.event);
          setIncludeTime(true);
        }
      } else {
        if (existingWeights?.length > 0) {
          const latestWeightToday = existingWeights[existingWeights.length - 1];
          console.log("latestWeightToday", latestWeightToday);
          setWeight(latestWeightToday.weight);
          setIsUsingKilograms(latestWeightToday.is_weight_in_kilograms);
          setIsWeightEmptyString(false);
        } else if (lastWeightBeforeToday) {
          setWeight(lastWeightBeforeToday.weight);
          setIsUsingKilograms(lastWeightBeforeToday.is_weight_in_kilograms);
          setIsWeightEmptyString(false);
        } else {
          setWeight(0);
          setIsWeightEmptyString(true);
        }
        setIncludeTime(existingWeights?.length > 0);
        setTime(new Date().toTimeString().split(" ")[0]);
      }
    }
  }, [open, selectedWeight]);

  const [isAddingWeight, setIsAddingWeight] = useState(false);
  const [didAddWeight, setDidAddWeight] = useState(false);

  const [isUpdatingWeight, setIsUpdatingWeight] = useState(false);
  const [didUpdateWeight, setDidUpdateWeight] = useState(false);

  const [includeTime, setIncludeTime] = useState(false);

  const [weight, setWeight] = useState(0);
  const [time, setTime] = useState();
  const [weightEvent, setWeightEvent] = useState();
  const [isWeightEmptyString, setIsWeightEmptyString] = useState(true);
  const [isUsingKilograms, setIsUsingKilograms] = useState(false);
  const [previousIsUsingKilograms, setPreviousIsUsingKilograms] =
    useState(null);
  useEffect(() => {
    if (previousIsUsingKilograms === null) {
      setPreviousIsUsingKilograms(isUsingKilograms);
      return;
    }

    if (isUsingKilograms !== previousIsUsingKilograms) {
      const newWeight = isUsingKilograms
        ? poundsToKilograms(weight)
        : kilogramsToPounds(weight);
      setWeight(newWeight.toFixed(1));
      setPreviousIsUsingKilograms(isUsingKilograms);
    }
  }, [isUsingKilograms]);

  return (
    <Modal
      {...props}
      title={selectedWeight ? "Update Bodyweight" : "Add Bodyweight"}
      message={`${
        selectedWeight ? "Update" : "Add"
      } today's bodyweight, and optionally the time of day`}
      Icon={ScaleIcon}
      Button={
        <button
          type="submit"
          form="weightForm"
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
        >
          {selectedWeight
            ? isUpdatingWeight
              ? "Updating Weight..."
              : didUpdateWeight
              ? "Updated Weight!"
              : "Update Weight"
            : isAddingWeight
            ? "Adding Weight..."
            : didAddWeight
            ? "Added Weight!"
            : "Add Weight"}
        </button>
      }
    >
      <form
        className="my-5 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2"
        id="weightForm"
        onSubmit={async (e) => {
          e.preventDefault();
          let status = {};
          if (selectedWeight) {
            setIsUpdatingWeight(true);
            const updateWeightData = {
              weight,
              is_weight_in_kilograms: isUsingKilograms,
            };
            if (includeTime) {
              updateWeightData.time = time;
              updateWeightData.event = weightEvent;
            } else {
              updateWeightData.time = null;
              updateWeightData.event = null;
            }
            console.log("updateWeightData", updateWeightData);
            const { data: updatedWeight, error: updatedWeightError } =
              await supabase
                .from("weight")
                .update(updateWeightData)
                .match({ id: selectedWeight.id });
            if (updatedWeightError) {
              console.error(updatedWeightError);
              status = {
                type: "failed",
                title: "Failed to Update Weight",
                message: updatedWeightError.message,
              };
            } else {
              status = {
                type: "succeeded",
                title: "Successfully Updated Weight",
              };
            }
            setDidUpdateWeight(true);
          } else {
            setIsAddingWeight(true);
            console.log("args", weight, includeTime, time);
            const addWeightData = {
              date: selectedDate,
              weight,
              is_weight_in_kilograms: isUsingKilograms,
              client: user.id,
              client_email: user.email,
            };
            if (includeTime) {
              addWeightData.time = time;
              addWeightData.event = weightEvent;
            }
            const { data: addedWeight, error: addWeightError } = await supabase
              .from("weight")
              .insert([addWeightData]);
            if (addWeightError) {
              console.error(addWeightError);
              status = { type: "failed", message: addWeightError.message };
            } else {
              console.log("addedWeight", addedWeight);
              status = {
                type: "succeeded",
                message: "Successfully added Bodyweight",
              };
            }
            setDidAddWeight(true);
          }

          setWeightStatus(status);
          setShowWeightNotification(true);
          setOpen(false);
        }}
      >
        <div className="col-span-1">
          <label
            htmlFor="weight"
            className="block text-sm font-medium text-gray-700"
          >
            Weight
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              required
              type="number"
              min="0"
              placeholder="0"
              name="weight"
              id="weight"
              step="0.1"
              className="hide-arrows block w-full rounded-md border-gray-300 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={isWeightEmptyString ? "" : weight}
              onInput={(e) => {
                setIsWeightEmptyString(e.target.value === "");
                setWeight(Number(e.target.value));
              }}
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <label htmlFor="weight-type" className="sr-only">
                weight type
              </label>
              <select
                id="weight-type"
                name="weight-type"
                className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                onChange={(e) => setIsUsingKilograms(e.target.value === "kg")}
                value={isUsingKilograms ? "kg" : "lbs"}
              >
                <option>kg</option>
                <option>lbs</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex self-center">
          <div className="flex h-5 items-center">
            <input
              id="includeTime"
              name="includeTime"
              type="checkbox"
              disabled={!selectedWeight && existingWeights?.length > 0}
              checked={includeTime}
              onChange={(e) => {
                setIncludeTime(e.target.checked);
              }}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="includeTime" className="font-medium text-gray-700">
              Include time
            </label>
          </div>
        </div>
        {includeTime && (
          <div className="col-span-1">
            <label
              htmlFor="time"
              className="block text-sm font-medium text-gray-700"
            >
              Time
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                required={includeTime}
                type="time"
                name="time"
                id="time"
                step="60"
                className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={time?.split(":").slice(0, 2).join(":") || ""}
                onInput={(e) => {
                  setTime(e.target.value);
                }}
              />
            </div>
          </div>
        )}
        {includeTime && (
          <div className="col-span-1">
            <label
              htmlFor="event"
              className="block text-sm font-medium text-gray-700"
            >
              Event
            </label>
            <select
              id="event"
              name="event"
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              value={weightEvent || ""}
              onInput={(e) => {
                setWeightEvent(e.target.value);
              }}
            >
              {weightEvents.map(({ name }) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </div>
        )}
      </form>
    </Modal>
  );
}
