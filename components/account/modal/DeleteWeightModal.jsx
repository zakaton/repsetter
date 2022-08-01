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
    selectedResults: selectedWeights,
    setSelectedResults: setSelectedWeights,
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

  const resultName = `Weight${selectedWeights?.length > 1 ? "s" : ""}`;

  return (
    <Modal
      {...props}
      title={`Delete ${resultName}`}
      message={`Are you sure you want to delete ${
        selectedWeights?.length > 1 ? "these weights" : "this weight"
      }? This action cannot be undone.`}
      color="red"
      Button={
        <button
          role="button"
          onClick={async () => {
            console.log("DELETING", selectedWeight, selectedWeights);
            setIsDeleting(true);

            let status;
            let error;

            if (selectedWeight) {
              const { data: deleteWeightResult, error: deleteWeightError } =
                await supabase
                  .from("weight")
                  .delete()
                  .eq("id", selectedWeight.id);
              console.log("deleteWeightResult", deleteWeightResult);
              if (deleteWeightError) {
                console.error(deleteWeightError);
                error = deleteWeightError;
              }
            } else if (selectedWeights) {
              const { data: deleteWeightsResult, error: deleteWeightsError } =
                await supabase
                  .from("weight")
                  .delete()
                  .in(
                    "id",
                    selectedWeights.map((weight) => weight.id)
                  );
              console.log("deleteWeightsResult", deleteWeightsResult);
              if (deleteWeightsError) {
                console.error(deleteWeightsError);
                error = deleteWeightsError;
              }
            }

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
            setIsDeleting(false);
            setDidDelete(true);
            setDeleteWeightStatus(status);
            setShowDeleteWeightNotification(true);
            setOpen(false);
            setSelectedWeight?.();
            setSelectedWeights?.();
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
