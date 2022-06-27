/* eslint-disable react/destructuring-assignment */
import { useEffect, useState } from "react";
import Modal from "../../Modal";
import { ClipboardCheckIcon } from "@heroicons/react/outline";
import { supabase } from "../../../utils/supabase";
import { useClient } from "../../../context/client-context";
import { useUser } from "../../../context/user-context";

export default function AddExerciseModal(props) {
  const {
    open,
    setOpen,
    setCreateResultStatus: setAddExerciseStatus,
    setShowCreateResultNotification: setShowAddExerciseNotification,
  } = props;

  const { selectedClient, selectedDate, amITheClient, isSelectedDateToday } =
    useClient();
  const { user } = useUser();

  useEffect(() => {
    if (!open) {
      setDidAddExercise(false);
    }
  }, [open]);

  useEffect(() => {
    if (open && didAddExercise) {
      setShowAddExerciseNotification(false);
    }
  }, [open]);

  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [didAddExercise, setDidAddExercise] = useState(false);

  return (
    <Modal
      {...props}
      title="Add Exercise"
      message={`Add an exercise to ${
        selectedClient ? `${selectedClient.client_email}'s` : "your"
      } workout for ${selectedDate.toDateString()}`}
      Icon={ClipboardCheckIcon}
      Button={
        <button
          type="submit"
          form="addExerciseForm"
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
        >
          {isAddingExercise
            ? "Adding Exercise..."
            : didAddExercise
            ? "Added Exercise!"
            : "Add Exercise"}
        </button>
      }
    >
      <form
        id="addExerciseForm"
        method="POST"
        onSubmit={async (e) => {
          e.preventDefault();
          setIsAddingExercise(true);
          const form = e.target;
          const formData = new FormData(form);
          const data = new URLSearchParams();
          formData.forEach((value, key) => {
            data.append(key, value);
          });
          // FILL
          setIsAddingExercise(false);
          setDidAddExercise(true);
          const status = {
            type: "succeeded",
            title: "Successfully added Exercise",
          };
          setAddExerciseStatus(status);
          setShowAddExerciseNotification(true);
          setOpen(false);
          if (status.type === "succeeded") {
            console.log(status);
          } else {
            console.error(status);
          }
        }}
      >
        <div className="my-4">hello</div>
      </form>
    </Modal>
  );
}
