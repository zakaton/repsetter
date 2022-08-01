/* eslint-disable react/destructuring-assignment */
import { useState, useEffect } from "react";
import Modal from "../../Modal";
import { supabase, dateToString } from "../../../utils/supabase";
import { useUser } from "../../../context/user-context";
import { useClient } from "../../../context/client-context";

export default function DeletePictureModal(props) {
  const {
    open,
    setOpen,
    types: pictureTypes,
    setTypes: setPictureTypes,
    setDeleteResultStatus: setDeletePictureStatus,
    setShowDeleteResultNotification: setShowDeletePictureNotification,
  } = props;
  const [isDeleting, setIsDeleting] = useState(false);
  const [didDelete, setDidDelete] = useState(false);

  const { selectedDate } = useClient();
  const { user } = useUser();

  useEffect(() => {
    if (open) {
      setIsDeleting(false);
      setDidDelete(false);
    }
  }, [open]);

  const resultName = `Picture${pictureTypes?.length > 1 ? "s" : ""}`;

  console.log(resultName, pictureTypes);

  return (
    <Modal
      {...props}
      title={`Delete ${resultName}`}
      message={`Are you sure you want to delete ${
        pictureTypes?.length > 1 ? "these pictures" : "this picture"
      }? This action cannot be undone.`}
      color="red"
      Button={
        <button
          role="button"
          onClick={async () => {
            console.log("DELETING", pictureTypes);
            setIsDeleting(true);

            console.log(
              pictureTypes.map(
                (pictureType) =>
                  `${user.id}/${dateToString(selectedDate)}_${pictureType}.jpg`
              )
            );

            let status;
            const { data: removePicturesData, error: removePicturesError } =
              await supabase.storage
                .from("picture")
                .remove(
                  pictureTypes.map(
                    (pictureType) =>
                      `${user.id}/${dateToString(
                        selectedDate
                      )}_${pictureType}.jpg`
                  )
                );

            console.log("removePicturesData", removePicturesData);

            if (removePicturesError) {
              status = {
                type: "failed",
                title: `Failed to Delete ${resultName}`,
                message: removePicturesError.message,
              };
            } else {
              status = {
                type: "succeeded",
                title: `Successfully deleted ${resultName}`,
              };
            }

            console.log("status", status);
            setIsDeleting(false);
            setDidDelete(true);
            setDeletePictureStatus(status);
            setShowDeletePictureNotification(true);
            setOpen(false);
            setPictureTypes?.();
          }}
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
        >
          {/* eslint-disable-next-line no-nested-ternary */}
          {isDeleting
            ? `Deleting ${resultName}...`
            : didDelete
            ? `Deleted ${resultName}!`
            : `Delete ${resultName}`}
        </button>
      }
    ></Modal>
  );
}
