import AccountCalendarLayout from "../../components/layouts/AccountCalendarLayout";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import { useClient } from "../../context/client-context";

export default function Workouts() {
  const { selectedClient, selectedDate, amITheClient, isSelectedDateToday } =
    useClient();
  return (
    <>
      <AccountCalendarLayout tableName="workout">Hello!</AccountCalendarLayout>
    </>
  );
}

Workouts.getLayout = getAccountLayout;
