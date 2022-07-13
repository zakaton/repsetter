/* eslint-disable react/destructuring-assignment */
import { useState, useEffect } from "react";
import Modal from "../../Modal";
import { supabase } from "../../../utils/supabase";

export default function DeleteWeightModal(props) {
  const {
    open,
    setOpen,
    selectedResult: selectedWeight,
    setSelectedResult: setSelectedWeight,
    setDeleteResultStatus: setDeleteWeightStatus,
    setShowDeleteResultNotification: setShowDeleteWeightNotification,
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
      title="Delete Weight"
      message="Are you sure you want to delete this weight? This action cannot be undone."
      color="red"
      Button={
        <button
          role="button"
          onClick={async () => {
            console.log("DELETING", selectedWeight);
            setIsDeleting(true);
            const { data: deleteWeightResult, error: deleteWeightError } =
              await supabase
                .from("weight")
                .delete()
                .eq("id", selectedWeight.id);
            console.log("deleteWeightResult", deleteWeightResult);
            if (deleteWeightError) {
              console.error(deleteWeightError);
            }

            setIsDeleting(false);
            setDidDelete(true);
            const status = {
              type: "succeeded",
              title: "Successfully deleted Weight",
            };
            console.log("status", status);
            setDeleteWeightStatus(status);
            setShowDeleteWeightNotification(true);
            setOpen(false);
            setSelectedWeight?.(null);
          }}
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
        >
          {/* eslint-disable-next-line no-nested-ternary */}
          {isDeleting
            ? "Deleting Weight..."
            : didDelete
            ? "Deleted Weight!"
            : "Delete Weight"}
        </button>
      }
    ></Modal>
  );
}
