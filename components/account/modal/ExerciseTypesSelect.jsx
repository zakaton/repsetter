import { useEffect, useState } from "react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";
import { Combobox } from "@headlessui/react";
import { useExerciseVideos } from "../../../context/exercise-videos-context";
import ExerciseTypeVideo from "../../ExerciseTypeVideo";
import { isMobile } from "react-device-detect";
import { useExerciseTypes } from "../../../context/exercise-types-context";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ExerciseTypesSelect({
  selectedExerciseType,
  setSelectedExerciseType,
  existingExercises = [],
  selectedExercise,
  open = true,
  selectedExerciseTypeName,
  setSelectedExerciseTypeName,
}) {
  const { exerciseTypes, getExerciseTypes } = useExerciseTypes();
  const { getExerciseVideo } = useExerciseVideos();

  useEffect(() => {
    console.log("open", open, exerciseTypes);
    if (open) {
      getExerciseTypes();
    }
  }, [open]);

  useEffect(() => {
    if (exerciseTypes) {
      getExerciseVideo(exerciseTypes.map(({ id }) => id));
    }
  }, [exerciseTypes]);

  useEffect(() => {
    if (selectedExerciseTypeName && exerciseTypes) {
      const selectedExerciseType = exerciseTypes.find(
        (exerciseType) => exerciseType.name === selectedExerciseTypeName
      );
      if (selectedExerciseType) {
        setSelectedExerciseType(selectedExerciseType);
      }
      setSelectedExerciseTypeName();
    }
  }, [selectedExerciseTypeName, exerciseTypes]);

  useEffect(() => {
    if (open && selectedExercise && exerciseTypes) {
      setSelectedExerciseType(
        exerciseTypes.find(
          (exerciseType) => exerciseType.id === selectedExercise.type.id
        )
      );
    }
  }, [open, selectedExercise, exerciseTypes]);

  const [query, setQuery] = useState("");
  const [filteredExerciseTypes, setFilteredExerciseTypes] = useState([]);
  useEffect(() => {
    if (exerciseTypes) {
      const queries = query.split(",");
      let filteredExerciseTypes =
        query === ""
          ? exerciseTypes
          : exerciseTypes?.filter((exerciseType) => {
              const includesName = queries.some((query) =>
                exerciseType.name.toLowerCase().includes(query.toLowerCase())
              );
              const includesMuscle = queries.some((query) =>
                exerciseType.muscles.some((muscle) =>
                  muscle.includes(query.toLowerCase())
                )
              );
              return includesName || includesMuscle;
            });
      console.log("selectedExercise", selectedExercise);
      filteredExerciseTypes = filteredExerciseTypes.filter(
        (filteredExerciseType) =>
          selectedExercise?.type.id === filteredExerciseType.id ||
          !existingExercises.find(
            (existingExercise) =>
              existingExercise.type.id === filteredExerciseType.id
          )
      );
      setFilteredExerciseTypes(filteredExerciseTypes);
    }
  }, [exerciseTypes, query]);

  return (
    <Combobox
      as="div"
      value={selectedExerciseType}
      onChange={setSelectedExerciseType}
    >
      <Combobox.Label className="block text-sm font-medium text-gray-700">
        Exercise Type
      </Combobox.Label>
      <div className="relative mt-1">
        <Combobox.Input
          required
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(exerciseType) => exerciseType?.name}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>

        {filteredExerciseTypes.length > 0 && (
          <Combobox.Options className="relative z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredExerciseTypes.map((exerciseType) => (
              <Combobox.Option
                key={exerciseType.id}
                value={exerciseType}
                className={({ active }) =>
                  classNames(
                    "border-grey-500 relative cursor-pointer select-none border-t py-2 pl-3 pr-9",
                    active ? "bg-blue-600 text-white" : "text-gray-900"
                  )
                }
              >
                {({ active, selected }) => (
                  <div className="flex items-center gap-4">
                    <ExerciseTypeVideo
                      className="w-min-[100px] shrink-0"
                      play={active || isMobile}
                      exerciseTypeId={exerciseType.id}
                      fetchVideo={false}
                    ></ExerciseTypeVideo>

                    <div className="flex flex-col gap-1">
                      <span
                        className={classNames(
                          "block text-base",
                          selected && "font-semibold"
                        )}
                      >
                        {exerciseType.name}
                      </span>

                      <span
                        className={classNames(
                          "block text-base",
                          selected && "font-semibold"
                        )}
                      >
                        {exerciseType.muscles.length > 0 && (
                          <>
                            ({exerciseType.muscles.slice(0, -1).join(", ")}
                            {exerciseType.muscles.length > 1 ? " and " : ""}
                            {
                              exerciseType.muscles[
                                exerciseType.muscles.length - 1
                              ]
                            }
                            )
                          </>
                        )}
                      </span>
                    </div>

                    {selected && (
                      <span
                        className={classNames(
                          "absolute inset-y-0 right-0 flex items-center pr-4",
                          active ? "text-white" : "text-blue-600"
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
}
