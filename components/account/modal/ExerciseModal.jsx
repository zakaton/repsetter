/* eslint-disable react/destructuring-assignment */
import React, { useEffect, useState } from "react";
import Modal from "../../Modal";
import { ClipboardCheckIcon, RefreshIcon } from "@heroicons/react/outline";
import { supabase, timeToDate, stringToDate } from "../../../utils/supabase";
import {
  poundsToKilograms,
  kilogramsToPounds,
} from "../../../utils/exercise-utils";
import { useClient } from "../../../context/client-context";
import ExerciseTypesSelect from "./ExerciseTypesSelect";
import { useUser } from "../../../context/user-context";
import YouTube from "react-youtube";
import MyLink from "../../MyLink";
import ExerciseTypeVideo from "../../ExerciseTypeVideo";

export default function ExerciseModal(props) {
  const {
    open,
    setOpen,
    setCreateResultStatus: setAddExerciseStatus,
    setShowCreateResultNotification: setShowAddExerciseNotification,
    existingExercises,

    selectedResult: selectedExercise,
    setSelectedResult: setSelectedExercise,
    setEditResultStatus: setEditExerciseStatus,
    setShowEditResultNotification: setShowEditExerciseNotification,
  } = props;

  const {
    selectedClient,
    selectedDate,
    amITheClient,
    setSelectedDate,
    selectedClientId,
  } = useClient();
  const { user } = useUser();

  useEffect(() => {
    if (!open) {
      setDidAddExercise(false);
      setDidUpdateExercise(false);
      setPreviousExercise();
      resetUI();
    }
  }, [open]);

  useEffect(() => {
    if (open && didAddExercise) {
      setShowAddExerciseNotification(false);
      setShowEditExerciseNotification(false);
    }
  }, [open]);

  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [didAddExercise, setDidAddExercise] = useState(false);

  const [isUpdatingExercise, setIsUpdatingExercise] = useState(false);
  const [didUpdateExercise, setDidUpdateExercise] = useState(false);

  const [selectedExerciseType, setSelectedExerciseType] = useState(null);
  const [numberOfSets, setNumberOfSets] = useState(3);
  const [isNumberOfSetsEmptyString, setIsNumberOfSetsEmptyString] =
    useState(false);
  const [numberOfSetsPerformed, setNumberOfSetsPerformed] = useState(0);
  const [isSetsPerformedEmptyString, setIsSetsPerformedEmptyString] =
    useState(false);

  const [timePerformed, setTimePerformed] = useState();
  const [includeTimePerformed, setIncludeTimePerformed] = useState(false);

  const [sameRepsForEachSet, setSameRepsForEachSet] = useState(true);
  const [numberOfReps, setNumberOfReps] = useState([10]);
  const [isNumberOfRepsEmptyString, setIsNumberOfRepsEmptyString] = useState(
    []
  );
  const [numberOfRepsPerformed, setNumberOfRepsPerformed] = useState(0);
  const [isRepsPerformedEmptyString, setIsRepsPerformedEmptyString] = useState(
    []
  );

  const [sameWeightForEachSet, setSameWeightForEachSet] = useState(true);
  const [isUsingKilograms, setIsUsingKilograms] = useState(true);
  const [weightKilograms, setWeightKilograms] = useState([0]);
  const [weightPounds, setWeightPounds] = useState([0]);
  const [weightPerformedKilograms, setWeightPerformedKilograms] = useState([0]);
  const [weightPerformedPounds, setWeightPerformedPounds] = useState([0]);

  useEffect(() => {
    if (isUsingKilograms) {
      setWeightPounds(
        weightKilograms.map((weight) => Math.round(kilogramsToPounds(weight)))
      );
    }
  }, [weightKilograms]);
  useEffect(() => {
    if (!isUsingKilograms) {
      setWeightKilograms(
        weightPounds.map((weight) => Math.round(poundsToKilograms(weight)))
      );
    }
  }, [weightPounds]);

  const setWeight = (weight, useKilograms = isUsingKilograms) => {
    if (useKilograms) {
      setWeightKilograms(weight);
    } else {
      setWeightPounds(weight);
    }
  };
  const setWeightPerformed = (weight, useKilograms = isUsingKilograms) => {
    if (useKilograms) {
      setWeightPerformedKilograms(weight);
    } else {
      setWeightPerformedPounds(weight);
    }
  };

  useEffect(() => {
    if (isUsingKilograms) {
      setWeightPerformedPounds(
        weightPerformedKilograms.map((weight) =>
          Math.round(kilogramsToPounds(weight))
        )
      );
    }
  }, [weightPerformedKilograms]);
  useEffect(() => {
    if (!isUsingKilograms) {
      setWeightPerformedKilograms(
        weightPerformedPounds.map((weight) =>
          Math.round(poundsToKilograms(weight))
        )
      );
    }
  }, [weightPerformedPounds]);

  const [isWeightInputEmptyString, setIsWeightInputEmptyString] = useState([]);
  const [isWeightPerformedEmptyString, setIsWeightPerformedEmptyString] =
    useState([]);

  const [isDifficultyEmptyString, setIsDifficultyEmptyString] = useState([]);
  const [difficulty, setDifficulty] = useState([]);

  const [video, setVideo] = useState([]);
  const [videoPlayer, setVideoPlayer] = useState([]);

  const resetUI = () => {
    setIsAddingExercise(false);
    setDidAddExercise(false);
    setSelectedExerciseType(null);

    setNumberOfSets(3);
    setIsNumberOfSetsEmptyString(false);

    setNumberOfReps([10]);
    setSameRepsForEachSet(true);
    setIsNumberOfRepsEmptyString([]);

    setWeight([0]);
    setSameWeightForEachSet(true);
    setIsWeightInputEmptyString([]);

    setIncludeRestDuration(false);
    setSameRestDurationForEachSet(true);
    setRestDuration([0]);
    setIsRestDurationEmptyString([]);

    setSameSetDurationForEachSet(true);
    setSetDurationAssigned([0]);
    setIsSetDurationEmptyString([]);
    setIsSetDurationPerformedEmptyString([]);

    setIsUpdatingExercise(false);
    setDidUpdateExercise(false);
    setSelectedExercise?.(null);

    setIncludeTimePerformed(false);
    setTimePerformed();
  };

  useEffect(() => {
    if (open && selectedExercise) {
      setNumberOfSets(selectedExercise.number_of_sets_assigned);
      if (selectedExercise.number_of_reps_assigned) {
        setNumberOfReps(selectedExercise.number_of_reps_assigned);
      }
      if (selectedExercise.is_weight_in_kilograms !== null) {
        setIsUsingKilograms(selectedExercise.is_weight_in_kilograms);
      }
      if (selectedExercise.weight_assigned) {
        setWeight(selectedExercise.weight_assigned);
      }
      if (selectedExercise.weight_assigned !== null) {
        const sameWeightForEachSet =
          selectedExercise.weight_assigned?.length == 1;
        setSameWeightForEachSet(sameWeightForEachSet);
      }

      if (selectedExercise.number_of_sets_performed !== null) {
        setNumberOfSetsPerformed(selectedExercise.number_of_sets_performed);
      } else {
        setNumberOfSetsPerformed(selectedExercise.number_of_sets_assigned);
      }

      if (selectedExercise.number_of_reps_assigned) {
        const sameRepsForEachSet =
          selectedExercise.number_of_reps_assigned.length == 1;
        setSameRepsForEachSet(sameRepsForEachSet);

        let repsPerformed =
          selectedExercise.number_of_reps_performed !== null
            ? selectedExercise.number_of_reps_performed
            : selectedExercise.number_of_reps_assigned;
        if (repsPerformed.length != selectedExercise.number_of_sets_assigned) {
          repsPerformed = new Array(
            selectedExercise.number_of_sets_assigned
          ).fill(0);
        }
        setNumberOfRepsPerformed(repsPerformed);
      }

      let difficulty = selectedExercise.difficulty || [];
      if (difficulty.length != selectedExercise.number_of_sets_assigned) {
        difficulty = new Array(selectedExercise.number_of_sets_assigned).fill(
          0
        );
      }
      setDifficulty(difficulty);

      const video =
        selectedExercise.video?.map((value) => JSON.parse(value)) || [];
      console.log("parsedVideo", video);
      setVideo(video);

      if (selectedExercise.weight_assigned) {
        let weightPerformed =
          selectedExercise.weight_performed !== null
            ? selectedExercise.weight_performed
            : selectedExercise.weight_assigned;
        if (
          weightPerformed.length != selectedExercise.number_of_sets_assigned
        ) {
          weightPerformed = new Array(
            selectedExercise.number_of_sets_assigned
          ).fill(weightPerformed[0]);
        }
        if (selectedExercise.is_weight_in_kilograms) {
          setWeightPerformedKilograms(weightPerformed);
        } else {
          setWeightPerformedPounds(weightPerformed);
        }
      }

      if (selectedExercise.time) {
        setTimePerformed(selectedExercise.time);
        setIncludeTimePerformed(true);
      }

      if (selectedExercise.rest_duration) {
        setIncludeRestDuration(true);
        setSameRestDurationForEachSet(
          selectedExercise.rest_duration.length !==
            selectedExercise.number_of_sets_assigned
        );
        setRestDuration(selectedExercise.rest_duration);
      }

      if (selectedExercise.set_duration_assigned) {
        const sameSetDurationForEachSet =
          selectedExercise.set_duration_assigned.length == 1;
        setSameSetDurationForEachSet(sameSetDurationForEachSet);

        setSetDurationAssigned(selectedExercise.set_duration_assigned);

        let setDurationPerformed =
          selectedExercise.set_duration_performed !== null
            ? selectedExercise.set_duration_performed
            : selectedExercise.set_duration_assigned;
        if (
          setDurationPerformed.length !=
          selectedExercise.number_of_sets_assigned
        ) {
          setDurationPerformed = new Array(
            selectedExercise.number_of_sets_assigned
          ).fill(0);
        }
        setSetDurationPerformed(setDurationPerformed);
      }
    }
  }, [open, selectedExercise]);

  const [previousExercise, setPreviousExercise] = useState();
  const [isGettingPreviousExercise, setIsGettingPreviousExercise] =
    useState(false);
  const getPreviousExercise = async () => {
    if (!isGettingPreviousExercise) {
      setIsGettingPreviousExercise(true);
      console.log("getting previous exercise...");
      const { data: previousExercises, error } = await supabase
        .from("exercise")
        .select("*")
        .match({ client: selectedClientId })
        .eq("type", selectedExerciseType.id)
        .lt("date", selectedDate.toDateString())
        .order("date", { ascending: false })
        .limit(1);
      console.log("previousExercises", previousExercises);
      if (error) {
        console.error(error);
      } else {
        if (previousExercises.length > 0) {
          setPreviousExercise(previousExercises[0]);
        }
      }
      setIsGettingPreviousExercise(false);
    }
  };
  useEffect(() => {
    if (open && selectedDate && selectedExerciseType && selectedClientId) {
      getPreviousExercise();
    }
  }, [selectedExerciseType, selectedClientId]);

  let daysSincePreviousExercise = 0;
  if (previousExercise) {
    daysSincePreviousExercise = Math.floor(
      (selectedDate - new Date(previousExercise.date)) / (1000 * 60 * 60 * 24)
    );
  }

  const [previousVideo, setPreviousVideo] = useState([]);
  const [previousVideoPlayer, setPreviousVideoPlayer] = useState([]);
  useEffect(() => {
    if (open && previousExercise && !selectedExercise) {
      const video =
        previousExercise.video?.map((value) => JSON.parse(value)) || [];
      console.log("parsedPreviousVideo", video);
      setPreviousVideo(video);
    }
  }, [previousExercise]);

  const [includeRestDuration, setIncludeRestDuration] = useState(false);
  const [restDuration, setRestDuration] = useState([0]);
  const [isRestDurationEmptyString, setIsRestDurationEmptyString] = useState(
    []
  );
  const [sameRestDurationForEachSet, setSameRestDurationForEachSet] =
    useState(true);

  const [setDurationAssigned, setSetDurationAssigned] = useState([]);
  const [setDurationPerformed, setSetDurationPerformed] = useState([]);
  const [isSetDurationEmptyString, setIsSetDurationEmptyString] = useState([]);
  const [
    isSetDurationPerformedEmptyString,
    setIsSetDurationPerformedEmptyString,
  ] = useState([]);
  const [sameSetDurationForEachSet, setSameSetDurationForEachSet] =
    useState(true);

  useEffect(() => {
    if (previousExercise && !selectedExercise) {
      setNumberOfSets(previousExercise.number_of_sets_assigned);

      if (previousExercise.number_of_reps_assigned) {
        setNumberOfReps(previousExercise.number_of_reps_assigned);
        setSameRepsForEachSet(
          previousExercise.number_of_reps_assigned.length !==
            previousExercise.number_of_sets_assigned
        );
      }

      if (previousExercise.rest_duration) {
        setRestDuration(previousExercise.rest_duration);
        setSameRestDurationForEachSet(
          previousExercise.rest_duration.length !==
            previousExercise.number_of_sets_assigned
        );
      }
      if (previousExercise.set_duration_assigned) {
        setSetDurationAssigned(previousExercise.set_duration_assigned);
        setSameSetDurationForEachSet(
          previousExercise.set_duration_assigned.length !==
            previousExercise.number_of_sets_assigned
        );
      }

      if (previousExercise.weight_assigned) {
        setWeight(
          previousExercise.weight_assigned,
          previousExercise.is_weight_in_kilograms
        );
        setSameWeightForEachSet(
          previousExercise.weight_assigned.length !==
            previousExercise.number_of_sets_assigned
        );
      }
      if (previousExercise.is_weight_in_kilograms !== null) {
        setIsUsingKilograms(previousExercise.is_weight_in_kilograms);
      }
    }
  }, [previousExercise]);

  return (
    <Modal
      {...props}
      title={selectedExercise ? "Edit Exercise" : "Add Exercise"}
      message={
        <>
          {selectedExercise ? "Update" : "Add an"} exercise to{" "}
          <span className="font-semibold">
            {selectedClient ? `${selectedClient.client_email}'s` : "your"}
          </span>{" "}
          workout for{" "}
          <span className="font-semibold">{selectedDate?.toDateString()}</span>
        </>
      }
      Icon={ClipboardCheckIcon}
      Button={
        <button
          type="submit"
          form="exerciseForm"
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
        >
          {selectedExercise
            ? isUpdatingExercise
              ? "Updating Exercise..."
              : didUpdateExercise
              ? "Updated Exercise!"
              : "Update Exercise"
            : isAddingExercise
            ? "Adding Exercise..."
            : didAddExercise
            ? "Added Exercise!"
            : "Add Exercise"}
        </button>
      }
    >
      <form
        id="exerciseForm"
        method="POST"
        className="my-5 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3"
        onSubmit={async (e) => {
          e.preventDefault();
          let status;
          if (selectedExercise) {
            const updateExerciseData = {
              time: includeTimePerformed ? timePerformed : null,

              type: selectedExerciseType.id,

              number_of_sets_assigned: numberOfSets,
              number_of_sets_performed: numberOfSetsPerformed,

              ...(selectedExerciseType.features?.includes("reps")
                ? {
                    number_of_reps_assigned: numberOfReps,
                    number_of_reps_performed: numberOfRepsPerformed,
                  }
                : {}),

              ...(selectedExerciseType.features?.includes("weight")
                ? {
                    is_weight_in_kilograms: isUsingKilograms,
                    weight_assigned: isUsingKilograms
                      ? weightKilograms
                      : weightPounds,
                    weight_performed: isUsingKilograms
                      ? weightPerformedKilograms
                      : weightPerformedPounds,
                  }
                : {}),

              rest_duration: includeRestDuration ? restDuration : null,

              ...(selectedExerciseType.features?.includes("duration")
                ? {
                    set_duration_assigned: setDurationAssigned,
                    set_duration_performed: setDurationPerformed,
                  }
                : {}),

              difficulty,
              video,
            };
            console.log("updateExerciseData", updateExerciseData);
            const { data: updatedExercise, error: updatedExerciseError } =
              await supabase
                .from("exercise")
                .update(updateExerciseData)
                .match({ id: selectedExercise.id });

            console.log("updatedExercise", updatedExercise);
            if (updatedExerciseError) {
              console.error(updatedExerciseError);
              status = {
                type: "failed",
                title: "Failed to Update Exercise",
                message: updatedExerciseError.message,
              };
            } else {
              status = {
                type: "succeeded",
                title: "Successfully Updated Exercise",
              };
            }
            setIsUpdatingExercise(false);
            setDidUpdateExercise(true);
            setEditExerciseStatus(status);
            setShowEditExerciseNotification(true);
          } else {
            setIsAddingExercise(true);
            const createExerciseData = {
              client: amITheClient ? user.id : selectedClient.client,
              client_email: amITheClient
                ? user.email
                : selectedClient.client_email,

              date: selectedDate,
              time: includeTimePerformed ? timePerformed : null,

              type: selectedExerciseType.id,

              number_of_sets_assigned: numberOfSets,
              number_of_reps_assigned: selectedExerciseType.features?.includes(
                "reps"
              )
                ? numberOfReps
                : null,
              ...(selectedExerciseType.features?.includes("reps")
                ? {
                    is_weight_in_kilograms: isUsingKilograms,
                    weight_assigned: isUsingKilograms
                      ? weightKilograms
                      : weightPounds,
                  }
                : {}),

              rest_duration: includeRestDuration ? restDuration : null,

              ...(selectedExerciseType.features?.includes("duration")
                ? {
                    set_duration_assigned: setDurationAssigned,
                  }
                : {}),
            };
            if (!amITheClient) {
              Object.assign(createExerciseData, {
                coach: user.id,
                coach_email: user.email,
              });
            }
            console.log("createExerciseData", createExerciseData);
            const { data: createdExercise, error: createdExerciseError } =
              await supabase.from("exercise").insert([createExerciseData]);

            console.log("createdExercise", createdExercise);
            if (createdExerciseError) {
              console.error(createdExerciseError);
              status = {
                type: "failed",
                title: "Failed to add Exercise",
                message: createdExerciseError.message,
              };
            } else {
              status = {
                type: "succeeded",
                title: "Successfully added Exercise",
              };
            }
            setIsAddingExercise(false);
            setDidAddExercise(true);
            setAddExerciseStatus(status);
            setShowAddExerciseNotification(true);
          }

          setOpen(false);
          if (status.type === "succeeded") {
            console.log(status);
          } else {
            console.error(status);
          }
        }}
      >
        <div className="sm:col-span-3">
          <ExerciseTypesSelect
            selectedExerciseType={selectedExerciseType}
            setSelectedExerciseType={setSelectedExerciseType}
            open={open}
            existingExercises={existingExercises}
            selectedExercise={selectedExercise}
          />

          {selectedExerciseType && (
            <div className="m-auto mt-4 w-fit">
              <ExerciseTypeVideo
                exerciseTypeId={selectedExerciseType.id}
                width={150}
              />
            </div>
          )}
          {previousExercise && (
            <p className="mt-2 text-sm text-gray-500">
              This exercise was done {daysSincePreviousExercise} day
              {daysSincePreviousExercise > 1 && "s"} ago on{" "}
              {previousExercise.date}
              {previousExercise.time
                ? ` at ${timeToDate(previousExercise.time).toLocaleTimeString(
                    [],
                    { timeStyle: "short" }
                  )}`
                : ""}{" "}
              <MyLink
                onClick={() => {
                  setSelectedDate(stringToDate(previousExercise.date));
                  setOpen(false);
                }}
                href={`/account/diary?date=${stringToDate(
                  previousExercise.date
                ).toDateString()}${
                  selectedClient ? `&client=${selectedClient.client_email}` : ""
                }`}
                className="ml-1 inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
              >
                View
              </MyLink>
            </p>
          )}
        </div>

        {previousExercise && (
          <>
            <div className="relative w-full sm:col-span-3">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center">
                <div className="inline-flex items-center rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium leading-5 text-gray-700 shadow-sm">
                  <span className="select-none">Previous Exercise</span>
                </div>
              </div>
            </div>
            {previousExercise.number_of_sets_assigned && (
              <>
                {previousExercise.number_of_sets_performed === null && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Sets</dt>
                    <dd className="mt-1 break-words text-sm text-gray-900">
                      {previousExercise.number_of_sets_assigned}
                    </dd>
                  </div>
                )}
                {previousExercise.number_of_sets_performed !== null && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Sets</dt>
                    <dd className="mt-1 break-words text-sm text-gray-900">
                      {previousExercise.number_of_sets_performed}/
                      {previousExercise.number_of_sets_assigned}
                    </dd>
                  </div>
                )}
              </>
            )}

            {previousExercise.number_of_reps_assigned && (
              <>
                {previousExercise.number_of_reps_performed === null && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Reps</dt>
                    <dd className="mt-1 break-words text-sm text-gray-900">
                      {previousExercise.number_of_reps_assigned
                        .map((reps) => (reps == 0 ? "amrap" : reps))
                        .join(", ")}
                    </dd>
                  </div>
                )}
                {previousExercise.number_of_reps_performed !== null && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Reps</dt>
                    <dd className="mt-1 break-words text-sm text-gray-900">
                      {previousExercise.number_of_reps_performed
                        .map(
                          (numberOfReps, index) =>
                            `${numberOfReps}/${
                              previousExercise.number_of_reps_assigned[index] ||
                              previousExercise.number_of_reps_assigned[0]
                            }`
                        )
                        .join(", ")}
                    </dd>
                  </div>
                )}
              </>
            )}

            {previousExercise.weight_assigned && (
              <>
                {previousExercise.weight_assigned.some(
                  (weight) => weight > 0
                ) &&
                  previousExercise.weight_performed === null && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Weight (
                        {previousExercise.is_weight_in_kilograms ? "kg" : "lbs"}
                        )
                      </dt>
                      <dd className="mt-1 break-words text-sm text-gray-900">
                        {previousExercise.weight_assigned.join(", ")}
                      </dd>
                    </div>
                  )}
                {previousExercise.weight_assigned.some(
                  (weight) => weight > 0
                ) &&
                  previousExercise.weight_performed !== null && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Weight (
                        {previousExercise.is_weight_in_kilograms ? "kg" : "lbs"}
                        )
                      </dt>
                      <dd className="mt-1 break-words text-sm text-gray-900">
                        {previousExercise.weight_performed
                          .map(
                            (weight, index) =>
                              `${weight}/${
                                previousExercise.weight_assigned[index] ||
                                previousExercise.weight_assigned[0]
                              }`
                          )
                          .join(", ")}
                      </dd>
                    </div>
                  )}
              </>
            )}

            {previousExercise.difficulty !== null && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Difficulty
                </dt>
                <dd className="mt-1 break-words text-sm text-gray-900">
                  {previousExercise.difficulty
                    .map((value) => `${value}/10`)
                    .join(", ")}
                </dd>
              </div>
            )}
            {previousExercise.rest_duration !== null && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Rest Duration (min)
                </dt>
                <dd className="mt-1 break-words text-sm text-gray-900">
                  {previousExercise.rest_duration.join(", ")}
                </dd>
              </div>
            )}
            {previousExercise.set_duration_assigned !== null && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Set Duration (min)
                </dt>
                <dd className="mt-1 break-words text-sm text-gray-900">
                  {previousExercise.set_duration_assigned.join(", ")}
                </dd>
              </div>
            )}
            {previousVideo?.map(
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
                            const newVideoPlayer = previousVideoPlayer;
                            newVideoPlayer[index] = e.target;
                            setPreviousVideoPlayer(newVideoPlayer);
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
          </>
        )}

        {selectedExerciseType && (
          <>
            <div className="relative w-full sm:col-span-3">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center">
                <div className="inline-flex items-center rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium leading-5 text-gray-700 shadow-sm">
                  <span className="select-none">Assignment</span>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="sets"
                className="block select-none text-sm font-medium text-gray-700"
              >
                Sets
              </label>
              <div className="mt-1">
                <input
                  required
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="10"
                  placeholder={0}
                  value={isNumberOfSetsEmptyString ? "" : numberOfSets}
                  onInput={(e) => {
                    setIsNumberOfSetsEmptyString(e.target.value === "");

                    const newNumberOfSets = Number(e.target.value);
                    if (sameRepsForEachSet) {
                      setNumberOfReps([numberOfReps[0]]);
                    } else {
                      setNumberOfReps(
                        new Array(newNumberOfSets).fill(numberOfReps[0])
                      );
                      setIsNumberOfRepsEmptyString(
                        new Array(newNumberOfSets).fill(
                          isNumberOfRepsEmptyString[0]
                        )
                      );
                    }

                    if (sameWeightForEachSet) {
                      setIsWeightInputEmptyString([
                        isWeightInputEmptyString[0],
                      ]);
                      setWeight(
                        isUsingKilograms
                          ? [weightKilograms[0]]
                          : [weightPounds[0]]
                      );
                    } else {
                      setWeight(
                        isUsingKilograms
                          ? new Array(newNumberOfSets).fill(weightKilograms[0])
                          : new Array(newNumberOfSets).fill(weightPounds[0])
                      );
                      setIsWeightInputEmptyString(
                        new Array(newNumberOfSets).fill(
                          isWeightInputEmptyString[0]
                        )
                      );
                    }

                    if (sameRestDurationForEachSet) {
                      setRestDuration([restDuration[0]]);
                    } else {
                      setRestDuration(
                        new Array(newNumberOfSets).fill(restDuration[0])
                      );
                      setIsRestDurationEmptyString(
                        new Array(newNumberOfSets).fill(
                          isRestDurationEmptyString[0]
                        )
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
            {numberOfSets > 1 && (
              <>
                {selectedExerciseType.features?.includes("reps") && (
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
                        className="select-none font-medium text-gray-700"
                      >
                        Same Reps for Each Set
                      </label>
                    </div>
                  </div>
                )}
                {selectedExerciseType.features?.includes("duration") && (
                  <div className="relative flex self-center">
                    <div className="flex h-5 items-center">
                      <input
                        id="sameSetDurationForEachSet"
                        name="sameSetDurationForEachSet"
                        type="checkbox"
                        checked={sameSetDurationForEachSet}
                        onChange={(e) => {
                          const newSameSetDurationForEachSet = e.target.checked;
                          if (newSameSetDurationForEachSet) {
                            setSetDurationAssigned([setDurationAssigned[0]]);
                          } else {
                            setSetDurationAssigned(
                              new Array(numberOfSets).fill(
                                setDurationAssigned[0]
                              )
                            );
                          }
                          setSameSetDurationForEachSet(
                            newSameSetDurationForEachSet
                          );
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="sameSetDurationForEachSet"
                        className="select-none font-medium text-gray-700"
                      >
                        Same Set Duration for Each Set
                      </label>
                    </div>
                  </div>
                )}
                {selectedExerciseType.features?.includes("weight") && (
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
                            setWeight(
                              isUsingKilograms
                                ? [weightKilograms[0]]
                                : [weightPounds[0]]
                            );
                            setIsWeightInputEmptyString([
                              isWeightInputEmptyString[0],
                            ]);
                          } else {
                            setWeight(
                              isUsingKilograms
                                ? new Array(numberOfSets).fill(
                                    weightKilograms[0]
                                  )
                                : new Array(numberOfSets).fill(weightPounds[0])
                            );
                            setIsWeightInputEmptyString(
                              new Array(numberOfSets).fill(
                                isWeightInputEmptyString[0]
                              )
                            );
                          }
                          setSameWeightForEachSet(newSameWeightForEachSet);
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="sameWeightForEachSet"
                        className="select-none font-medium text-gray-700"
                      >
                        Same Weight for Each Set
                      </label>
                    </div>
                  </div>
                )}

                <div className="relative flex self-center">
                  <div className="flex h-5 items-center">
                    <input
                      id="includeRestDuration"
                      name="includeRestDuration"
                      type="checkbox"
                      checked={includeRestDuration}
                      onChange={(e) => {
                        setIncludeRestDuration(e.target.checked);
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="includeRestDuration"
                      className="select-none font-medium text-gray-700"
                    >
                      Include Rest Duration
                    </label>
                  </div>
                </div>
                {includeRestDuration && (
                  <div className="relative flex self-center">
                    <div className="flex h-5 items-center">
                      <input
                        id="sameRestDurationForEachSet"
                        name="sameRestDurationForEachSet"
                        type="checkbox"
                        checked={sameRestDurationForEachSet}
                        onChange={(e) => {
                          const newSameRestDurationForEachSet =
                            e.target.checked;
                          if (newSameRestDurationForEachSet) {
                            setRestDuration([restDuration[0]]);
                          } else {
                            setRestDuration(
                              new Array(numberOfSets).fill(restDuration[0])
                            );
                          }
                          setSameRestDurationForEachSet(
                            newSameRestDurationForEachSet
                          );
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="sameRestDurationForEachSet"
                        className="select-none font-medium text-gray-700"
                      >
                        Same Rest Duration for Each Set
                      </label>
                    </div>
                  </div>
                )}
              </>
            )}

            {selectedExerciseType.features?.includes("reps") && (
              <>
                {sameRepsForEachSet && (
                  <div className="col-start-1">
                    <label
                      htmlFor="reps"
                      className="block select-none text-sm font-medium text-gray-700"
                    >
                      Reps
                    </label>
                    <div className="mt-1">
                      <input
                        required
                        type="number"
                        inputMode="numeric"
                        min="0"
                        max="20"
                        value={
                          isNumberOfRepsEmptyString[0] ? "" : numberOfReps[0]
                        }
                        placeholder={0}
                        onInput={(e) => {
                          setIsNumberOfRepsEmptyString([e.target.value === ""]);
                          setNumberOfReps([Number(e.target.value)]);
                        }}
                        name="reps"
                        id="reps"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">(0 for AMRAP)</p>
                  </div>
                )}
                {!sameRepsForEachSet &&
                  new Array(numberOfSets).fill(1).map((_, index) => (
                    <div
                      className={index === 0 ? "col-start-1" : ""}
                      key={index}
                    >
                      <label
                        htmlFor={`reps-${index}`}
                        className="block select-none text-sm font-medium text-gray-700"
                      >
                        Reps #{index + 1}
                      </label>
                      <div className="mt-1">
                        <input
                          required
                          type="number"
                          inputMode="numeric"
                          min="0"
                          max="20"
                          value={
                            isNumberOfRepsEmptyString[index]
                              ? ""
                              : numberOfReps[index]
                          }
                          placeholder={0}
                          onInput={(e) => {
                            const newIsNumberOfRepsEmptyString =
                              isNumberOfRepsEmptyString.slice();
                            newIsNumberOfRepsEmptyString[index] =
                              e.target.value === "";
                            setIsNumberOfRepsEmptyString(
                              newIsNumberOfRepsEmptyString
                            );

                            const newNumberOfReps = numberOfReps.slice();
                            newNumberOfReps[index] = Number(e.target.value);
                            setNumberOfReps(newNumberOfReps);
                          }}
                          name={`reps-${index}`}
                          id={`reps-${index}`}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        (0 for AMRAP)
                      </p>
                    </div>
                  ))}
              </>
            )}

            {selectedExerciseType.features?.includes("duration") && (
              <>
                {sameSetDurationForEachSet && (
                  <div className="col-start-1">
                    <label
                      htmlFor="setDuration"
                      className="block select-none text-sm font-medium text-gray-700"
                    >
                      Set Duration
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <input
                        required
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={
                          isSetDurationEmptyString[0]
                            ? ""
                            : setDurationAssigned[0]
                        }
                        placeholder={0}
                        onInput={(e) => {
                          setIsSetDurationEmptyString([e.target.value === ""]);
                          setSetDurationAssigned([Number(e.target.value)]);
                        }}
                        name="setDuration"
                        id="setDuration"
                        className="hide-arrows block w-full rounded-md border-gray-300 pr-12 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 sm:text-sm">min</span>
                      </div>
                    </div>
                  </div>
                )}
                {!sameSetDurationForEachSet &&
                  new Array(numberOfSets).fill(1).map((_, index) => (
                    <div
                      className={index === 0 ? "col-start-1" : ""}
                      key={index}
                    >
                      <label
                        htmlFor={`set-duration-${index}`}
                        className="block select-none text-sm font-medium text-gray-700"
                      >
                        Set Duration #{index + 1}
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <input
                          required
                          type="number"
                          inputMode="numeric"
                          min="0"
                          value={
                            isSetDurationEmptyString[index]
                              ? ""
                              : setDurationAssigned[index]
                          }
                          placeholder={0}
                          onInput={(e) => {
                            const newIsSetDurationEmptyString =
                              isSetDurationEmptyString.slice();
                            newIsSetDurationEmptyString[index] =
                              e.target.value === "";
                            setIsSetDurationEmptyString(
                              newIsSetDurationEmptyString
                            );

                            const newSetDuration = setDurationAssigned.slice();
                            newSetDuration[index] = Number(e.target.value);
                            setSetDurationAssigned(newSetDuration);
                          }}
                          name={`set-duration-${index}`}
                          id={`set-duration-${index}`}
                          className="hide-arrows block w-full rounded-md border-gray-300 pr-12 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 sm:text-sm">min</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </>
            )}

            {selectedExerciseType.features?.includes("weight") && (
              <>
                {sameWeightForEachSet && (
                  <div className="col-start-1">
                    <label
                      htmlFor="weight"
                      className="block select-none text-sm font-medium text-gray-700"
                    >
                      Weight
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <input
                        required
                        type="number"
                        inputMode="decimal"
                        min="0"
                        name="weight"
                        id="weight"
                        className="hide-arrows block w-full rounded-md border-gray-300 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                          setWeight([weight]);
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
                          onChange={(e) =>
                            setIsUsingKilograms(e.target.value === "kg")
                          }
                          value={isUsingKilograms ? "kg" : "lbs"}
                        >
                          <option>kg</option>
                          <option>lbs</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                {!sameWeightForEachSet &&
                  new Array(numberOfSets).fill(1).map((_, index) => (
                    <div
                      key={index}
                      className={index === 0 ? "col-start-1" : ""}
                    >
                      <label
                        htmlFor={`weight-${index}`}
                        className="block select-none text-sm font-medium text-gray-700"
                      >
                        Weight #{index + 1}
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <input
                          required
                          type="number"
                          inputMode="decimal"
                          min="0"
                          name={`weight-${index}`}
                          id={`weight-${index}`}
                          className="hide-arrows block w-full rounded-md border-gray-300 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                            setIsWeightInputEmptyString(
                              newIsWeightInputEmptyString
                            );

                            const weight = Number(e.target.value);
                            if (isUsingKilograms) {
                              const newWeightKilograms =
                                weightKilograms.slice();
                              newWeightKilograms[index] = weight;
                              setWeight(newWeightKilograms);
                            } else {
                              const newWeightPounds = weightPounds.slice();
                              newWeightPounds[index] = weight;
                              setWeight(newWeightPounds);
                            }
                          }}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center">
                          <label
                            htmlFor={`weight-type-${index}`}
                            className="sr-only"
                          >
                            weight type
                          </label>
                          <select
                            id={`weight-type-${index}`}
                            name={`weight-type-${index}`}
                            className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            onChange={(e) =>
                              setIsUsingKilograms(e.target.value === "kg")
                            }
                            value={isUsingKilograms ? "kg" : "lbs"}
                          >
                            <option>kg</option>
                            <option>lbs</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
              </>
            )}

            {includeRestDuration && (
              <>
                {sameRestDurationForEachSet && (
                  <div className="col-start-1">
                    <label
                      htmlFor="restDuration"
                      className="block select-none text-sm font-medium text-gray-700"
                    >
                      Rest Duration
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <input
                        required
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={
                          isRestDurationEmptyString[0] ? "" : restDuration[0]
                        }
                        placeholder={0}
                        onInput={(e) => {
                          setIsRestDurationEmptyString([e.target.value === ""]);
                          setRestDuration([Number(e.target.value)]);
                        }}
                        name="restDuration"
                        id="restDuration"
                        className="hide-arrows block w-full rounded-md border-gray-300 pr-12 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 sm:text-sm">min</span>
                      </div>
                    </div>
                  </div>
                )}
                {!sameRestDurationForEachSet &&
                  new Array(numberOfSets).fill(1).map((_, index) => (
                    <div
                      className={index === 0 ? "col-start-1" : ""}
                      key={index}
                    >
                      <label
                        htmlFor={`rest-duration-${index}`}
                        className="block select-none text-sm font-medium text-gray-700"
                      >
                        Rest Duration #{index + 1}
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <input
                          required
                          type="number"
                          inputMode="numeric"
                          min="0"
                          value={
                            isRestDurationEmptyString[index]
                              ? ""
                              : restDuration[index]
                          }
                          placeholder={0}
                          onInput={(e) => {
                            const newIsRestDurationEmptyString =
                              isRestDurationEmptyString.slice();
                            newIsRestDurationEmptyString[index] =
                              e.target.value === "";
                            setIsRestDurationEmptyString(
                              newIsRestDurationEmptyString
                            );

                            const newRestDuration = restDuration.slice();
                            newRestDuration[index] = Number(e.target.value);
                            setRestDuration(newRestDuration);
                          }}
                          name={`rest-duration-${index}`}
                          id={`rest-duration-${index}`}
                          className="hide-arrows block w-full rounded-md border-gray-300 pr-12 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 sm:text-sm">min</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </>
            )}
          </>
        )}
        {selectedExercise && (
          <>
            <div className="relative w-full sm:col-span-3">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center">
                <div className="inline-flex items-center rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium leading-5 text-gray-700 shadow-sm">
                  <span className="select-none">Performance</span>
                </div>
              </div>
            </div>

            <div className="col-start-1">
              <label
                htmlFor="setsPerformed"
                className="block select-none text-sm font-medium text-gray-700"
              >
                Sets
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  required
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="20"
                  value={
                    isSetsPerformedEmptyString ? "" : numberOfSetsPerformed
                  }
                  onInput={(e) => {
                    setIsSetsPerformedEmptyString(e.target.value === "");
                    setNumberOfSetsPerformed(Number(e.target.value));
                  }}
                  placeholder="0"
                  name="setsPerformed"
                  id="setsPerformed"
                  className="hide-arrows block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 sm:text-sm">
                    /{numberOfSets}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative flex self-center">
              <div className="flex h-5 items-center">
                <input
                  id="includeTimePerformed"
                  name="includeTimePerformed"
                  type="checkbox"
                  checked={includeTimePerformed}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTimePerformed(new Date().toTimeString().split(" ")[0]);
                    }
                    setIncludeTimePerformed(e.target.checked);
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor="includeTimePerformed"
                  className="select-none font-medium text-gray-700"
                >
                  Include Time
                </label>
              </div>
            </div>

            {includeTimePerformed && (
              <div>
                <label
                  htmlFor="timePerformed"
                  className="block select-none text-sm font-medium text-gray-700"
                >
                  Time
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    required={includeTimePerformed}
                    type="time"
                    step="60"
                    value={
                      timePerformed?.split(":").slice(0, 2).join(":") || ""
                    }
                    onInput={(e) => {
                      setTimePerformed(e.target.value);
                    }}
                    name="timePerformed"
                    id="timePerformed"
                    className="hide-arrows block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
            {new Array(numberOfSetsPerformed).fill(1).map((_, index) => (
              <React.Fragment key={index}>
                <div className="relative w-full sm:col-span-3">
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-sm text-gray-500">
                      Set #{index + 1}
                    </span>
                  </div>
                </div>

                {selectedExerciseType?.features?.includes("reps") && (
                  <div>
                    <label
                      htmlFor={`reps-performed-${index}`}
                      className="block select-none text-sm font-medium text-gray-700"
                    >
                      Reps
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <input
                        required
                        type="number"
                        inputMode="numeric"
                        min="0"
                        max="20"
                        value={
                          isRepsPerformedEmptyString[index]
                            ? ""
                            : numberOfRepsPerformed[index]
                        }
                        onInput={(e) => {
                          const newIsRepsPerformedEmptyString =
                            isRepsPerformedEmptyString.slice();
                          newIsRepsPerformedEmptyString[index] =
                            e.target.value === "";
                          setIsRepsPerformedEmptyString(
                            newIsRepsPerformedEmptyString
                          );

                          const newNumberOfRepsPerformed =
                            numberOfRepsPerformed.slice();
                          newNumberOfRepsPerformed[index] = Number(
                            e.target.value
                          );
                          setNumberOfRepsPerformed(newNumberOfRepsPerformed);
                        }}
                        placeholder="0"
                        name={`reps-performed-${index}`}
                        id={`reps-performed-${index}`}
                        className="hide-arrows block w-full rounded-md border-gray-300 pr-12 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span
                          className="text-gray-500 sm:text-sm"
                          id={`reps-performed-denominator-${index}`}
                        >
                          /
                          {numberOfReps.length === 1
                            ? numberOfReps[0]
                            : numberOfReps[index]}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedExerciseType?.features?.includes("duration") && (
                  <div>
                    <label
                      htmlFor={`set-duration-performed-${index}`}
                      className="block select-none text-sm font-medium text-gray-700"
                    >
                      Set Duration
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <input
                        required
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={
                          isSetDurationPerformedEmptyString[index]
                            ? ""
                            : setDurationPerformed[index]
                        }
                        onInput={(e) => {
                          const newIsSetDurationPerformedEmptyString =
                            isSetDurationPerformedEmptyString.slice();
                          newIsSetDurationPerformedEmptyString[index] =
                            e.target.value === "";
                          setIsSetDurationPerformedEmptyString(
                            newIsSetDurationPerformedEmptyString
                          );

                          const newSetDurationPerformed =
                            setDurationPerformed.slice();
                          newSetDurationPerformed[index] = Number(
                            e.target.value
                          );
                          setSetDurationPerformed(newSetDurationPerformed);
                        }}
                        placeholder="0"
                        name={`set-duration-performed-${index}`}
                        id={`set-duration-performed-${index}`}
                        className="hide-arrows block w-full rounded-md border-gray-300 pr-12 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 sm:text-sm">
                          /
                          {setDurationAssigned.length === 1
                            ? setDurationAssigned[0]
                            : setDurationAssigned[index]}{" "}
                          min
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor={`set-difficulty-${index}`}
                    className="block select-none text-sm font-medium text-gray-700"
                  >
                    Difficulty
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <input
                      required
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="10"
                      value={
                        isDifficultyEmptyString[index] ? "" : difficulty[index]
                      }
                      placeholder={0}
                      onInput={(e) => {
                        const newIsDifficultyEmptyString =
                          isDifficultyEmptyString.slice();
                        newIsDifficultyEmptyString[index] =
                          e.target.value === "";
                        setIsDifficultyEmptyString(newIsDifficultyEmptyString);

                        const newDifficulty = difficulty.slice();
                        newDifficulty[index] = Number(e.target.value);
                        setDifficulty(newDifficulty);
                      }}
                      name={`set-difficulty-${index}`}
                      id={`set-difficulty-${index}`}
                      className="hide-arrows block w-full rounded-md border-gray-300 pr-12 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span
                        className="text-gray-500 sm:text-sm"
                        id={`reps-performed-denominator-${index}`}
                      >
                        /10
                      </span>
                    </div>
                  </div>
                </div>
                {selectedExerciseType?.features?.includes("weight") && (
                  <div>
                    <label
                      htmlFor={`weight-performed-${index}`}
                      className="block select-none text-sm font-medium text-gray-700"
                    >
                      Weight
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <input
                        required
                        type="number"
                        inputMode="decimal"
                        min="0"
                        name={`weight-performed-${index}`}
                        id={`weight-performed-${index}`}
                        className="hide-arrows block w-full rounded-md border-gray-300 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={
                          isWeightPerformedEmptyString[index]
                            ? ""
                            : isUsingKilograms
                            ? weightPerformedKilograms[index]
                            : weightPerformedPounds[index]
                        }
                        placeholder={0}
                        onInput={(e) => {
                          const newIsWeightPerformedEmptyString =
                            isWeightPerformedEmptyString.slice();
                          newIsWeightPerformedEmptyString[index] =
                            e.target.value === "";
                          setIsWeightPerformedEmptyString(
                            newIsWeightPerformedEmptyString
                          );

                          const weight = Number(e.target.value);
                          if (isUsingKilograms) {
                            const newWeightKilograms =
                              weightPerformedKilograms.slice();
                            newWeightKilograms[index] = weight;
                            setWeightPerformed(newWeightKilograms);
                          } else {
                            const newWeightPounds =
                              weightPerformedPounds.slice();
                            newWeightPounds[index] = weight;
                            setWeightPerformed(newWeightPounds);
                          }
                        }}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center">
                        <label
                          htmlFor={`weight-type-performed-${index}`}
                          className="sr-only"
                        >
                          weight type
                        </label>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="w-max text-gray-500 sm:text-sm">
                            /
                            {isUsingKilograms
                              ? weightKilograms[
                                  sameWeightForEachSet ? 0 : index
                                ]
                              : weightPounds[
                                  sameWeightForEachSet ? 0 : index
                                ]}{" "}
                            {isUsingKilograms ? "kg" : "lbs"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!video[index] && (
                  <div className="sm:col-span-3">
                    {" "}
                    <label
                      htmlFor={`video-${index}`}
                      className="block select-none text-sm font-medium text-gray-700"
                    >
                      YouTube Video
                    </label>
                    <div className="relative mt-1 flex flex-grow items-stretch focus-within:z-10">
                      <input
                        autoComplete="off"
                        type="text"
                        placeholder="https://youtu.be/R--Nz8rkGe8?t=15179"
                        name={`video-${index}`}
                        id={`video-${index}`}
                        className="block w-full rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const inputValue = e.target
                            .closest("div")
                            .querySelector("input").value;
                          let videoId;
                          let timecode;
                          try {
                            const url = new URL(inputValue);
                            console.log("url", url);
                            if (url.host.endsWith("youtube.com")) {
                              if (url.pathname === "/watch") {
                                videoId = url.searchParams.get("v");
                                timecode = url.searchParams.get("t") || 0;
                              } else if (url.pathname.startsWith("/shorts")) {
                                videoId = url.pathname.split("/")[2];
                                timecode = 0;
                              }
                            } else if (url.host === "youtu.be") {
                              videoId = url.pathname.slice(1);
                              timecode = url.searchParams.get("t") || 0;
                            }
                          } catch (error) {
                            console.log("invalid url", inputValue, error);
                          }

                          console.log("videoId", videoId);
                          console.log("timecode", timecode);
                          console.log("video", video);

                          const newVideo = video.slice();
                          newVideo[index] = { videoId, start: timecode };
                          setVideo(newVideo);
                        }}
                        className="relative -ml-px inline-flex select-none items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <RefreshIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                )}
                {video[index] && (
                  <React.Fragment>
                    <div className="sm:col-span-3">
                      <YouTube
                        videoId={video[index].videoId}
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
                            start: video[index].start || 0,
                            end: video[index].end,
                          },
                        }}
                        onReady={(e) => {
                          e.target.mute();
                          console.log("player", e.target);
                          const newVideoPlayer = videoPlayer.slice();
                          newVideoPlayer[index] = e.target;
                          setVideoPlayer(newVideoPlayer);
                        }}
                        onEnd={(e) => {
                          e.target.seekTo(video[index].start || 0);
                          e.target.playVideo();
                        }}
                      ></YouTube>
                    </div>
                    <div className="flex justify-around gap-2 sm:col-span-3">
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            if (video[index] && videoPlayer[index]) {
                              const start = Math.floor(
                                videoPlayer[index].getCurrentTime()
                              );
                              const newVideo = video.slice();
                              newVideo[index].start = start;
                              setVideo(newVideo);
                            }
                          }}
                          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          Set Start
                        </button>
                      </div>
                      <div className="sm:col-span-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (video[index] && videoPlayer[index]) {
                              const end = Math.floor(
                                videoPlayer[index].getCurrentTime()
                              );
                              const newVideo = video.slice();
                              newVideo[index].end = end;
                              setVideo(newVideo);
                            }
                          }}
                          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          Set End
                        </button>
                      </div>
                      <div className="sm:col-span-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (video[index] && videoPlayer[index]) {
                              const newVideo = video.slice();
                              delete newVideo[index].end;
                              setVideo(newVideo);
                            }
                          }}
                          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          Clear End
                        </button>
                      </div>
                      <div>
                        <button
                          onClick={() => {
                            const newVideo = video.slice();
                            delete newVideo[index];
                            setVideo(newVideo);
                          }}
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-1.5 px-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          Remove Video
                        </button>
                      </div>
                    </div>
                  </React.Fragment>
                )}
              </React.Fragment>
            ))}
          </>
        )}
      </form>
    </Modal>
  );
}
