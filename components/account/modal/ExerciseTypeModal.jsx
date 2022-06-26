/* eslint-disable react/destructuring-assignment */
import { useEffect, useState } from "react";
import { useUser } from "../../../context/user-context";
import Modal from "../../Modal";
import { PencilAltIcon } from "@heroicons/react/outline";
import { muscles, muscleGroups } from "../../../utils/exercise-utils";
import { supabase } from "../../../utils/supabase";
import { useExerciseVideos } from "../../../context/exercise-videos-context";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const videoFileSizeLimit = 50 * 1024 ** 2;

const areArraysTheSame = (a, b) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

export default function ExerciseTypeModal(props) {
  const {
    open,
    setOpen,
    setCreateResultStatus: setExerciseTypeStatus,
    setShowCreateResultNotification: setShowExerciseTypeNotification,

    selectedExercise,
    setSelectedExercise,
  } = props;

  const { exerciseVideos, getExerciseVideo } = useExerciseVideos();

  useEffect(() => {
    if (open && (didCreateExerciseType || didUpdateExerciseType)) {
      setShowExerciseTypeNotification(false);
      setDidCreateExerciseType(false);
      setDidUpdateExerciseType(false);
    }
  }, [open]);

  const [isCreatingExerciseType, setIsCreatingExerciseType] = useState(false);
  const [didCreateExerciseType, setDidCreateExerciseType] = useState(false);

  const [isUpdatingExerciseType, setIsUpdatingExerciseType] = useState(false);
  const [didUpdateExerciseType, setDidUpdateExerciseType] = useState(false);

  const [exerciseTypeName, setExerciseTypeName] = useState("");
  const maxExerciseTypeLength = 30;

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [videoUrl, setVideoUrl] = useState();
  const [videoFile, setVideoFile] = useState();

  const [selectedMuscles, setSelectedMuscles] = useState([]);

  useEffect(() => {
    if (selectedExercise) {
      setExerciseTypeName(selectedExercise.name);
      setSelectedMuscles(
        muscles.filter((muscle) =>
          selectedExercise?.muscles?.includes(muscle.name)
        )
      );
      getExerciseVideo(selectedExercise.id);
    }
  }, [selectedExercise]);

  const onVideoFile = (file) => {
    console.log("onVideoFile", file);
    if (
      file &&
      file.name.toLowerCase().endsWith(".mp4") &&
      file.size < videoFileSizeLimit
    ) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
    }
  };

  return (
    <Modal
      {...props}
      title={selectedExercise ? "Update Exercise Type" : "Create Exercise Type"}
      message={
        selectedExercise
          ? "Update Exercise"
          : "Create an Exercise Type for use in Workouts"
      }
      Icon={PencilAltIcon}
      Button={
        <button
          type="submit"
          form="exerciseTypeForm"
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
        >
          {selectedExercise
            ? isUpdatingExerciseType
              ? "Updating Exercise Type..."
              : didUpdateExerciseType
              ? "Updated Exercise Type!"
              : "Update Exercise Type"
            : isCreatingExerciseType
            ? "Creating Exercise Type..."
            : didCreateExerciseType
            ? "Created Exercise Type!"
            : "Create Exercise Type"}
        </button>
      }
    >
      <form
        id="exerciseTypeForm"
        method="POST"
        onSubmit={async (e) => {
          e.preventDefault();

          if (selectedMuscles.length === 0) {
            const musclesSelect = e.target.querySelector("select");
            const customValidity = "you must have at least 1 muscle selected";
            musclesSelect.setCustomValidity(customValidity);
            musclesSelect.reportValidity();
            return;
          }

          const flattenedSelectedMuscles = selectedMuscles.map(
            (selectedMuscle) => selectedMuscle.name
          );

          if (selectedExercise) {
            setIsUpdatingExerciseType(true);
            console.log(exerciseTypeName, flattenedSelectedMuscles, videoFile);
            let updateExerciseError, replaceVideoError;
            if (
              exerciseTypeName !== selectedExercise.name ||
              !areArraysTheSame(
                selectedExercise.muscles,
                flattenedSelectedMuscles
              )
            ) {
              console.log("updating exercise row");
              const { data: updateExerciseType, error } = await supabase
                .from("exercise_type")
                .update({
                  name: exerciseTypeName,
                  muscles: flattenedSelectedMuscles,
                })
                .match({ id: selectedExercise.id });
              updateExerciseError = error;
              if (updateExerciseError) {
                console.error(updateExerciseError);
              }
            }

            if (videoFile) {
              console.log("updating video file", videoFile);
              const { data: replaceVideo, error } = await supabase.storage
                .from("exercise")
                .update(`public/${selectedExercise.id}.mp4`, videoFile);
              replaceVideoError = error;
              if (replaceVideoError) {
                console.error(replaceVideoError);
              }
            }

            let status;
            if (!updateExerciseError && !replaceVideoError) {
              status = {
                type: "succeeded",
                title: "Successfully updated Exercise",
              };
            } else {
              status = {
                type: "failed",
                title:
                  createdExerciseError?.message || uploadVideoError?.message,
              };
            }

            setIsUpdatingExerciseType(false);
            setDidUpdateExerciseType(true);
            setExerciseTypeStatus(status);
            setShowExerciseTypeNotification(true);
            setOpen(false);
            if (status.type === "succeeded") {
              console.log(status);
            } else {
              console.error(status);
            }
          } else {
            setIsCreatingExerciseType(true);
            const { data: createdExerciseTypes, error: createdExerciseError } =
              await supabase.from("exercise_type").insert([
                {
                  name: exerciseTypeName,
                  muscles: flattenedSelectedMuscles,
                },
              ]);
            if (createdExerciseError) {
              console.error(createdExerciseError);
            }

            const createdExerciseType = createdExerciseTypes[0];

            const { data: uploadedVideo, error: uploadVideoError } =
              await supabase.storage
                .from("exercise")
                .upload(`public/${createdExerciseType.id}.mp4`, videoFile);
            if (uploadVideoError) {
              console.error(uploadVideoError);
            }

            let status;
            if (!createdExerciseError && !uploadVideoError) {
              status = {
                type: "succeeded",
                title: "Successfully created Exercise",
              };
            } else {
              status = {
                type: "failed",
                title:
                  createdExerciseError?.message || uploadVideoError?.message,
              };
            }

            setIsCreatingExerciseType(false);
            setDidCreateExerciseType(true);
            setExerciseTypeStatus(status);
            setShowExerciseTypeNotification(true);
            setOpen(false);
            if (status.type === "succeeded") {
              console.log(status);
            } else {
              console.error(status);
            }
          }

          setExerciseTypeName("");
          setSelectedMuscles([]);
          setVideoUrl("");
          setVideoFile("");
          setSelectedExercise();
        }}
      >
        <div className="my-4">
          <label
            htmlFor="exerciseName"
            className="block text-sm font-medium text-gray-700"
          >
            Exercise Name
          </label>
          <input
            required
            type="text"
            autoComplete="off"
            id="exerciseName"
            name="exerciseName"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Dumbell Splits"
            value={exerciseTypeName}
            max={maxExerciseTypeLength}
            onInput={(e) => setExerciseTypeName(e.target.value)}
          />
          <p className="my-0 mt-1 p-0 text-sm italic text-gray-400">
            {exerciseTypeName.length}/{maxExerciseTypeLength}
          </p>
        </div>
        <div className="my-4">
          <label
            htmlFor="muscles"
            className="block text-sm font-medium text-gray-700"
          >
            Muscles
          </label>
          <select
            id="muscles"
            name="muscles"
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            value={""}
            onInput={(e) => {
              const muscle = muscles.find(
                (muscle) => muscle.name === e.target.value
              );
              if (muscle) {
                setSelectedMuscles(selectedMuscles.concat(muscle));
                e.target.setCustomValidity("");
              }
            }}
          >
            <option value="">Select muscle</option>
            {muscleGroups.map((muscleGroup) => (
              <optgroup key={muscleGroup} label={muscleGroup}>
                {muscles
                  .filter(
                    (muscle) =>
                      muscle.group === muscleGroup &&
                      !selectedMuscles.includes(muscle)
                  )
                  .map((muscle) => (
                    <option key={muscle.name}>{muscle.name}</option>
                  ))}
              </optgroup>
            ))}
          </select>
          <div className="mt-2">
            {selectedMuscles.map((selectedMuscle) => (
              <span
                key={selectedMuscle.name}
                className="m-1 inline-flex items-center rounded-full border border-gray-200 bg-white py-1.5 pl-3 pr-2 text-sm font-medium text-gray-900"
              >
                <span>{selectedMuscle.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMuscles(
                      selectedMuscles.filter(
                        (_selectedMuscle) => _selectedMuscle !== selectedMuscle
                      )
                    );
                  }}
                  className="ml-1 inline-flex h-4 w-4 flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                >
                  <span className="sr-only">
                    Remove filter for {selectedMuscle.name}
                  </span>
                  <svg
                    className="h-2 w-2"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 8 8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeWidth="1.5"
                      d="M1 1l6 6m0-6L1 7"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Video
          </label>
          {!videoUrl && !selectedExercise && (
            <div
              id="videoUploadContainer"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isDraggingOver) {
                  setIsDraggingOver(true);
                }
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isDraggingOver && e.target.id === "videoUploadContainer") {
                  setIsDraggingOver(false);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isDraggingOver) {
                  setIsDraggingOver(false);
                  const file = e.dataTransfer.files[0];
                  onVideoFile(file);
                }
              }}
              className={classNames(
                "mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6",
                isDraggingOver ? "bg-slate-100" : ""
              )}
            >
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="video-upload"
                    className={classNames(
                      "relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500",
                      isDraggingOver ? "bg-slate-100" : ""
                    )}
                  >
                    <span>Upload Video</span>
                    <input
                      required
                      id="video-upload"
                      name="video-upload"
                      type="file"
                      className="sr-only"
                      accept="video/mp4,video/*"
                      value={videoFile}
                      onInput={(e) => {
                        const file = e.target.files[0];
                        onVideoFile(file);
                      }}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">.mp4 only</p>
              </div>
            </div>
          )}
          {(videoUrl || selectedExercise) && (
            <div>
              <video
                className="w-full"
                autoPlay
                muted
                loop
                src={
                  videoUrl ||
                  (selectedExercise &&
                    exerciseVideos?.[selectedExercise.id]?.url)
                }
                onDragOver={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  console.log(e);
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files[0];
                  onVideoFile(file);
                }}
              ></video>
              {videoFile && (
                <button
                  type="button"
                  className="mt-2 inline-flex items-center rounded border border-transparent bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  onClick={() => {
                    setVideoUrl();
                    setVideoFile("");
                  }}
                >
                  Clear Video
                </button>
              )}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
