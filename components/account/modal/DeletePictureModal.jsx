/* eslint-disable react/destructuring-assignment */
import { useState, useEffect } from "react";
import Modal from "../../Modal";
import { supabase } from "../../../utils/supabase";

export default function DeletePictureModal(props) {
  const {
    open,
    setOpen,
    selectedResult: selectedPicture,
    setSelectedResult: setSelectedPicture,
    setDeleteResultStatus: setDeletePictureStatus,
    setShowDeleteResultNotification: setShowDeletePictureNotification,
  } = props;
  const [isDeleting, setIsDeleting] = useState(false);
  const [didDelete, setDidDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setIsDeleting(false);
      setDidDelete(false);
    }
  }, [open]);

  return (
    <Modal
      {...props}
      title="Delete Picture"
      message="Are you sure you want to delete this picture? This action cannot be undone."
      color="red"
      Button={
        <button
          role="button"
          onClick={async () => {
            console.log("DELETING", selectedPicture);
            setIsDeleting(true);
            const { data: deletePictureResult, error: deletePictureError } =
              await supabase
                .from("picture")
                .delete()
                .eq("id", selectedPicture.id);
            console.log("deletePictureResult", deletePictureResult);
            if (deletePictureError) {
              console.error(deletePictureError);
            }

            setIsDeleting(false);
            setDidDelete(true);
            const status = {
              type: "succeeded",
              title: "Successfully deleted Picture",
            };
            console.log("status", status);
            setDeletePictureStatus(status);
            setShowDeletePictureNotification(true);
            setOpen(false);
            setSelectedPicture?.(null);
          }}
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
        >
          {/* eslint-disable-next-line no-nested-ternary */}
          {isDeleting
            ? "Deleting Picture..."
            : didDelete
            ? "Deleted Picture!"
            : "Delete Picture"}
        </button>
      }
    ></Modal>
  );
}
