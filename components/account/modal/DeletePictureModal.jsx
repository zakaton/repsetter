/* eslint-disable react/destructuring-assignment */
import { useState, useEffect } from "react";
import Modal from "../../Modal";
import { supabase } from "../../../utils/supabase";
import { useUser } from "../../../context/user-context";
import { useClient } from "../../../context/client-context";
import { dateToString } from "../../../utils/picture-utils";

export default function DeletePictureModal(props) {
  const {
    open,
    setOpen,
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
            setIsDeleting(true);
            let status;
            const { data: removePictureData, error: removePictureError } =
              await supabase.storage
                .from("picture")
                .remove([`${user.id}/${dateToString(selectedDate)}.jpg`]);
            if (removePictureError) {
              status = {
                type: "failed",
                title: "Failed to Delete Picture",
                message: removePictureError.message,
              };
            } else {
              status = {
                type: "succeeded",
                title: "Successfully deleted Picture",
              };
            }
            setIsDeleting(false);
            setDidDelete(true);
            setDeletePictureStatus(status);
            setShowDeletePictureNotification(true);
            setOpen(false);
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
