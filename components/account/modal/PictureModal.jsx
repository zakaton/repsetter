/* eslint-disable react/destructuring-assignment */
import { useEffect, useState } from "react";
import Modal from "../../Modal";
import { CameraIcon } from "@heroicons/react/outline";
import { supabase } from "../../../utils/supabase";
import { useClient } from "../../../context/client-context";
import { useUser } from "../../../context/user-context";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const pictureFileSizeLimit = 50 * 1024 ** 2;

export default function PictureModal(props) {
  const {
    open,
    setOpen,
    selectedResult: selectedPicture,
    setSelectedResult: setSelectedPicture,
    setResultStatus: setPictureStatus,
    setShowResultNotification: setShowPictureNotification,
  } = props;

  const { selectedDate } = useClient();
  const { user } = useUser();

  useEffect(() => {
    if (!open) {
      setDidAddPicture(false);
      setDidUpdatePicture(false);

      setIsAddingPicture(false);
      setIsUpdatingPicture(false);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (selectedPicture) {
      } else {
      }
    }
  }, [open, selectedPicture]);

  const [isAddingPicture, setIsAddingPicture] = useState(false);
  const [didAddPicture, setDidAddPicture] = useState(false);

  const [isUpdatingPicture, setIsUpdatingPicture] = useState(false);
  const [didUpdatePicture, setDidUpdatePicture] = useState(false);

  const [picture, setPicture] = useState(0);
  const [isPictureEmptyString, setIsPictureEmptyString] = useState(true);
  const [pictureFile, setPictureFile] = useState();
  const [pictureUrl, setPictureUrl] = useState();
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const onPictureFile = (file) => {
    console.log("onPictureFile", file);
    // FILL - compress
    return;
    setPictureFile(file);
    setPictureUrl(URL.createObjectURL(file));
  };

  return (
    <Modal
      {...props}
      title={selectedPicture ? "Update Picture" : "Add Picture"}
      message={`${selectedPicture ? "Update" : "Add"} today's picture`}
      Icon={CameraIcon}
      Button={
        <button
          type="submit"
          form="pictureForm"
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
        >
          {selectedPicture
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
          let status = {};
          if (selectedPicture) {
            setIsUpdatingPicture(true);
            console.log("updatePictureData", updatePictureData);
            const { data: updatedPicture, error: updatedPictureError } =
              await supabase
                .from("picture")
                .update(updatePictureData)
                .match({ id: selectedPicture.id });
            if (updatedPictureError) {
              console.error(updatedPictureError);
              status = {
                type: "failed",
                title: "Failed to Update Picture",
                message: updatedPictureError.message,
              };
            } else {
              status = {
                type: "succeeded",
                title: "Successfully Updated Picture",
              };
            }
            setDidUpdatePicture(true);
          } else {
            setIsAddingPicture(true);
            const addPictureData = {
              date: selectedDate,
              picture,
              client: user.id,
              client_email: user.email,
            };
            const { data: addedPicture, error: addPictureError } =
              await supabase.from("picture").insert([addPictureData]);
            if (addPictureError) {
              console.error(addPictureError);
              status = { type: "failed", message: addPictureError.message };
            } else {
              console.log("addedPicture", addedPicture);
              status = {
                type: "succeeded",
                message: "Successfully added Picture",
              };
            }
            setDidAddPicture(true);
          }

          setPictureStatus(status);
          setShowPictureNotification(true);
          setOpen(false);
        }}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Upload Picture
          </label>
          {!pictureUrl && !selectedPicture && (
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
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isDraggingOver) {
                  setIsDraggingOver(false);
                  const file = e.dataTransfer.files[0];
                  onPictureFile(file);
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
                    htmlFor="picture-upload"
                    className={classNames(
                      "relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500",
                      isDraggingOver ? "bg-slate-100" : ""
                    )}
                  >
                    <span>Upload Picture</span>
                    <input
                      required
                      id="picture-upload"
                      name="picture-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      value={pictureFile}
                      onInput={(e) => {
                        const file = e.target.files[0];
                        onPictureFile(file);
                      }}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
              </div>
            </div>
          )}
          {(pictureUrl || selectedPicture) && (
            <div>
              {pictureFile && (
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
              )}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
