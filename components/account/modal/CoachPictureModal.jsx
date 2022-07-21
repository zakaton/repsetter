/* eslint-disable react/destructuring-assignment */
import { useEffect, useState } from "react";
import Modal from "../../Modal";
import { CameraIcon } from "@heroicons/react/outline";
import { supabase } from "../../../utils/supabase";
import { useUser } from "../../../context/user-context";
import { compressAccurately } from "image-conversion";
import { useCoachPictures } from "../../../context/coach-picture-context";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function CoachPictureModal(props) {
  const {
    open,
    setOpen,
    setResultStatus: setPictureStatus,
    setShowResultNotification: setShowPictureNotification,
  } = props;

  const { user } = useUser();

  useEffect(() => {
    if (!open) {
      setDidAddPicture(false);
      setDidUpdatePicture(false);

      setIsAddingPicture(false);
      setIsUpdatingPicture(false);
    }
  }, [open]);

  const [isAddingPicture, setIsAddingPicture] = useState(false);
  const [didAddPicture, setDidAddPicture] = useState(false);

  const [isUpdatingPicture, setIsUpdatingPicture] = useState(false);
  const [didUpdatePicture, setDidUpdatePicture] = useState(false);

  const [pictureFile, setPictureFile] = useState();
  const [pictureUrl, setPictureUrl] = useState();
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const onPictureFile = async (file) => {
    console.log("onPictureFile", file);
    const compressedFile = await compressAccurately(file, {
      size: 49,
      type: "image/jpeg",
      width: 500,
      // FIX
    });
    console.log("compressedFile", compressedFile);
    setPictureFile(compressedFile);
    setPictureUrl(URL.createObjectURL(compressedFile));
  };

  const resetUI = () => {
    setPictureUrl("");
    setPictureFile("");
  };
  useEffect(() => {
    if (!open) {
      resetUI();
    }
  }, [open]);

  const { coachPictures, getCoachPicture } = useCoachPictures();
  useEffect(() => {
    if (open) {
      getCoachPicture(user.id);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      const coachPicture = coachPictures?.[user?.id]?.url;
      if (coachPicture) {
        setPictureUrl(coachPicture);
      }
    }
  }, [open && coachPictures]);

  const doesPictureExist = coachPictures?.[user?.id]?.url;

  return (
    <Modal
      {...props}
      className="sm:w-fit"
      title={doesPictureExist ? "Update Picture" : "Add Picture"}
      message={`${doesPictureExist ? "Update" : "Add"} coaching picture`}
      Icon={CameraIcon}
      Button={
        <button
          type="submit"
          form="pictureForm"
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
        >
          {doesPictureExist
            ? isUpdatingPicture
              ? "Updating Picture..."
              : didUpdatePicture
              ? "Updated Picture!"
              : "Update Picture"
            : isAddingPicture
            ? "Adding Picture..."
            : didAddPicture
            ? "Added Picture!"
            : "Add Picture"}
        </button>
      }
    >
      <form
        id="pictureForm"
        className="mt-3"
        onSubmit={async (e) => {
          e.preventDefault();
          let status;

          if (doesPictureExist) {
            setIsUpdatingPicture(true);
          } else {
            setIsAddingPicture(true);
          }

          let uploadPictureData, uploadPictureError;
          let actionString;
          if (pictureFile) {
            if (doesPictureExist) {
              console.log("update picture");
              const { data, error } = await supabase.storage
                .from("coach-picture")
                .update(`${user.id}/image.jpg`, pictureFile, {
                  upsert: true,
                  contentType: "image/jpg",
                });
              uploadPictureData = data;
              uploadPictureError = error;
              actionString = "Update";
            } else {
              console.log("upload picture");
              const { data, error } = await supabase.storage
                .from("coach-picture")
                .upload(`${user.id}/image.jpg`, pictureFile, {
                  upsert: true,
                  contentType: "image/jpg",
                });
              uploadPictureData = data;
              uploadPictureError = error;
              actionString = "Upload";
            }
          } else if (!pictureUrl) {
            console.log("remove picture");
            const { data, error } = await supabase.storage
              .from("coach-picture")
              .remove([`${user.id}/image.jpg`]);

            uploadPictureData = data;
            uploadPictureError = error;
            actionString = "Remove";
          }

          console.log("uploadPictureData", uploadPictureData);
          if (uploadPictureError) {
            status = {
              type: "failed",
              title: `Failed to ${actionString} Picture`,
              message: uploadPictureError.message,
            };
          } else {
            status = {
              type: "succeeded",
              title: `Successfully ${
                actionString + (actionString.endsWith("e") ? "d" : "")
              } Picture`,
            };
          }

          if (doesPictureExist) {
            setDidUpdatePicture(true);
          } else {
            setDidAddPicture(true);
          }

          setPictureStatus(status);
          setShowPictureNotification(true);
          setOpen(false);
        }}
      >
        <div>
          {!pictureUrl && (
            <div
              id="pictureUploadContainer"
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
                if (
                  isDraggingOver &&
                  e.target.id === "pictureUploadContainer"
                ) {
                  setIsDraggingOver(false);
                }
              }}
              onDrop={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isDraggingOver) {
                  setIsDraggingOver(false);
                  const file = e.dataTransfer.files[0];
                  await onPictureFile(file);
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
                    htmlFor="coach-picture-upload"
                    className={classNames(
                      "relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500",
                      isDraggingOver ? "bg-slate-100" : ""
                    )}
                  >
                    <span>Upload Picture</span>
                    <input
                      id="coach-picture-upload"
                      name="coach-picture-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      value={pictureFile}
                      onInput={async (e) => {
                        const file = e.target.files[0];
                        await onPictureFile(file);
                      }}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
              </div>
            </div>
          )}
          {pictureUrl && (
            <>
              <img
                src={pictureUrl}
                alt="coaching picture"
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
                  if (
                    isDraggingOver &&
                    e.target.id === "pictureUploadContainer"
                  ) {
                    setIsDraggingOver(false);
                  }
                }}
                onDrop={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isDraggingOver) {
                    setIsDraggingOver(false);
                    const file = e.dataTransfer.files[0];
                    await onPictureFile(file);
                  }
                }}
              ></img>
              {
                <button
                  type="button"
                  className="mt-2 inline-flex items-center rounded border border-transparent bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  onClick={() => {
                    setPictureUrl();
                    setPictureFile("");
                  }}
                >
                  Clear Picture
                </button>
              }
            </>
          )}
        </div>
      </form>
    </Modal>
  );
}
