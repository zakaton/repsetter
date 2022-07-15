/* eslint-disable react/destructuring-assignment */
import { useEffect, useState } from "react";
import Modal from "../../Modal";
import { CameraIcon } from "@heroicons/react/outline";
import { supabase } from "../../../utils/supabase";
import { useClient } from "../../../context/client-context";
import { useUser } from "../../../context/user-context";

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

  const [includeTime, setIncludeTime] = useState(false);

  const [picture, setPicture] = useState(0);
  const [time, setTime] = useState();
  const [pictureEvent, setPictureEvent] = useState();
  const [isPictureEmptyString, setIsPictureEmptyString] = useState(true);
  const [isUsingKilograms, setIsUsingKilograms] = useState(false);
  const [previousIsUsingKilograms, setPreviousIsUsingKilograms] =
    useState(null);
  useEffect(() => {
    if (previousIsUsingKilograms === null) {
      setPreviousIsUsingKilograms(isUsingKilograms);
      return;
    }

    if (isUsingKilograms !== previousIsUsingKilograms) {
      const newPicture = isUsingKilograms
        ? poundsToKilograms(picture)
        : kilogramsToPounds(picture);
      setPicture(newPicture.toFixed(1));
      setPreviousIsUsingKilograms(isUsingKilograms);
    }
  }, [isUsingKilograms]);

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
        className="my-5 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2"
        id="pictureForm"
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
        lol
      </form>
    </Modal>
  );
}
