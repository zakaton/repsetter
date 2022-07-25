/* eslint-disable react/destructuring-assignment */
import { useEffect, useState } from "react";
import Modal from "../../Modal";
import { PencilAltIcon } from "@heroicons/react/outline";
import {
  muscles,
  muscleGroups,
  exerciseFeatures,
} from "../../../utils/exercise-utils";
import { supabase } from "../../../utils/supabase";
import { useExerciseVideos } from "../../../context/exercise-videos-context";
import { compressAccurately } from "image-conversion";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const videoFileSizeLimit = 60 * 1024;

const areArraysTheSame = (a, b) =>
  a?.length === b?.length && a?.every((value, index) => value === b?.[index]);

export default function ExerciseTypeModal(props) {
  const {
    open,
    setOpen,
    setCreateResultStatus: setExerciseTypeStatus,
    setShowCreateResultNotification: setShowExerciseTypeNotification,

    selectedExerciseType,
    setSelectedExerciseType,
  } = props;

  const { exerciseVideos, getExerciseVideo } = useExerciseVideos();

  useEffect(() => {
    if (open && (didCreateExerciseType || didUpdateExerciseType)) {
      setShowExerciseTypeNotification(false);
      setDidCreateExerciseType(false);
      setDidUpdateExerciseType(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open && selectedExerciseType) {
      setSelectedExerciseType();
    }
  }, [open]);

  const resetUI = () => {
    setExerciseTypeName("");
    setSelectedMuscles([]);
    setSelectedFeatures([]);
    setVideoUrl("");
    setVideoFile("");
    setSelectedExerciseType?.();
    setVideoDuration(0);
    setVideoThumbnailTime(null);
  };
  useEffect(() => {
    if (!open) {
      resetUI();
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
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  useEffect(() => {
    if (selectedExerciseType) {
      setExerciseTypeName(selectedExerciseType.name);
      setSelectedMuscles(
        muscles.filter((muscle) =>
          selectedExerciseType?.muscles?.includes(muscle.name)
        )
      );
      setSelectedFeatures(
        exerciseFeatures.filter((feature) =>
          selectedExerciseType?.features?.includes(feature)
        )
      );
      getExerciseVideo(selectedExerciseType.id);
    }
  }, [selectedExerciseType]);

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

  const [videoDuration, setVideoDuration] = useState(0);
  const [videoThumbnailTime, setVideoThumbnailTime] = useState(null);

  const getThumbnailImage = async () => {
    const canvas = document.getElementById("thumbnailCanvas");
    const video = document.getElementById("thumbnailVideo");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageBlob = await new Promise((resolve) => canvas.toBlob(resolve));
    const imageFile = await compressAccurately(imageBlob, {
      size: 50,
      type: "image/jpeg",
      width: 320, // FIX
    });
    console.log("imageFile", imageFile);
    return imageFile;
  };

  return (
    <Modal
      {...props}
      title={
        selectedExerciseType ? "Update Exercise Type" : "Create Exercise Type"
      }
      message={
        selectedExerciseType
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
          {selectedExerciseType
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

          if (selectedExerciseType) {
            setIsUpdatingExerciseType(true);
            console.log(exerciseTypeName, flattenedSelectedMuscles, videoFile);
            let updateExerciseError, replaceVideoError, replaceImageError;
            if (
              exerciseTypeName !== selectedExerciseType.name ||
              !areArraysTheSame(
                selectedExerciseType.muscles,
                flattenedSelectedMuscles
              ) ||
              !areArraysTheSame(selectedExerciseType.features, selectedFeatures)
            ) {
              console.log("updating exercise row");
              const { data: updateExerciseType, error } = await supabase
                .from("exercise_type")
                .update({
                  name: exerciseTypeName,
                  muscles: flattenedSelectedMuscles,
                  features: selectedFeatures,
                })
                .match({ id: selectedExerciseType.id });
              updateExerciseError = error;
              if (updateExerciseError) {
                console.error(updateExerciseError);
              }
            }

            if (videoFile) {
              console.log("updating video file", videoFile);
              const { data: replaceVideo, error } = await supabase.storage
                .from("exercise")
                .update(`${selectedExerciseType.id}.mp4`, videoFile);
              replaceVideoError = error;
              if (replaceVideoError) {
                console.error(replaceVideoError);
              }
            }

            if (videoThumbnailTime !== null) {
              const imageFile = await getThumbnailImage();

              console.log("updating image file", imageFile);
              const { data, error } = await supabase.storage
                .from("exercise")
                .update(`${selectedExerciseType.id}/image.jpg`, imageFile);
              replaceImageError = error;
              if (replaceImageError) {
                console.error(replaceImageError);
              }
            }

            let status;
            if (
              !updateExerciseError &&
              !replaceVideoError &&
              !replaceImageError
            ) {
              status = {
                type: "succeeded",
                title: "Successfully updated Exercise Type",
                exerciseTypeId: selectedExerciseType.id,
              };
            } else {
              status = {
                type: "failed",
                title:
                  updateExerciseError?.message ||
                  replaceVideoError?.message ||
                  replaceImageError?.message,
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
                  features: selectedFeatures,
                },
              ]);
            if (createdExerciseError) {
              console.error(createdExerciseError);
            }

            const createdExerciseType = createdExerciseTypes[0];

            const { data: uploadedVideo, error: uploadVideoError } =
              await supabase.storage
                .from("exercise")
                .upload(`${createdExerciseType.id}/video.mp4`, videoFile, {
                  contentType: "video/mp4",
                });
            if (uploadVideoError) {
              console.error(uploadVideoError);
            }

            const imageFile = await getThumbnailImage();
            console.log("uploading image file", imageFile);
            const { data: uploadedImage, error: uploadImageError } =
              await supabase.storage
                .from("exercise")
                .upload(`${createdExerciseType.id}/image.jpg`, imageFile, {
                  contentType: "image/jpg",
                });
            if (uploadImageError) {
              console.error(uploadImageError);
            }

            let status;
            if (
              !createdExerciseError &&
              !uploadVideoError &&
              !uploadImageError
            ) {
              status = {
                type: "succeeded",
                title: "Successfully created Exercise Type",
              };
            } else {
              status = {
                type: "failed",
                title:
                  createdExerciseError?.message ||
                  uploadVideoError?.message ||
                  uploadImageError?.message,
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

          resetUI();
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
            placeholder="Type an Exercise Name"
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
              if (muscle && !selectedMuscles.includes(muscle)) {
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

        <div className="my-4">
          <label
            htmlFor="features"
            className="block text-sm font-medium text-gray-700"
          >
            Features
          </label>
          <select
            id="features"
            name="features"
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            value={""}
            onInput={(e) => {
              const feature = e.target.value;
              if (!selectedFeatures.includes(feature)) {
                setSelectedFeatures(selectedFeatures.concat(feature));
                e.target.setCustomValidity("");
              }
            }}
          >
            <option value="">Select feature</option>
            {exerciseFeatures
              .filter((feature) => !selectedFeatures.includes(feature))
              .map((feature) => (
                <option key={feature}>{feature}</option>
              ))}
          </select>
          <div className="mt-2">
            {selectedFeatures.map((feature) => (
              <span
                key={feature}
                className="m-1 inline-flex items-center rounded-full border border-gray-200 bg-white py-1.5 pl-3 pr-2 text-sm font-medium text-gray-900"
              >
                <span>{feature}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFeatures(
                      selectedFeatures.filter(
                        (_feature) => _feature !== feature
                      )
                    );
                  }}
                  className="ml-1 inline-flex h-4 w-4 flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                >
                  <span className="sr-only">Remove filter for {feature}</span>
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
          {!videoUrl && !selectedExerciseType && (
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
          {(videoUrl || selectedExerciseType) && (
            <div>
              <video
                onLoadedMetadata={(e) => {
                  setVideoDuration(e.target.duration);
                }}
                className="aspect-[4/3] w-full"
                autoPlay={true}
                muted={true}
                loop={true}
                playsInline={true}
                src={
                  videoUrl ||
                  (selectedExerciseType &&
                    exerciseVideos?.[selectedExerciseType.id]?.url)
                }
                onSuspend={(e) => {
                  document.addEventListener("click", () => e.target.play(), {
                    once: true,
                  });
                }}
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
              />
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

              {selectedExerciseType && (
                <>
                  <label className="mt-4 block text-sm font-medium text-gray-700">
                    Current Thumbnail
                  </label>
                  <img
                    src={
                      exerciseVideos?.[selectedExerciseType.id]?.thumbnailUrl
                    }
                  />
                </>
              )}

              {videoDuration > 0 && (
                <>
                  <label className="mt-4 block text-sm font-medium text-gray-700">
                    Set Thumbnail
                  </label>
                  <video
                    crossOrigin="anonymous"
                    muted={true}
                    playsInline={true}
                    autoPlay={true}
                    controls={false}
                    onPlay={(e) => e.target.pause()}
                    onSuspend={(e) => {
                      document.addEventListener(
                        "click",
                        () => e.target.play(),
                        {
                          once: true,
                        }
                      );
                    }}
                    id="thumbnailVideo"
                    className="aspect-[4/3] w-full"
                    src={
                      videoUrl ||
                      (selectedExerciseType &&
                        exerciseVideos?.[selectedExerciseType.id]?.url)
                    }
                  />
                  <canvas
                    id="thumbnailCanvas"
                    hidden
                    className="invisible"
                  ></canvas>
                  <input
                    type="range"
                    min="0"
                    step="0.01"
                    max={videoDuration}
                    value={videoThumbnailTime || 0}
                    onInput={(e) => {
                      const newVideoThumbnailTime = Number(e.target.value);
                      const video = document.getElementById("thumbnailVideo");
                      if (video) {
                        video.currentTime = newVideoThumbnailTime;
                      }
                      setVideoThumbnailTime(newVideoThumbnailTime);
                    }}
                    className="w-full"
                  ></input>
                </>
              )}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
