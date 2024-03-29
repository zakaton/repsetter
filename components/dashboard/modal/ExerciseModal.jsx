/* eslint-disable react/destructuring-assignment */
import React, { useEffect, useState } from "react";
import Modal from "../../Modal";
import { ClipboardCheckIcon, UploadIcon } from "@heroicons/react/outline";
import {
  supabase,
  timeToDate,
  stringToDate,
  dateToString,
} from "../../../utils/supabase";
import {
  poundsToKilograms,
  kilogramsToPounds,
  distanceUnits,
} from "../../../utils/exercise-utils";
import {
  useClient,
  firstDayOfBlockTemplate,
} from "../../../context/client-context";
import ExerciseTypesSelect from "./ExerciseTypesSelect";
import { useUser } from "../../../context/user-context";
import YouTube from "react-youtube";
import GoogleDriveVideo from "../../GoogleDriveVideo";
import MyLink from "../../MyLink";
import ExerciseTypeVideo from "../../ExerciseTypeVideo";

const initialNumberOfSets = 3;

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

    setResultStatus: setExerciseStatus,
    setShowResultNotification: setShowExerciseNotification,
  } = props;

  const {
    selectedClient,
    selectedDate,
    amITheClient,
    setSelectedDate,
    selectedClientId,
    selectedBlock,
    selectedBlockDate,
    setSelectedBlockDate,
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
      setShowExerciseNotification(false);
    }
  }, [open]);

  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [didAddExercise, setDidAddExercise] = useState(false);

  const [isUpdatingExercise, setIsUpdatingExercise] = useState(false);
  const [didUpdateExercise, setDidUpdateExercise] = useState(false);

  const [selectedExerciseType, setSelectedExerciseType] = useState(null);
  const [style, setStyle] = useState(null);
  const [numberOfSets, setNumberOfSets] = useState(initialNumberOfSets);
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
  const [numberOfRepsPerformed, setNumberOfRepsPerformed] = useState([0]);
  const [
    isNumberOfRepsPerformedEmptyString,
    setIsNumberOfRepsPerformedEmptyString,
  ] = useState([]);

  useEffect(() => {
    if (open && selectedExerciseType) {
      if (selectedExerciseType.styles?.length > 0 && style == null) {
        setStyle(selectedExerciseType.styles[0]);
      }
    }
  }, [open, selectedExerciseType]);

  /*
  console.log({
    numberOfSets,
    isNumberOfSetsEmptyString,
    numberOfReps,
    numberOfRepsPerformed,
    isNumberOfRepsEmptyString,
    isNumberOfRepsPerformedEmptyString,
  });
  */

  useEffect(() => {
    if (sameRepsForEachSet) {
      setNumberOfReps([numberOfReps[0]]);
      setIsNumberOfRepsEmptyString([isNumberOfRepsEmptyString[0]]);
    } else {
      let newNumberOfReps;
      if (numberOfReps.length > numberOfSets) {
        newNumberOfReps = numberOfReps.slice(0, numberOfSets);
      } else {
        newNumberOfReps = numberOfReps.slice();
        while (newNumberOfReps.length < numberOfSets) {
          newNumberOfReps.push(newNumberOfReps[newNumberOfReps.length - 1]);
        }
      }
      setNumberOfReps(newNumberOfReps);
      setIsNumberOfRepsEmptyString(
        new Array(numberOfSets).fill(isNumberOfRepsEmptyString[0])
      );
    }

    if (numberOfRepsPerformed) {
      if (numberOfRepsPerformed.length !== numberOfSets) {
        if (numberOfRepsPerformed.length > numberOfSets) {
          setNumberOfRepsPerformed(
            numberOfRepsPerformed.slice(0, numberOfSets)
          );
          setIsNumberOfRepsPerformedEmptyString(
            isNumberOfRepsPerformedEmptyString.slice(0, numberOfSets)
          );
        } else {
          const newNumberOfRepsPerformed = numberOfRepsPerformed.concat(
            new Array(numberOfSets - numberOfRepsPerformed.length).fill(0)
          );
          setNumberOfRepsPerformed(
            newNumberOfRepsPerformed.slice(0, numberOfSets)
          );
          const newIsNumberOfRepsPerformedEmptyString =
            isNumberOfRepsPerformedEmptyString.concat(
              new Array(numberOfSets - numberOfRepsPerformed.length).fill(true)
            );
          setIsNumberOfRepsPerformedEmptyString(
            newIsNumberOfRepsPerformedEmptyString.slice(0, numberOfSets)
          );
        }
      }
    }
  }, [numberOfSets]);

  const [sameWeightForEachSet, setSameWeightForEachSet] = useState(true);
  const [isUsingKilograms, setIsUsingKilograms] = useState(true);
  const [weightKilograms, setWeightKilograms] = useState([0]);
  const [weightPounds, setWeightPounds] = useState([0]);
  const [weightPerformedKilograms, setWeightPerformedKilograms] = useState([0]);
  const [weightPerformedPounds, setWeightPerformedPounds] = useState([0]);
  const [isWeightInputEmptyString, setIsWeightInputEmptyString] = useState([]);
  const [isWeightPerformedEmptyString, setIsWeightPerformedEmptyString] =
    useState([]);

  /*
  console.log({
    numberOfSets,
    sameWeightForEachSet,
    weightKilograms,
    weightPounds,
    isUsingKilograms,
    weightPerformedKilograms,
    weightPerformedPounds,
    isWeightInputEmptyString,
    isWeightPerformedEmptyString,
    numberOfReps,
    isNumberOfRepsEmptyString,
  });
  */

  useEffect(() => {
    if (sameWeightForEachSet) {
      setIsWeightInputEmptyString([isWeightInputEmptyString[0]]);
      setWeight(isUsingKilograms ? [weightKilograms[0]] : [weightPounds[0]]);
    } else {
      let currentWeight = isUsingKilograms ? weightKilograms : weightPounds;
      let newWeight;
      if (currentWeight.length > numberOfSets) {
        newWeight = currentWeight.slice(0, numberOfSets);
      } else {
        newWeight = currentWeight.slice();
        while (newWeight.length < numberOfSets) {
          newWeight.push(newWeight[newWeight.length - 1]);
        }
      }
      setWeight(newWeight);
      setIsWeightInputEmptyString(
        new Array(numberOfSets).fill(isWeightInputEmptyString[0])
      );
    }
  }, [numberOfSets]);

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

  const [isDifficultyEmptyString, setIsDifficultyEmptyString] = useState([]);
  const [difficulty, setDifficulty] = useState([]);

  const [video, setVideo] = useState([]);
  const [videoPlayer, setVideoPlayer] = useState([]);

  const resetUI = () => {
    setIsAddingExercise(false);
    setDidAddExercise(false);
    setSelectedExerciseType(null);

    setStyle(null);

    setNumberOfSets(3);
    setIsNumberOfSetsEmptyString(false);

    setNumberOfReps([10]);
    setSameRepsForEachSet(true);
    setIsNumberOfRepsEmptyString([]);

    setWeight([0]);
    setSameWeightForEachSet(true);
    setIsWeightInputEmptyString([]);

    setWeightPerformed([0]);
    setIsWeightPerformedEmptyString([]);

    setIncludeRestDuration(false);
    setSameRestDurationForEachSet(true);
    setRestDuration([0]);
    setIsRestDurationEmptyString([]);

    setSameSetDurationForEachSet(true);
    setSetDurationAssigned([0]);
    setIsSetDurationEmptyString([]);
    setIsSetDurationPerformedEmptyString([]);

    setSameSpeedForEachSet(true);
    setSpeedAssigned([0]);
    setIsSpeedEmptyString([]);
    setIsSpeedPerformedEmptyString([]);

    setSameLevelForEachSet(true);
    setLevelAssigned([0]);
    setIsLevelEmptyString([]);
    setIsLevelPerformedEmptyString([]);

    setIsUpdatingExercise(false);
    setDidUpdateExercise(false);
    setSelectedExercise?.(null);

    setIncludeTimePerformed(false);
    setTimePerformed();

    setNotes("");
    setFeedback("");
  };

  useEffect(() => {
    if (open && selectedExercise) {
      setNumberOfSets(selectedExercise.number_of_sets_assigned);
      if (selectedExercise.number_of_reps_assigned) {
        setNumberOfReps(selectedExercise.number_of_reps_assigned);
      }

      if (selectedExercise.style) {
        setStyle(selectedExercise.style);
      }

      if (selectedExercise.is_weight_in_kilograms !== null) {
        setIsUsingKilograms(selectedExercise.is_weight_in_kilograms);
      }
      if (selectedExercise.weight_assigned) {
        setWeight(
          selectedExercise.weight_assigned,
          selectedExercise.is_weight_in_kilograms
        );
        const sameWeightForEachSet =
          selectedExercise.weight_assigned?.length == 1;
        setSameWeightForEachSet(sameWeightForEachSet);
      }

      if (selectedExercise.distance_unit !== null) {
        setDistanceUnit(selectedExercise.distance_unit);
      }
      if (selectedExercise.distance_assigned) {
        setDistanceAssigned(selectedExercise.distance_assigned);
        const sameDistanceForEachSet =
          selectedExercise.distance_assigned?.length == 1;
        setSameDistanceForEachSet(sameDistanceForEachSet);
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
        setIsNumberOfRepsPerformedEmptyString([]);
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

      if (selectedExercise.distance_assigned) {
        let distancePerformed =
          selectedExercise.distance_performed !== null
            ? selectedExercise.distance_performed
            : selectedExercise.distance_assigned;
        if (
          distancePerformed.length != selectedExercise.number_of_sets_assigned
        ) {
          distancePerformed = new Array(
            selectedExercise.number_of_sets_assigned
          ).fill(distancePerformed[0]);
        }
        setDistancePerformed(distancePerformed);
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

      if (selectedExercise.level_assigned) {
        const sameLevelForEachSet = selectedExercise.level_assigned.length == 1;
        setSameLevelForEachSet(sameLevelForEachSet);

        setLevelAssigned(selectedExercise.level_assigned);

        let levelPerformed =
          selectedExercise.level_performed !== null
            ? selectedExercise.level_performed
            : selectedExercise.level_assigned;
        if (levelPerformed.length != selectedExercise.number_of_sets_assigned) {
          levelPerformed = new Array(
            selectedExercise.number_of_sets_assigned
          ).fill(0);
        }
        setLevelPerformed(levelPerformed);
      }

      if (selectedExercise.speed_assigned) {
        const sameSpeedForEachSet = selectedExercise.speed_assigned.length == 1;
        setSameSpeedForEachSet(sameSpeedForEachSet);

        setSpeedAssigned(selectedExercise.speed_assigned);

        let speedPerformed =
          selectedExercise.speed_performed !== null
            ? selectedExercise.speed_performed
            : selectedExercise.speed_assigned;
        if (speedPerformed.length != selectedExercise.number_of_sets_assigned) {
          speedPerformed = new Array(
            selectedExercise.number_of_sets_assigned
          ).fill(0);
        }
        setSpeedPerformed(speedPerformed);
      }

      if (selectedExercise.notes) {
        setNotes(selectedExercise.notes);
      }
      if (selectedExercise.feedback) {
        setFeedback(selectedExercise.feedback);
      }
    }
  }, [open, selectedExercise]);

  useEffect(() => {
    if (difficulty.length !== numberOfSets) {
      if (difficulty.length > numberOfSets) {
        setDifficulty(difficulty.slice(0, numberOfSets));
      } else {
        const newDifficulty = difficulty.concat(
          new Array(numberOfSets - difficulty.length).fill(0)
        );
        setDifficulty(newDifficulty.slice(0, numberOfSets));
      }
    }
  }, [numberOfSets]);

  const [previousExercise, setPreviousExercise] = useState();
  const [isGettingPreviousExercise, setIsGettingPreviousExercise] =
    useState(false);
  const getPreviousExercise = async () => {
    if (!isGettingPreviousExercise) {
      setIsGettingPreviousExercise(true);
      console.log("getting previous exercise...");
      const matchFilters = {
        client: selectedClientId,
        type: selectedExerciseType.id,
      };
      if (selectedBlock) {
        matchFilters.is_block_template = true;
        matchFilters.block = selectedBlock.id;
        matchFilters.client = user.id;
      }
      const date = selectedBlock ? selectedBlockDate : selectedDate;
      const { data: previousExercises, error } = await supabase
        .from("exercise")
        .select("*")
        .match(matchFilters)
        .lt("date", date.toDateString())
        .order("date", { ascending: false })
        .limit(1);
      console.log("previousExercises", previousExercises);
      if (error) {
        console.error(error);
      } else {
        if (previousExercises.length > 0) {
          setPreviousExercise(previousExercises[0]);
        } else {
          setPreviousExercise();
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
    const _selectedDate = selectedBlock ? selectedBlockDate : selectedDate;
    daysSincePreviousExercise = Math.floor(
      (_selectedDate - new Date(previousExercise.date)) / (1000 * 60 * 60 * 24)
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

  useEffect(() => {
    if (sameRestDurationForEachSet) {
      setRestDuration([restDuration[0]]);
    } else {
      setRestDuration(new Array(numberOfSets).fill(restDuration[0]));
      setIsRestDurationEmptyString(
        new Array(numberOfSets).fill(isRestDurationEmptyString[0])
      );
    }
  }, [numberOfSets]);

  const [setDurationAssigned, setSetDurationAssigned] = useState([0]);
  const [setDurationPerformed, setSetDurationPerformed] = useState([0]);
  const [isSetDurationEmptyString, setIsSetDurationEmptyString] = useState([]);
  const [
    isSetDurationPerformedEmptyString,
    setIsSetDurationPerformedEmptyString,
  ] = useState([]);
  const [sameSetDurationForEachSet, setSameSetDurationForEachSet] =
    useState(true);

  /*
  console.log({
    numberOfSets,
    setDurationAssigned,
    setDurationPerformed,
    isSetDurationEmptyString,
    isSetDurationPerformedEmptyString,
    sameSetDurationForEachSet,
  });
  */

  useEffect(() => {
    if (sameSetDurationForEachSet) {
      setSetDurationAssigned([setDurationAssigned[0]]);
    } else {
      setSetDurationAssigned(new Array(numberOfSets).fill(restDuration[0]));
      setIsSetDurationEmptyString(
        new Array(numberOfSets).fill(isSetDurationEmptyString[0])
      );
    }
    if (setDurationPerformed && setDurationPerformed.length < numberOfSets) {
      setSetDurationPerformed(setDurationPerformed.slice(0, numberOfSets));
    }
  }, [numberOfSets]);

  const [speedAssigned, setSpeedAssigned] = useState([0]);
  const [speedPerformed, setSpeedPerformed] = useState([0]);
  const [isSpeedEmptyString, setIsSpeedEmptyString] = useState([]);
  const [isSpeedPerformedEmptyString, setIsSpeedPerformedEmptyString] =
    useState([]);
  const [sameSpeedForEachSet, setSameSpeedForEachSet] = useState(true);

  /*
  console.log({
    numberOfSets,
    speedAssigned,
    speedPerformed,
    isSpeedEmptyString,
    isSpeedPerformedEmptyString,
    sameSpeedForEachSet,
  });
  */

  useEffect(() => {
    if (sameSpeedForEachSet) {
      setSpeedAssigned([speedAssigned[0]]);
    } else {
      setSpeedAssigned(new Array(numberOfSets).fill(restDuration[0]));
      setIsSpeedEmptyString(
        new Array(numberOfSets).fill(isSpeedEmptyString[0])
      );
    }
    if (speedPerformed && speedPerformed.length < numberOfSets) {
      setSpeedPerformed(speedPerformed.slice(0, numberOfSets));
    }
  }, [numberOfSets]);

  const [distanceAssigned, setDistanceAssigned] = useState([0]);
  const [distancePerformed, setDistancePerformed] = useState([0]);
  const [isDistanceEmptyString, setIsDistanceEmptyString] = useState([]);
  const [isDistancePerformedEmptyString, setIsDistancePerformedEmptyString] =
    useState([]);
  const [sameDistanceForEachSet, setSameDistanceForEachSet] = useState(true);
  const [distanceUnit, setDistanceUnit] = useState("mi");

  /*
  console.log({
    numberOfSets,
    distanceAssigned,
    distancePerformed,
    isDistanceEmptyString,
    isDistancePerformedEmptyString,
    sameDistanceForEachSet,
    distanceUnit,
  });
  */

  useEffect(() => {
    if (sameDistanceForEachSet) {
      setDistanceAssigned([distanceAssigned[0]]);
    } else {
      setDistanceAssigned(new Array(numberOfSets).fill(restDuration[0]));
      setIsDistanceEmptyString(
        new Array(numberOfSets).fill(isDistanceEmptyString[0])
      );
    }
    if (distancePerformed && distancePerformed.length < numberOfSets) {
      setDistancePerformed(distancePerformed.slice(0, numberOfSets));
    }
  }, [numberOfSets]);

  const [levelAssigned, setLevelAssigned] = useState([0]);
  const [levelPerformed, setLevelPerformed] = useState([0]);
  const [isLevelEmptyString, setIsLevelEmptyString] = useState([]);
  const [isLevelPerformedEmptyString, setIsLevelPerformedEmptyString] =
    useState([]);
  const [sameLevelForEachSet, setSameLevelForEachSet] = useState(true);

  /*
  console.log({
    numberOfSets,
    levelAssigned,
    levelPerformed,
    isLevelEmptyString,
    isLevelPerformedEmptyString,
    sameLevelForEachSet,
  });
  */

  useEffect(() => {
    if (sameLevelForEachSet) {
      setLevelAssigned([levelAssigned[0]]);
    } else {
      setLevelAssigned(new Array(numberOfSets).fill(restDuration[0]));
      setIsLevelEmptyString(
        new Array(numberOfSets).fill(isLevelEmptyString[0])
      );
    }
    if (levelPerformed && levelPerformed.length < numberOfSets) {
      setLevelPerformed(levelPerformed.slice(0, numberOfSets));
    }
  }, [numberOfSets]);

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

      if (previousExercise.speed_assigned) {
        setSpeedAssigned(previousExercise.speed_assigned);
        setSameSpeedForEachSet(
          previousExercise.speed_assigned.length !==
            previousExercise.number_of_sets_assigned
        );
      }

      if (previousExercise.distance_assigned) {
        setDistanceAssigned(previousExercise.distance_assigned);
        setSameDistanceForEachSet(
          previousExercise.distance_assigned.length !==
            previousExercise.number_of_sets_assigned
        );
        setDistanceUnit(previousExercise.distance_unit);
      }

      if (previousExercise.level_assigned) {
        setLevelAssigned(previousExercise.level_assigned);
        setSameLevelForEachSet(
          previousExercise.level_assigned.length !==
            previousExercise.number_of_sets_assigned
        );
      }

      if (previousExercise.style) {
        setStyle(previousExercise.style);
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

  const [notes, setNotes] = useState("");
  const maxNotesLength = 500;

  const [feedback, setFeedback] = useState("");
  const maxFeedbackLength = 500;

  let blockDayIndex = 0;
  if (selectedBlock) {
    blockDayIndex =
      (selectedBlockDate - firstDayOfBlockTemplate) / (1000 * 60 * 60 * 24);
  }

  return (
    <Modal
      {...props}
      title={selectedExercise ? "Edit Exercise" : "Add Exercise"}
      message={
        <>
          {selectedExercise ? "Update" : "Add an"} exercise to{" "}
          <span className={selectedClient ? "font-semibold" : ""}>
            {selectedClient ? `${selectedClient.client_email}'s` : "your"}
          </span>{" "}
          {selectedBlock ? `block "${selectedBlock.name}"` : "workout"} for{" "}
          <span className="font-semibold">
            {selectedBlock
              ? `day ${blockDayIndex + 1}`
              : selectedDate?.toDateString()}
          </span>
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

              ...(selectedExerciseType.styles?.length > 0
                ? {
                    style,
                  }
                : {}),

              ...(selectedExerciseType.features?.includes("reps")
                ? {
                    number_of_reps_assigned: numberOfReps,
                    number_of_reps_performed: numberOfRepsPerformed.slice(
                      0,
                      numberOfSetsPerformed
                    ),
                  }
                : {}),

              ...(selectedExerciseType.features?.includes("weight")
                ? {
                    is_weight_in_kilograms: isUsingKilograms,
                    weight_assigned: isUsingKilograms
                      ? weightKilograms
                      : weightPounds,
                    weight_performed: (isUsingKilograms
                      ? weightPerformedKilograms
                      : weightPerformedPounds
                    ).slice(0, numberOfSetsPerformed),
                  }
                : {}),

              rest_duration: includeRestDuration ? restDuration : null,

              ...(selectedExerciseType.features?.includes("duration")
                ? {
                    set_duration_assigned: setDurationAssigned,
                    set_duration_performed: setDurationPerformed.slice(
                      0,
                      numberOfSetsPerformed
                    ),
                  }
                : {}),

              ...(selectedExerciseType.features?.includes("speed")
                ? {
                    speed_assigned: speedAssigned,
                    speed_performed: speedPerformed.slice(
                      0,
                      numberOfSetsPerformed
                    ),
                  }
                : {}),

              ...(selectedExerciseType.features?.includes("level")
                ? {
                    level_assigned: levelAssigned,
                    level_performed: levelPerformed.slice(
                      0,
                      numberOfSetsPerformed
                    ),
                  }
                : {}),

              ...(selectedExerciseType.features?.includes("distance")
                ? {
                    distance_assigned: distanceAssigned,
                    distance_performed: distancePerformed.slice(
                      0,
                      numberOfSetsPerformed
                    ),
                    distance_unit: distanceUnit,
                  }
                : {}),

              difficulty,
              video,

              notes,
              feedback,
            };
            if (selectedBlock) {
              Object.assign(updateExerciseData, {
                difficulty: null,
                video: null,
                feedback: null,
                time: null,
                number_of_sets_performed: null,
                number_of_reps_performed: null,
                weight_performed: null,
                set_duration_performed: null,
                speed_performed: null,
                level_performed: null,
                distance_performed: null,
              });
            }
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

            setEditExerciseStatus?.(status);
            setShowEditExerciseNotification?.(true);
          } else {
            setIsAddingExercise(true);
            const createExerciseData = {
              client:
                selectedBlock || amITheClient ? user.id : selectedClient.client,
              client_email:
                selectedBlock || amITheClient
                  ? user.email
                  : selectedClient.client_email,

              //date: selectedDate,
              date: dateToString(
                selectedBlock ? selectedBlockDate : selectedDate
              ),
              block: selectedBlock ? selectedBlock.id : null,
              is_block_template: selectedBlock ? true : false,
              time: includeTimePerformed ? timePerformed : null,

              type: selectedExerciseType.id,

              notes,
              feedback,

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

              ...(selectedExerciseType.styles?.length > 0
                ? {
                    style,
                  }
                : {}),

              rest_duration: includeRestDuration ? restDuration : null,

              ...(selectedExerciseType.features?.includes("duration")
                ? {
                    set_duration_assigned: setDurationAssigned,
                  }
                : {}),

              ...(selectedExerciseType.features?.includes("speed")
                ? {
                    speed_assigned: speedAssigned,
                  }
                : {}),

              ...(selectedExerciseType.features?.includes("level")
                ? {
                    level_assigned: levelAssigned,
                  }
                : {}),

              ...(selectedExerciseType.features?.includes("distance")
                ? {
                    distance_assigned: distanceAssigned,
                    distance_unit: distanceUnit,
                  }
                : {}),
            };
            if (!selectedBlock && !amITheClient) {
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

            setAddExerciseStatus?.(status);
            setShowAddExerciseNotification?.(true);
          }

          setExerciseStatus?.(status);
          setShowExerciseNotification?.(true);

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
                fetchVideo={false}
                className="min-h-[150px] min-w-[150px]"
                width={150}
                height={150}
              />
            </div>
          )}
          {previousExercise && (
            <p className="mt-2 text-sm text-gray-500">
              This exercise was {selectedBlock ? "programmed" : "done"}{" "}
              {daysSincePreviousExercise} day
              {daysSincePreviousExercise > 1 && "s"} ago{" "}
              {!selectedBlock && `on ${previousExercise.date}`}
              {previousExercise.time
                ? ` at ${timeToDate(previousExercise.time).toLocaleTimeString(
                    [],
                    { timeStyle: "short" }
                  )}`
                : ""}{" "}
              <MyLink
                onClick={() => {
                  return;
                  setSelectedDate(stringToDate(previousExercise.date));
                  setOpen(false);
                }}
                target="_blank"
                href={`/dashboard/diary?date=${stringToDate(
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

          {selectedExerciseType?.group?.length > 0 && (
            <div className="mt-3">
              <ExerciseTypesSelect
                required={false}
                selectedExerciseType={selectedExerciseType}
                groupOnly
                setSelectedExerciseType={setSelectedExerciseType}
                open={open}
                existingExercises={existingExercises}
                selectedExercise={selectedExercise}
              />
            </div>
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
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Sets</dt>
                <dd className="mt-1 break-words text-sm text-gray-900">
                  {previousExercise.number_of_sets_performed === null &&
                    previousExercise.number_of_sets_assigned}
                  {previousExercise.number_of_sets_performed !== null && (
                    <>
                      {previousExercise.number_of_sets_performed}/
                      {previousExercise.number_of_sets_assigned}
                    </>
                  )}
                </dd>
              </div>
            )}

            {previousExercise.number_of_reps_assigned && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Reps</dt>
                <dd className="mt-1 break-words text-sm text-gray-900">
                  {previousExercise.number_of_reps_performed === null &&
                    previousExercise.number_of_reps_assigned
                      .map((reps) => (reps == 0 ? "amrap" : reps))
                      .join(", ")}
                  {previousExercise.number_of_reps_performed !== null &&
                    previousExercise.number_of_reps_performed
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

            {previousExercise.weight_assigned?.some((weight) => weight > 0) && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Weight (
                  {previousExercise.is_weight_in_kilograms ? "kg" : "lbs"})
                </dt>
                <dd className="mt-1 break-words text-sm text-gray-900">
                  {previousExercise.weight_performed === null &&
                    previousExercise.weight_assigned.join(", ")}
                  {previousExercise.weight_performed !== null &&
                    previousExercise.weight_performed
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

            {previousExercise.rest_duration?.some((value) => value > 0) && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Rest Duration (min)
                </dt>
                <dd className="mt-1 break-words text-sm text-gray-900">
                  {previousExercise.rest_duration.join(", ")}
                </dd>
              </div>
            )}

            {previousExercise.set_duration_assigned?.some(
              (value) => value > 0
            ) && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Set Duration (min)
                </dt>
                <dd className="mt-1 break-words text-sm text-gray-900">
                  {previousExercise.set_duration_performed === null &&
                    previousExercise.set_duration_assigned.join(", ")}
                  {previousExercise.set_duration_performed !== null &&
                    previousExercise.set_duration_performed
                      .map(
                        (setDurationPerformed, index) =>
                          `${setDurationPerformed}/${
                            previousExercise.set_duration_assigned[index] ||
                            previousExercise.set_duration_assigned[0]
                          }`
                      )
                      .join(", ")}
                </dd>
              </div>
            )}

            {previousExercise.speed_assigned?.some((value) => value > 0) && (
              <>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Speed</dt>
                  <dd className="mt-1 break-words text-sm text-gray-900">
                    {previousExercise.speed_assigned.join(", ")}
                  </dd>
                </div>
                {previousExercise.speed_performed === null && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Speed</dt>
                    <dd className="mt-1 break-words text-sm text-gray-900">
                      {previousExercise.speed_performed === null &&
                        previousExercise.speed_performed
                          .map(
                            (speedPerformed, index) =>
                              `${speedPerformed}/${
                                previousExercise.speed_assigned[index] ||
                                previousExercise.speed_assigned[0]
                              }`
                          )
                          .join(", ")}
                      {previousExercise.speed_performed !== null &&
                        previousExercise.speed_assigned.join(", ")}
                    </dd>
                  </div>
                )}
              </>
            )}

            {previousExercise.level_assigned?.some((value) => value > 0) && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Level</dt>
                <dd className="mt-1 break-words text-sm text-gray-900">
                  {previousExercise.level_performed === null &&
                    previousExercise.level_assigned.join(", ")}
                  {previousExercise.level_performed !== null &&
                    previousExercise.level_performed
                      .map(
                        (level, index) =>
                          `${level}/${
                            previousExercise.level_assigned[index] ||
                            previousExercise.level_assigned[0]
                          }`
                      )
                      .join(", ")}
                </dd>
              </div>
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

            {previousVideo?.map(
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
                        )}
                      </dd>
                    </div>
                  </React.Fragment>
                )
            )}

            {previousExercise.notes?.length > 0 && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 break-words text-sm text-gray-900">
                  {previousExercise.notes}
                </dd>
              </div>
            )}
            {previousExercise.feedback?.length > 0 && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Feedback</dt>
                <dd className="mt-1 break-words text-sm text-gray-900">
                  {previousExercise.feedback}
                </dd>
              </div>
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

            {selectedExerciseType.styles?.length > 0 && (
              <div>
                <label
                  htmlFor="style"
                  className="block select-none text-sm font-medium text-gray-700"
                >
                  Style
                </label>
                <div className="mt-1">
                  <select
                    className="mt-1 block w-fit rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    value={style || ""}
                    onInput={(e) => {
                      const newStyle = e.target.value;
                      setStyle(newStyle);
                    }}
                  >
                    {selectedExerciseType.styles.map((style, index) => {
                      const id = `${style}-${index}`;
                      return (
                        <option
                          key={id}
                          value={style}
                          className="flex items-center text-base sm:text-sm"
                        >
                          {style}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            )}

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

                {selectedExerciseType.features?.includes("speed") && (
                  <div className="relative flex self-center">
                    <div className="flex h-5 items-center">
                      <input
                        id="sameSpeedForEachSet"
                        name="sameSpeedForEachSet"
                        type="checkbox"
                        checked={sameSpeedForEachSet}
                        onChange={(e) => {
                          const newSameSpeedForEachSet = e.target.checked;
                          if (newSameSpeedForEachSet) {
                            setSpeedAssigned([speedAssigned[0]]);
                          } else {
                            setSpeedAssigned(
                              new Array(numberOfSets).fill(speedAssigned[0])
                            );
                          }
                          setSameSpeedForEachSet(newSameSpeedForEachSet);
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="sameSpeedForEachSet"
                        className="select-none font-medium text-gray-700"
                      >
                        Same Speed for Each Set
                      </label>
                    </div>
                  </div>
                )}

                {selectedExerciseType.features?.includes("distance") && (
                  <div className="relative flex self-center">
                    <div className="flex h-5 items-center">
                      <input
                        id="sameDistanceForEachSet"
                        name="sameDistanceForEachSet"
                        type="checkbox"
                        checked={sameDistanceForEachSet}
                        onChange={(e) => {
                          const newSameDistanceForEachSet = e.target.checked;
                          if (newSameDistanceForEachSet) {
                            setDistanceAssigned([distanceAssigned[0]]);
                          } else {
                            setDistanceAssigned(
                              new Array(numberOfSets).fill(distanceAssigned[0])
                            );
                          }
                          setSameDistanceForEachSet(newSameDistanceForEachSet);
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="sameDistanceForEachSet"
                        className="select-none font-medium text-gray-700"
                      >
                        Same Distance for Each Set
                      </label>
                    </div>
                  </div>
                )}

                {selectedExerciseType.features?.includes("level") && (
                  <div className="relative flex self-center">
                    <div className="flex h-5 items-center">
                      <input
                        id="sameLevelForEachSet"
                        name="sameLevelForEachSet"
                        type="checkbox"
                        checked={sameLevelForEachSet}
                        onChange={(e) => {
                          const newSameLevelForEachSet = e.target.checked;
                          if (newSameLevelForEachSet) {
                            setLevelAssigned([levelAssigned[0]]);
                          } else {
                            setLevelAssigned(
                              new Array(numberOfSets).fill(levelAssigned[0])
                            );
                          }
                          setSameLevelForEachSet(newSameLevelForEachSet);
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="sameLevelForEachSet"
                        className="select-none font-medium text-gray-700"
                      >
                        Same Level for Each Set
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
                {new Array(sameSetDurationForEachSet ? 1 : numberOfSets)
                  .fill(1)
                  .map((_, index) => (
                    <div
                      className={index === 0 ? "col-start-1" : ""}
                      key={index}
                    >
                      <label
                        htmlFor={`set-duration-${index}`}
                        className="block select-none text-sm font-medium text-gray-700"
                      >
                        Set Duration{" "}
                        {sameSetDurationForEachSet ? "" : `#${index + 1}`}
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <input
                          required
                          type="number"
                          inputMode="decimal"
                          step="1"
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
                {new Array(sameWeightForEachSet ? 1 : numberOfSets)
                  .fill(1)
                  .map((_, index) => (
                    <div
                      key={index}
                      className={index === 0 ? "col-start-1" : ""}
                    >
                      <label
                        htmlFor={`weight-${index}`}
                        className="block select-none text-sm font-medium text-gray-700"
                      >
                        Weight {sameWeightForEachSet ? "" : `#${index + 1}`}
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <input
                          required
                          type="number"
                          inputMode="decimal"
                          step="0.5"
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

            {selectedExerciseType.features?.includes("speed") && (
              <>
                {new Array(sameSpeedForEachSet ? 1 : numberOfSets)
                  .fill(1)
                  .map((_, index) => (
                    <div
                      className={index === 0 ? "col-start-1" : ""}
                      key={index}
                    >
                      <label
                        htmlFor={`set-speed-${index}`}
                        className="block select-none text-sm font-medium text-gray-700"
                      >
                        Speed {sameSpeedForEachSet ? "" : `#${index + 1}`}
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <input
                          required
                          type="number"
                          inputMode="decimal"
                          step="0.1"
                          min="0"
                          value={
                            isSpeedEmptyString[index]
                              ? ""
                              : speedAssigned[index]
                          }
                          placeholder={0}
                          onInput={(e) => {
                            const newIsSpeedEmptyString =
                              isSpeedEmptyString.slice();
                            newIsSpeedEmptyString[index] =
                              e.target.value === "";
                            setIsSpeedEmptyString(newIsSpeedEmptyString);

                            const newSpeed = speedAssigned.slice();
                            newSpeed[index] = Number(e.target.value);
                            setSpeedAssigned(newSpeed);
                          }}
                          name={`set-speed-${index}`}
                          id={`set-speed-${index}`}
                          className="hide-arrows block w-full rounded-md border-gray-300 pr-12 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 sm:text-sm">mph</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </>
            )}

            {selectedExerciseType.features?.includes("level") && (
              <>
                {new Array(sameLevelForEachSet ? 1 : numberOfSets)
                  .fill(1)
                  .map((_, index) => (
                    <div
                      className={index === 0 ? "col-start-1" : ""}
                      key={index}
                    >
                      <label
                        htmlFor={`set-level-${index}`}
                        className="block select-none text-sm font-medium text-gray-700"
                      >
                        Level {sameLevelForEachSet ? "" : `#${index + 1}`}
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <input
                          required
                          type="number"
                          inputMode="decimal"
                          step="0.1"
                          min="0"
                          value={
                            isLevelEmptyString[index]
                              ? ""
                              : levelAssigned[index]
                          }
                          placeholder={0}
                          onInput={(e) => {
                            const newIsLevelEmptyString =
                              isLevelEmptyString.slice();
                            newIsLevelEmptyString[index] =
                              e.target.value === "";
                            setIsLevelEmptyString(newIsLevelEmptyString);

                            const newLevel = levelAssigned.slice();
                            newLevel[index] = Number(e.target.value);
                            setLevelAssigned(newLevel);
                          }}
                          name={`set-level-${index}`}
                          id={`set-level-${index}`}
                          className="hide-arrows block w-full rounded-md border-gray-300 pr-12 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  ))}
              </>
            )}

            {selectedExerciseType.features?.includes("distance") && (
              <>
                {new Array(sameDistanceForEachSet ? 1 : numberOfSets)
                  .fill(1)
                  .map((_, index) => (
                    <div
                      className={index === 0 ? "col-start-1" : ""}
                      key={index}
                    >
                      <label
                        htmlFor={`set-distance-${index}`}
                        className="block select-none text-sm font-medium text-gray-700"
                      >
                        Distance {sameDistanceForEachSet ? "" : `#${index + 1}`}
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <input
                          required
                          type="number"
                          inputMode="decimal"
                          step="0.1"
                          min="0"
                          value={
                            isDistanceEmptyString[index]
                              ? ""
                              : distanceAssigned[index]
                          }
                          placeholder={0}
                          onInput={(e) => {
                            const newIsDistanceEmptyString =
                              isDistanceEmptyString.slice();
                            newIsDistanceEmptyString[index] =
                              e.target.value === "";
                            setIsDistanceEmptyString(newIsDistanceEmptyString);

                            const newDistance = distanceAssigned.slice();
                            newDistance[index] = Number(e.target.value);
                            setDistanceAssigned(newDistance);
                          }}
                          name={`set-distance-${index}`}
                          id={`set-distance-${index}`}
                          className="hide-arrows block w-full rounded-md border-gray-300 pr-12 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center">
                          <label htmlFor="distance-unit" className="sr-only">
                            distance unit
                          </label>
                          <select
                            id={`distance-unit-${index}`}
                            name={`distance-unit-${index}`}
                            className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            onChange={(e) => setDistanceUnit(e.target.value)}
                            value={distanceUnit}
                          >
                            {distanceUnits.map((unit) => (
                              <option key={unit}>{unit}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
              </>
            )}

            {includeRestDuration && (
              <>
                {new Array(sameRestDurationForEachSet ? 1 : numberOfSets)
                  .fill(1)
                  .map((_, index) => (
                    <div
                      className={index === 0 ? "col-start-1" : ""}
                      key={index}
                    >
                      <label
                        htmlFor={`rest-duration-${index}`}
                        className="block select-none text-sm font-medium text-gray-700"
                      >
                        Rest Duration{" "}
                        {sameRestDurationForEachSet ? "" : `#${index + 1}`}
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <input
                          required
                          type="number"
                          inputMode="decimal"
                          step="1"
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

            <div className="relative w-full sm:col-span-3">
              <label
                htmlFor="notes"
                className="block select-none text-sm font-medium text-gray-700"
              >
                Notes
              </label>
              <div className="mt-1">
                <textarea
                  placeholder="optional notes"
                  value={notes}
                  maxLength={maxNotesLength}
                  onInput={(e) => {
                    const newNotes = e.target.value;
                    setNotes(newNotes.slice(0, maxNotesLength));
                  }}
                  name="notes"
                  id="notes"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <p className="mt-2 text-sm text-gray-500">
                  {notes.length}/{maxNotesLength}
                </p>
              </div>
            </div>
          </>
        )}

        {selectedExercise && !selectedBlock && (
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
                        value={
                          isNumberOfRepsPerformedEmptyString[index]
                            ? ""
                            : numberOfRepsPerformed[index]
                        }
                        onInput={(e) => {
                          const newIsRepsPerformedEmptyString =
                            isNumberOfRepsPerformedEmptyString.slice();
                          newIsRepsPerformedEmptyString[index] =
                            e.target.value === "";
                          setIsNumberOfRepsPerformedEmptyString(
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

                {selectedExerciseType?.features?.includes("duration") &&
                  setDurationAssigned?.some((value) => value > 0) && (
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
                          inputMode="decimal"
                          step="1"
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

                {selectedExerciseType?.features?.includes("speed") &&
                  speedAssigned?.some((value) => value > 0) && (
                    <div>
                      <label
                        htmlFor={`set-speed-performed-${index}`}
                        className="block select-none text-sm font-medium text-gray-700"
                      >
                        Speed
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <input
                          required
                          type="number"
                          inputMode="decimal"
                          step="0.1"
                          min="0"
                          value={
                            isSpeedPerformedEmptyString[index]
                              ? ""
                              : speedPerformed[index]
                          }
                          onInput={(e) => {
                            const newIsSpeedPerformedEmptyString =
                              isSpeedPerformedEmptyString.slice();
                            newIsSpeedPerformedEmptyString[index] =
                              e.target.value === "";
                            setIsSpeedPerformedEmptyString(
                              newIsSpeedPerformedEmptyString
                            );

                            const newSpeedPerformed = speedPerformed.slice();
                            newSpeedPerformed[index] = Number(e.target.value);
                            setSpeedPerformed(newSpeedPerformed);
                          }}
                          placeholder="0"
                          name={`set-speed-performed-${index}`}
                          id={`set-speed-performed-${index}`}
                          className="hide-arrows block w-full rounded-md border-gray-300 pr-12 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 sm:text-sm">
                            /
                            {speedAssigned.length === 1
                              ? speedAssigned[0]
                              : speedAssigned[index]}{" "}
                            mph
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                {selectedExerciseType?.features?.includes("distance") &&
                  distanceAssigned?.some((value) => value > 0) && (
                    <div>
                      <label
                        htmlFor={`set-distance-performed-${index}`}
                        className="block select-none text-sm font-medium text-gray-700"
                      >
                        Distance
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <input
                          required
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0"
                          value={
                            isDistancePerformedEmptyString[index]
                              ? ""
                              : distancePerformed[index]
                          }
                          onInput={(e) => {
                            const newIsDistancePerformedEmptyString =
                              isDistancePerformedEmptyString.slice();
                            newIsDistancePerformedEmptyString[index] =
                              e.target.value === "";
                            setIsDistancePerformedEmptyString(
                              newIsDistancePerformedEmptyString
                            );

                            const newDistancePerformed =
                              distancePerformed.slice();
                            newDistancePerformed[index] = Number(
                              e.target.value
                            );
                            setDistancePerformed(newDistancePerformed);
                          }}
                          placeholder="0"
                          name={`set-distance-performed-${index}`}
                          id={`set-distance-performed-${index}`}
                          className="hide-arrows block w-full rounded-md border-gray-300 pr-12 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 sm:text-sm">
                            /
                            {distanceAssigned.length === 1
                              ? distanceAssigned[0]
                              : distanceAssigned[index]}{" "}
                            {distanceUnit}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                {selectedExerciseType?.features?.includes("level") &&
                  levelAssigned?.some((value) => value > 0) && (
                    <div>
                      <label
                        htmlFor={`set-level-performed-${index}`}
                        className="block select-none text-sm font-medium text-gray-700"
                      >
                        Level
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <input
                          required
                          type="number"
                          inputMode="decimal"
                          step="0.1"
                          min="0"
                          value={
                            isLevelPerformedEmptyString[index]
                              ? ""
                              : levelPerformed[index]
                          }
                          onInput={(e) => {
                            const newIsLevelPerformedEmptyString =
                              isLevelPerformedEmptyString.slice();
                            newIsLevelPerformedEmptyString[index] =
                              e.target.value === "";
                            setIsLevelPerformedEmptyString(
                              newIsLevelPerformedEmptyString
                            );

                            const newLevelPerformed = levelPerformed.slice();
                            newLevelPerformed[index] = Number(e.target.value);
                            setLevelPerformed(newLevelPerformed);
                          }}
                          placeholder="0"
                          name={`set-level-performed-${index}`}
                          id={`set-level-performed-${index}`}
                          className="hide-arrows block w-full rounded-md border-gray-300 pr-12 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 sm:text-sm">
                            /
                            {levelAssigned.length === 1
                              ? levelAssigned[0]
                              : levelAssigned[index]}{" "}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                {selectedExerciseType?.features?.includes("weight") &&
                  (isUsingKilograms ? weightKilograms : weightPounds)?.some(
                    (value) => value > 0
                  ) && (
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
                          step="0.1"
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

                {!video[index] && (
                  <>
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
                          placeholder="https://youtu.be/6Lk49reiGxQ"
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

                            if (videoId) {
                              const newVideo = video.slice();
                              newVideo[index] = { videoId, start: timecode };
                              setVideo(newVideo);
                            }
                          }}
                          className="relative -ml-px inline-flex select-none items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <UploadIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>
                    <div className="sm:col-span-3">
                      {" "}
                      <label
                        htmlFor={`google-drive-video-${index}`}
                        className="block select-none text-sm font-medium text-gray-700"
                      >
                        Google Drive Video
                      </label>
                      <div className="relative mt-1 flex flex-grow items-stretch focus-within:z-10">
                        <input
                          autoComplete="off"
                          type="text"
                          placeholder="https://drive.google.com/file/d/abcdef12345/view"
                          name={`google-drive-video-${index}`}
                          id={`google-drive-video-${index}`}
                          className="block w-full rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            const inputValue = e.target
                              .closest("div")
                              .querySelector("input").value;

                            let videoId;
                            try {
                              const url = new URL(inputValue);
                              console.log("url", url);
                              if (
                                url.hostname === "drive.google.com" &&
                                url.pathname.startsWith("/file/d/")
                              ) {
                                videoId = url.pathname.split("/")[3];
                              }
                            } catch (error) {
                              console.log("invalid url", inputValue, error);
                            }

                            if (videoId) {
                              const newVideo = video.slice();
                              newVideo[index] = {
                                videoId,
                                isGoogleDriveVideo: true,
                              };
                              setVideo(newVideo);
                            }
                          }}
                          className="relative -ml-px inline-flex select-none items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <UploadIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>
                  </>
                )}
                {video[index] &&
                  (video[index].isGoogleDriveVideo ? (
                    <>
                      <div className="sm:col-span-3">
                        <GoogleDriveVideo
                          videoId={video[index].videoId}
                          className="w-full rounded-lg"
                        ></GoogleDriveVideo>
                      </div>
                      <div className="flex justify-around gap-2 sm:col-span-3">
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
                    </>
                  ) : (
                    <>
                      <div className="sm:col-span-3">
                        <YouTube
                          videoId={video[index].videoId}
                          className=""
                          iframeClassName="rounded-lg"
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
                    </>
                  ))}
              </React.Fragment>
            ))}

            <div className="relative w-full sm:col-span-3">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center">
                <div className="inline-flex items-center rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium leading-5 text-gray-700 shadow-sm">
                  <span className="select-none">Feedback</span>
                </div>
              </div>
            </div>

            <div className="relative w-full sm:col-span-3">
              <label
                htmlFor="feedback"
                className="block select-none text-sm font-medium text-gray-700"
              >
                Feedback
              </label>
              <div className="mt-1">
                <textarea
                  placeholder="optional feedback"
                  value={feedback}
                  maxLength={maxFeedbackLength}
                  onInput={(e) => {
                    const newFeedback = e.target.value;
                    setFeedback(newFeedback.slice(0, maxFeedbackLength));
                  }}
                  name="feedback"
                  id="feedback"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <p className="mt-2 text-sm text-gray-500">
                  {feedback.length}/{maxFeedbackLength}
                </p>
              </div>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
