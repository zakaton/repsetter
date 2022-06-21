import AccountCalendarLayout from "../../components/layouts/AccountCalendarLayout";
import { getAccountLayout } from "../../components/layouts/AccountLayout";

export default function Workouts() {
  return (
    <>
      <AccountCalendarLayout tableName="workout">Hello!</AccountCalendarLayout>
    </>
  );
}

Workouts.getLayout = getAccountLayout;
