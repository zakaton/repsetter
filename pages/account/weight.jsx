import AccountCalendarLayout from "../../components/layouts/AccountCalendarLayout";
import { getAccountLayout } from "../../components/layouts/AccountLayout";

export default function Weight() {
  return (
    <>
      <AccountCalendarLayout
        tableName="weight"
        subtitle="View and log Bodyweight"
      >
        Hello!
      </AccountCalendarLayout>
    </>
  );
}

Weight.getLayout = getAccountLayout;
