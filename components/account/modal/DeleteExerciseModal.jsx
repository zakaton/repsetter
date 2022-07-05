/* eslint-disable react/destructuring-assignment */
import { useState, useEffect } from "react";
import Modal from "../../Modal";
import { supabase } from "../../../utils/supabase";

export default function DeleteExerciseModal(props) {
  const {
    open,
    setOpen,
    selectedResult: selectedExercise,
    setSelectedResult: setSelectedExercise,
    setDeleteResultStatus: setDeleteExerciseStatus,
    setShowDeleteResultNotification: setShowDeleteExerciseNotification,
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
      title="Delete Exercise"
      message="Are you sure you want to delete this exercise? This action cannot be undone."
      color="red"
      Button={
        <button
          role="button"
          onClick={async () => {
            console.log("DELETING", selectedExercise);
            setIsDeleting(true);
            const { data: deleteExerciseResult, error: deleteExerciseError } =
              await supabase
                .from("exercise")
                .delete()
                .eq("id", selectedExercise.id);
            console.log("deleteExerciseResult", deleteExerciseResult);
            if (deleteExerciseError) {
              console.error(deleteExerciseError);
            }

            setIsDeleting(false);
            setDidDelete(true);
            const status = {
              type: "succeeded",
              title: "Successfully deleted Exercise",
            };
            console.log("status", status);
            setDeleteExerciseStatus(status);
            setShowDeleteExerciseNotification(true);
            setOpen(false);
            setSelectedExercise?.(null);
          }}
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
        >
          {/* eslint-disable-next-line no-nested-ternary */}
          {isDeleting
            ? "Deleting Exercise..."
            : didDelete
            ? "Deleted Exercise!"
            : "Delete Exercise"}
        </button>
      }
    ></Modal>
  );
}
