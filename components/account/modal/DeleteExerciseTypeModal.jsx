/* eslint-disable react/destructuring-assignment */
import { useState, useEffect } from "react";
import Modal from "../../Modal";
import { supabase } from "../../../utils/supabase";

export default function DeleteExerciseTypeModal(props) {
  const {
    open,
    setOpen,
    selectedResult: selectedExerciseType,
    setDeleteResultStatus: setDeleteExerciseTypeStatus,
    setShowDeleteResultNotification: setShowDeleteExerciseTypeNotification,
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
      title="Delete Exercise Type"
      message="Are you sure you want to delete this exercise type? This action cannot be undone."
      color="red"
      Button={
        <button
          role="button"
          onClick={async () => {
            console.log("DELETING", selectedExerciseType);
            setIsDeleting(true);
            const {
              data: deleteExerciseTypeResult,
              error: deleteExerciseTypeError,
            } = await supabase
              .from("exercise_type")
              .delete()
              .eq("id", selectedExerciseType.id);
            console.log("deleteExerciseTypeResult", deleteExerciseTypeResult);
            if (deleteExerciseTypeError) {
              console.error(deleteExerciseTypeError);
            }

            const { data: deleteVideoResult, error: deleteExerciseVideoError } =
              await supabase.storage
                .from("exercise")
                .remove([`public/${selectedExerciseType.id}.mp4`]);
            console.log("deleteVideoResult", deleteVideoResult);
            if (deleteExerciseVideoError) {
              console.error(deleteExerciseVideoError);
            }

            setIsDeleting(false);
            setDidDelete(true);
            const status = {
              type: "succeeded",
              title: "Successfully deleted Exercise Type",
            };
            console.log("status", status);
            setDeleteExerciseTypeStatus(status);
            setShowDeleteExerciseTypeNotification(true);
            setOpen(false);
          }}
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
        >
          {/* eslint-disable-next-line no-nested-ternary */}
          {isDeleting
            ? "Deleting Exercise Type..."
            : didDelete
            ? "Deleted Exercise Type!"
            : "Delete Exercise Type"}
        </button>
      }
    ></Modal>
  );
}
