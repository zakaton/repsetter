/* eslint-disable react/destructuring-assignment */
import { useState, useEffect } from "react";
import Modal from "../../Modal";
import { supabase } from "../../../utils/supabase";

export default function DeleteExerciseModal(props) {
  const {
    open,
    setOpen,
    selectedResult: selectedExercise,
    selectedResults: selectedExercises,
    setSelectedResult: setSelectedExercise,
    setSelectedResults: setSelectedExercises,
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

  const resultName = `Exercise${selectedExercises ? "s" : ""}`;

  return (
    <Modal
      {...props}
      title={`Delete ${resultName}`}
      message={`Are you sure you want to delete ${
        selectedExercises ? "these exercises" : "this exercise"
      }? This action cannot be undone.`}
      color="red"
      Button={
        <button
          role="button"
          onClick={async () => {
            console.log("DELETING", selectedExercise, selectedExercises);
            setIsDeleting(true);
            let status;
            let error;
            if (selectedExercise) {
              const { data: deleteExerciseResult, error: deleteExerciseError } =
                await supabase
                  .from("exercise")
                  .delete()
                  .eq("id", selectedExercise.id);
              console.log("deleteExerciseResult", deleteExerciseResult);
              if (deleteExerciseError) {
                console.error(deleteExerciseError);
                error = deleteExerciseError;
              }
            } else if (selectedExercises) {
              const {
                data: deleteExercisesResult,
                error: deleteExercisesError,
              } = await supabase
                .from("exercise")
                .delete()
                .in(
                  "id",
                  selectedExercises.map((exercise) => exercise.id)
                );
              console.log("deleteExercisesResult", deleteExercisesResult);
              if (deleteExercisesError) {
                console.error(deleteExercisesError);
                error = deleteExercisesError;
              }
            }

            setIsDeleting(false);
            setDidDelete(true);
            if (error) {
              status = {
                type: "failed",
                title: `Failed to delete ${resultName}`,
                message: error.message,
              };
            } else {
              status = {
                type: "succeeded",
                title: `Successfully deleted ${resultName}`,
              };
            }
            console.log("status", status);
            setDeleteExerciseStatus(status);
            setShowDeleteExerciseNotification(true);
            setOpen(false);
            setSelectedExercise?.();
            setSelectedExercises?.();
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
