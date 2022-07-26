/* eslint-disable react/destructuring-assignment */
import { useEffect, useState } from "react";
import Modal from "../../Modal";
import { ScaleIcon } from "@heroicons/react/outline";
import {
  supabase,
  dateFromDateAndTime,
  dateToString,
} from "../../../utils/supabase";
import { useClient } from "../../../context/client-context";
import { useUser } from "../../../context/user-context";
import {
  kilogramsToPounds,
  poundsToKilograms,
} from "../../../utils/exercise-utils";
import { weightEvents } from "../../../utils/weight-utils";
import { useWiiBalanceBoard } from "../../../context/wii-balance-board-context";
import MiSmartScale2 from "../../../utils/MiSmartScale2";
import MiBodyCompositionScale from "../../../utils/MiBodyCompositionScale";

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
    isUsingKilograms: _isUsingKilograms,
  } = props;

  const { selectedDate } = useClient();
  const { user } = useUser();

  const [scaleType, setScaleType] = useState();

  // WII BALANCE BOARD START
  const {
    wiiBalanceBoard,
    canConnectToWiiBalanceBoard,
    connectToWiiBalanceBoard,
    addWiiBalanceBoardEventListener,
    removeWiiBalanceBoardEventListener,
    openWiiBalanceBoardData,
    closeWiiBalanceBoardData,
  } = useWiiBalanceBoard();
  const [wiiBalanceBoardWeight, setWiiBalanceBoardWeight] = useState();
  useEffect(() => {
    if (scaleType === "wiiBalanceBoard") {
      openWiiBalanceBoardData();
    } else {
      closeWiiBalanceBoardData();
    }
  }, [scaleType, wiiBalanceBoard]);

  const onWiiBalanceBoardWeightData = (weights) => {
    const { total } = weights;
    setWiiBalanceBoardWeight(total);
  };
  const onWiiBalanceBoardButtonDown = () => {
    captureWiiBalanceBoardWeight();
  };
  useEffect(() => {
    if (wiiBalanceBoard) {
      addWiiBalanceBoardEventListener("weights", onWiiBalanceBoardWeightData);
      addWiiBalanceBoardEventListener(
        "buttondown",
        onWiiBalanceBoardButtonDown
      );
      return () => {
        removeWiiBalanceBoardEventListener(
          "weights",
          onWiiBalanceBoardWeightData
        );
        removeWiiBalanceBoardEventListener(
          "buttondown",
          onWiiBalanceBoardButtonDown
        );
      };
    }
  }, [wiiBalanceBoard]);

  const [
    isCapturingWiiBalanceBoardWeight,
    setIsCapturingWiiBalanceBoardWeight,
  ] = useState(false);
  const [
    startCapturingWiiBalanceBoardWeightTime,
    setStartCapturingWiiBalanceBoardWeightTime,
  ] = useState();
  const [
    captureWiiBalanceBoardWeightTimeoutId,
    setCaptureWiiBalanceBoardWeightTimeoutId,
  ] = useState();
  const captureWiiBalanceBoardSeconds = 3;
  const captureWiiBalanceBoardWeight = () => {
    clearTimeout(captureWiiBalanceBoardWeightTimeoutId);
    const newCaptureWiiBalanceBoardWeightTimeoutId = setTimeout(() => {
      const wiiBalanceBoardWeight = wiiBalanceBoard.weights.total;
      const newWeight = (
        isUsingKilograms
          ? wiiBalanceBoardWeight
          : kilogramsToPounds(wiiBalanceBoardWeight)
      ).toFixed(2);
      console.log("newWeight", newWeight);
      setWeight(newWeight);
      setIsWeightEmptyString(false);
      setIsCapturingWiiBalanceBoardWeight(false);
    }, captureWiiBalanceBoardSeconds * 1000);
    setCaptureWiiBalanceBoardWeightTimeoutId(
      newCaptureWiiBalanceBoardWeightTimeoutId
    );
    setStartCapturingWiiBalanceBoardWeightTime(Date.now());
    setIsCapturingWiiBalanceBoardWeight(true);
  };
  let timeSinceStartCapturingWiiBalanceBoardWeight = 0;
  if (isCapturingWiiBalanceBoardWeight) {
    timeSinceStartCapturingWiiBalanceBoardWeight = Math.floor(
      (Date.now() - startCapturingWiiBalanceBoardWeightTime) / 1000
    );
  }
  // WII BALANCE BOARD END

  // MI SMART SCALE 2 START
  const [miSmartScale2, setMiSmartScale2] = useState();
  const [miSmartScale2Weight, setMiSmartScale2Weight] = useState(0);
  const [isConnectedToMiSmartScale2, setIsConnectedToMiSmartScale2] =
    useState(false);
  useEffect(() => {
    if (navigator?.bluetooth) {
      const miSmartScale2 = new MiSmartScale2();
      setMiSmartScale2(miSmartScale2);
      window.miSmartScale2 = miSmartScale2;

      miSmartScale2.addEventListener("connected", (event) => {
        setIsConnectedToMiSmartScale2(true);
      });
      miSmartScale2.addEventListener("disconnected", (event) => {
        setIsConnectedToMiSmartScale2(false);
      });

      miSmartScale2.addEventListener("weight", (event) => {
        const { weight, isUsingKilograms, stabilized } = event.message;
        setMiSmartScale2Weight(weight);
        setIsUsingKilograms(isUsingKilograms);
        if (stabilized) {
          setWeight(weight.toFixed(2));
          setIsWeightEmptyString(false);
        }
      });

      return () => {
        miSmartScale2._listeners = {};
      };
    }
  }, []);

  useEffect(() => {
    if (!miSmartScale2) return;

    if (scaleType === "miSmartScale2") {
      miSmartScale2.open();
    } else {
      miSmartScale2.close();
    }
  }, [scaleType, miSmartScale2]);

  useEffect(() => {
    if (miSmartScale2) {
      miSmartScale2.disconnect();
    }
  }, [open]);

  // MI SMART SCALE 2 END

  // Mi Body Composition Scale START
  const [miBodyCompositionScale, setMiBodyCompositionScale] = useState();
  const [miBodyCompositionScaleWeight, setMiBodyCompositionScaleWeight] =
    useState(0);
  const [
    isConnectedToMiBodyCompositionScale,
    setIsConnectedToMiBodyCompositionScale,
  ] = useState(false);
  useEffect(() => {
    if (navigator?.bluetooth) {
      const miBodyCompositionScale = new MiBodyCompositionScale();
      setMiBodyCompositionScale(miBodyCompositionScale);
      window.miBodyCompositionScale = miBodyCompositionScale;

      miBodyCompositionScale.addEventListener("connected", (event) => {
        setIsConnectedToMiBodyCompositionScale(true);
      });
      miBodyCompositionScale.addEventListener("disconnected", (event) => {
        setIsConnectedToMiBodyCompositionScale(false);
      });

      miBodyCompositionScale.addEventListener("weight", (event) => {
        // FIX
        const { weight, isUsingKilograms, stabilized } = event.message;
        setMiBodyCompositionScaleWeight(weight);
        setIsUsingKilograms(isUsingKilograms);
        if (stabilized) {
          setWeight(weight.toFixed(2));
          setIsWeightEmptyString(false);
        }
      });

      return () => {
        miBodyCompositionScale._listeners = {};
      };
    }
  }, []);

  useEffect(() => {
    if (!miBodyCompositionScale) return;

    if (scaleType === "miBodyCompositionScale") {
      miBodyCompositionScale.open();
    } else {
      miBodyCompositionScale.close();
    }
  }, [scaleType, miBodyCompositionScale]);

  useEffect(() => {
    if (miBodyCompositionScale) {
      miBodyCompositionScale.disconnect();
    }
  }, [open]);

  // Mi Body Composition Scale END

  const [isAddingWeight, setIsAddingWeight] = useState(false);
  const [didAddWeight, setDidAddWeight] = useState(false);

  const [isUpdatingWeight, setIsUpdatingWeight] = useState(false);
  const [didUpdateWeight, setDidUpdateWeight] = useState(false);

  const [includeTime, setIncludeTime] = useState(false);

  const [weight, setWeight] = useState(0);
  const [isWeightEmptyString, setIsWeightEmptyString] = useState(true);
  const [bodyfatPercentage, setBodyfatPercentage] = useState(null);
  const [isBodyfatPercentageEmptyString, setIsBodyfatPercentageEmptyString] =
    useState(true);
  const [time, setTime] = useState();
  const [weightEvent, setWeightEvent] = useState();
  const [isUsingKilograms, setIsUsingKilograms] = useState(false);
  const [previousIsUsingKilograms, setPreviousIsUsingKilograms] =
    useState(null);

  useEffect(() => {
    if (!open) {
      setDidAddWeight(false);
      setDidUpdateWeight(false);

      setIsAddingWeight(false);
      setIsUpdatingWeight(false);
      setPreviousIsUsingKilograms(null);

      setBodyfatPercentage(null);
      setIsBodyfatPercentageEmptyString(true);

      setWiiBalanceBoardWeight();
      closeWiiBalanceBoardData();

      setScaleType();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      console.log("existingWeights", existingWeights, selectedWeight);
      if (selectedWeight) {
        setWeight(selectedWeight.weight);
        setIsWeightEmptyString(false);
        if (selectedWeight.bodyfat_percentage !== null) {
          setBodyfatPercentage(selectedWeight.bodyfat_percentage);
          setIsBodyfatPercentageEmptyString(false);
        }
        setIsUsingKilograms(selectedWeight.is_weight_in_kilograms);
        if (selectedWeight.time !== null) {
          setTime(selectedWeight.time);
          setWeightEvent(selectedWeight.event);
          setIncludeTime(true);
        }
      } else {
        if (false && existingWeights?.length > 0) {
          const latestWeightToday = existingWeights[existingWeights.length - 1];
          setIsUsingKilograms(latestWeightToday.is_weight_in_kilograms);
          setWeight(latestWeightToday.weight);
          setIsWeightEmptyString(false);
        } else if (false && lastWeightBeforeToday) {
          setWeight(lastWeightBeforeToday.weight);
          setIsWeightEmptyString(false);
          if (
            lastWeightBeforeToday.is_weight_in_kilograms != isUsingKilograms
          ) {
            setIsUsingKilograms(lastWeightBeforeToday.is_weight_in_kilograms);
          } else {
            setPreviousIsUsingKilograms(
              lastWeightBeforeToday.is_weight_in_kilograms
            );
          }
        } else {
          setWeight(0);
          setIsWeightEmptyString(true);
        }
        setIncludeTime(existingWeights?.length > 0);
        setTime(new Date().toTimeString().split(" ")[0]);
      }
    }
  }, [open, selectedWeight]);

  useEffect(() => {
    if (!open) {
      return;
    }
    console.log("previousIsUsingKilograms", previousIsUsingKilograms);
    console.log("isUsingKilograms", isUsingKilograms);
    if (previousIsUsingKilograms === null) {
      setPreviousIsUsingKilograms(isUsingKilograms);
      return;
    }

    if (isUsingKilograms !== previousIsUsingKilograms) {
      const newWeight = isUsingKilograms
        ? poundsToKilograms(weight)
        : kilogramsToPounds(weight);
      setWeight(newWeight.toFixed(2));
      setPreviousIsUsingKilograms(isUsingKilograms);
    }
  }, [isUsingKilograms]);

  let lastWeightBeforeTodayString = "";
  if (lastWeightBeforeToday) {
    lastWeightBeforeTodayString += ` (Last weight was ${
      lastWeightBeforeToday.weight
    } ${lastWeightBeforeToday.is_weight_in_kilograms ? "kg" : "lbs"}${
      lastWeightBeforeToday.bodyfat_percentage !== null
        ? ` with ${lastWeightBeforeToday.bodyfat_percentage}% bodyfat`
        : ""
    }`;
    const date = dateFromDateAndTime(
      lastWeightBeforeToday.date,
      lastWeightBeforeToday.time
    );

    let daysSincePreviousWeight = 0;
    daysSincePreviousWeight = Math.ceil(
      (selectedDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    lastWeightBeforeTodayString += ` ${daysSincePreviousWeight} day${
      daysSincePreviousWeight > 1 ? "s" : ""
    } ago on `;
    lastWeightBeforeTodayString += date.toDateString();
    if (lastWeightBeforeToday.time) {
      lastWeightBeforeTodayString += ` at ${date.toLocaleTimeString([], {
        timeStyle: "short",
      })}`;
    }
    lastWeightBeforeTodayString += ")";
  }

  return (
    <Modal
      {...props}
      title={selectedWeight ? "Update Bodyweight" : "Add Bodyweight"}
      message={`${
        selectedWeight ? "Update" : "Add"
      } today's bodyweight, and optionally the time of day.${lastWeightBeforeTodayString}`}
      Icon={ScaleIcon}
      Button={
        <button
          type="submit"
          form="weightForm"
          className="inline-flex h-fit w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
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
        className="my-5 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3"
        id="weightForm"
        onSubmit={async (e) => {
          e.preventDefault();
          let status = {};
          if (selectedWeight) {
            setIsUpdatingWeight(true);
            const updateWeightData = {
              weight,
              is_weight_in_kilograms: isUsingKilograms,
              bodyfat_percentage: bodyfatPercentage,
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
              //date: selectedDate,
              date: dateToString(selectedDate),
              weight,
              is_weight_in_kilograms: isUsingKilograms,
              client: user.id,
              client_email: user.email,
              bodyfat_percentage: bodyfatPercentage,
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
              inputMode="decimal"
              min="0"
              placeholder="0"
              name="weight"
              id="weight"
              step="0.01"
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
                <option>lbs</option>
                <option>kg</option>
              </select>
            </div>
          </div>
        </div>
        <div className="col-span-1">
          <label
            htmlFor="bodyfatPercentage"
            className="block text-sm font-medium text-gray-700"
          >
            Bodyfat Percentage
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              placeholder="0"
              name="bodyfatPercentage"
              id="bodyfatPercentage"
              step="0.1"
              className="hide-arrows block w-full rounded-md border-gray-300 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={isBodyfatPercentageEmptyString ? "" : bodyfatPercentage}
              onInput={(e) => {
                setIsBodyfatPercentageEmptyString(e.target.value === "");
                const newBodyfatPercentage =
                  e.target.value === "" ? null : Number(e.target.value);
                setBodyfatPercentage(newBodyfatPercentage);
              }}
            />
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

        {(canConnectToWiiBalanceBoard || miSmartScale2) && (
          <div>
            <label
              htmlFor="scale-type"
              className="block text-sm font-medium text-gray-700"
            >
              Scale Type
            </label>
            <select
              onInput={(e) => setScaleType(e.target.value)}
              id="scale-type"
              name="scale-type"
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              defaultValue=""
            >
              <optgroup label="Select a Scale Type">
                <option value="">None</option>
                {canConnectToWiiBalanceBoard && (
                  <option value="wiiBalanceBoard">Wii Balance Board</option>
                )}
                {miSmartScale2 && (
                  <option value="miSmartScale2">Mi Smart Scale 2</option>
                )}
                {miBodyCompositionScale && (
                  <option value="miBodyCompositionScale">
                    Mi Body Composition Scale
                  </option>
                )}
              </optgroup>
            </select>
          </div>
        )}

        {scaleType === "wiiBalanceBoard" &&
          canConnectToWiiBalanceBoard &&
          !wiiBalanceBoard && (
            <button
              type="button"
              onClick={() => connectToWiiBalanceBoard()}
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Connect to Wii Balance Board
            </button>
          )}
        {scaleType === "wiiBalanceBoard" && wiiBalanceBoard && (
          <div className="col-span-1">
            <label
              htmlFor="wii-weight"
              className="block text-sm font-medium text-gray-700"
            >
              Wii Balance Board Weight
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                readOnly
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="0"
                name="wii-weight"
                id="wii-weight"
                className="hide-arrows block w-full rounded-md border-gray-300 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={
                  wiiBalanceBoardWeight
                    ? (isUsingKilograms
                        ? wiiBalanceBoardWeight
                        : kilogramsToPounds(wiiBalanceBoardWeight)
                      ).toFixed(2)
                    : ""
                }
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <label htmlFor="weight-type-wii" className="sr-only">
                  weight type
                </label>
                <select
                  id="weight-type-wii"
                  name="weight-type-wii"
                  className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  onChange={(e) => setIsUsingKilograms(e.target.value === "kg")}
                  value={isUsingKilograms ? "kg" : "lbs"}
                >
                  <option>lbs</option>
                  <option>kg</option>
                </select>
              </div>
            </div>
          </div>
        )}
        {scaleType === "wiiBalanceBoard" && wiiBalanceBoard && (
          <button
            type="button"
            onClick={() => captureWiiBalanceBoardWeight()}
            className="inline-flex h-fit w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
          >
            {isCapturingWiiBalanceBoardWeight
              ? captureWiiBalanceBoardSeconds -
                timeSinceStartCapturingWiiBalanceBoardWeight
              : "Capture Wii Balance Board Weight"}
          </button>
        )}

        {scaleType === "miSmartScale2" &&
          miSmartScale2 &&
          !isConnectedToMiSmartScale2 && (
            <button
              type="button"
              onClick={() => miSmartScale2.connect()}
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Connect to Mi Smart Scale 2
            </button>
          )}
        {scaleType === "miSmartScale2" &&
          miSmartScale2 &&
          miSmartScale2.isConnected && (
            <div className="col-span-1">
              <label
                htmlFor="mi-smart-scale-2-weight"
                className="block text-sm font-medium text-gray-700"
              >
                Mi Smart Scale 2 Weight
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  readOnly
                  type="number"
                  inputMode="decimal"
                  min="0"
                  placeholder="0"
                  name="mi-smart-scale-2-weight"
                  id="mi-smart-scale-2-weight"
                  className="hide-arrows block w-full rounded-md border-gray-300 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={
                    miSmartScale2Weight
                      ? (isUsingKilograms
                          ? miSmartScale2Weight
                          : kilogramsToPounds(miSmartScale2Weight)
                        ).toFixed(2)
                      : ""
                  }
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <label
                    htmlFor="weight-type-mi-smart-scale-2"
                    className="sr-only"
                  >
                    weight type
                  </label>
                  <select
                    id="weight-type-mi-smart-scale-2"
                    name="weight-type-mi-smart-scale-2"
                    className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    onChange={(e) =>
                      setIsUsingKilograms(e.target.value === "kg")
                    }
                    value={isUsingKilograms ? "kg" : "lbs"}
                  >
                    <option>lbs</option>
                    <option>kg</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        {scaleType === "miBodyCompositionScale" &&
          miBodyCompositionScale &&
          !isConnectedToMiBodyCompositionScale && (
            <button
              type="button"
              onClick={() => miBodyCompositionScale.connect()}
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Connect to Mi Body Composition Scale
            </button>
          )}
        {scaleType === "miBodyCompositionScale" &&
          miBodyCompositionScale &&
          miBodyCompositionScale.isConnected && (
            <div className="col-span-1">
              <label
                htmlFor="mi-smart-scale-2-weight"
                className="block text-sm font-medium text-gray-700"
              >
                Mi Body Composition Scale Weight
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  readOnly
                  type="number"
                  inputMode="decimal"
                  min="0"
                  placeholder="0"
                  name="mi-smart-scale-2-weight"
                  id="mi-smart-scale-2-weight"
                  className="hide-arrows block w-full rounded-md border-gray-300 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={
                    miBodyCompositionScaleWeight
                      ? (isUsingKilograms
                          ? miBodyCompositionScaleWeight
                          : kilogramsToPounds(miBodyCompositionScaleWeight)
                        ).toFixed(2)
                      : ""
                  }
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <label
                    htmlFor="weight-type-mi-smart-scale-2"
                    className="sr-only"
                  >
                    weight type
                  </label>
                  <select
                    id="weight-type-mi-smart-scale-2"
                    name="weight-type-mi-smart-scale-2"
                    className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    onChange={(e) =>
                      setIsUsingKilograms(e.target.value === "kg")
                    }
                    value={isUsingKilograms ? "kg" : "lbs"}
                  >
                    <option>lbs</option>
                    <option>kg</option>
                  </select>
                </div>
              </div>
            </div>
          )}
      </form>
    </Modal>
  );
}
