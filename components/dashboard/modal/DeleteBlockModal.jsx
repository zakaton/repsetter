/* eslint-disable react/destructuring-assignment */
import { useState, useEffect } from "react";
import Modal from "../../Modal";
import { supabase } from "../../../utils/supabase";

export default function DeleteBlockModal(props) {
  const {
    open,
    setOpen,
    selectedResult: selectedBlock,
    selectedResults: selectedBlocks,
    setSelectedResult: setSelectedBlock,
    setSelectedResults: setSelectedBlocks,
    setDeleteResultStatus: setDeleteBlockStatus,
    setShowDeleteResultNotification: setShowDeleteBlockNotification,
  } = props;
  const [isDeleting, setIsDeleting] = useState(false);
  const [didDelete, setDidDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setIsDeleting(false);
      setDidDelete(false);
    }
  }, [open]);

  const resultName = `Block${selectedBlocks?.length > 1 ? "s" : ""}`;

  return (
    <Modal
      {...props}
      title={`Delete ${resultName}`}
      message={`Are you sure you want to delete ${
        selectedBlocks?.length > 1 ? "these blocks" : "this block"
      }? This action cannot be undone.`}
      color="red"
      Button={
        <button
          role="button"
          onClick={async () => {
            console.log("DELETING", selectedBlock, selectedBlocks);
            setIsDeleting(true);
            let status;
            let error;

            if (selectedBlock) {
              const {
                data: deleteExercisesResult,
                error: deleteExercisesError,
              } = await supabase
                .from("exercise")
                .delete()
                .match({ block: selectedBlock.id, is_block_template: true });
              console.log("deleteExercisesResult", deleteExercisesResult);
              if (deleteExercisesError) {
                console.error(deleteExercisesError);
                error = deleteExercisesError;
              }

              const {
                data: updateExercisesResult,
                error: updateExercisesError,
              } = await supabase
                .from("exercise")
                .update({ block: null })
                .match({ block: selectedBlock.id, is_block_template: false });
              console.log("updateExercisesResult", updateExercisesResult);
              if (
                updateExercisesError &&
                !Array.isArray(updateExercisesError)
              ) {
                console.error(updateExercisesError);
                error = updateExercisesError;
              }

              const { data: deleteBlockResult, error: deleteBlockError } =
                await supabase
                  .from("block")
                  .delete()
                  .eq("id", selectedBlock.id);
              console.log("deleteBlockResult", deleteBlockResult);
              if (deleteBlockError) {
                console.error(deleteBlockError);
                error = deleteBlockError;
              }
            } else if (selectedBlocks) {
              const {
                data: deleteExercisesResult,
                error: deleteExercisesError,
              } = await supabase
                .from("exercise")
                .delete()
                .match({ is_block_template: true })
                .in(
                  "block",
                  selectedBlocks.map((block) => block.id)
                );
              console.log("deleteExercisesResult", deleteExercisesResult);
              if (deleteExercisesError) {
                console.error(deleteExercisesError);
                error = deleteExercisesError;
              }

              const {
                data: updateExercisesResult,
                error: updateExercisesError,
              } = await supabase
                .from("exercise")
                .update({ block: null })
                .match({ is_block_template: false })
                .in(
                  "block",
                  selectedBlocks.map((block) => block.id)
                );
              console.log("updateExercisesResult", updateExercisesResult);
              if (
                updateExercisesError &&
                !Array.isArray(updateExercisesError)
              ) {
                console.error(updateExercisesError);
                error = updateExercisesError;
              }

              const { data: deleteBlocksResult, error: deleteBlocksError } =
                await supabase
                  .from("block")
                  .delete()
                  .in(
                    "id",
                    selectedBlocks.map((block) => block.id)
                  );
              console.log("deleteBlocksResult", deleteBlocksResult);
              if (deleteBlocksError) {
                console.error(deleteBlocksError);
                error = deleteBlocksError;
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
            setDeleteBlockStatus(status);
            setShowDeleteBlockNotification(true);
            setOpen(false);
            setSelectedBlock?.();
            setSelectedBlocks?.();
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
