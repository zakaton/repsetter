import AccountCalendarLayout from "../../components/layouts/AccountCalendarLayout";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import { useClient } from "../../context/client-context";
import AddExerciseModal from "../../components/account/modal/AddExerciseModal";
import { useState } from "react";
import Notification from "../../components/Notification";

export default function Workouts() {
  const { selectedClient, selectedDate, amITheClient, isSelectedDateToday } =
    useClient();

  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showAddExerciseNotification, setShowAddExerciseNotification] =
    useState(false);
  const [addExerciseStatus, setAddExerciseStatus] = useState();

  return (
    <>
      <AddExerciseModal
        open={showAddExerciseModal}
        setOpen={setShowAddExerciseModal}
        setCreateResultStatus={setAddExerciseStatus}
        setShowCreateResultNotification={setShowAddExerciseNotification}
      />
      <Notification
        open={showAddExerciseNotification}
        setOpen={setShowAddExerciseNotification}
        status={addExerciseStatus}
      />

      <AccountCalendarLayout
        tableName="workout"
        underCalendar={
          <div className="flex gap-x-3">
            <button
              type="button"
              onClick={() => setShowAddExerciseModal(true)}
              className="mt-4 w-full rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Exercise
            </button>
          </div>
        }
      >
        Hello!
      </AccountCalendarLayout>
    </>
  );
}

Workouts.getLayout = getAccountLayout;
