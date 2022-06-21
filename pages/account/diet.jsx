import AccountCalendarLayout from "../../components/layouts/AccountCalendarLayout";
import { getAccountLayout } from "../../components/layouts/AccountLayout";

export default function Diet() {
  return (
    <>
      <AccountCalendarLayout tableName="diet">Hello!</AccountCalendarLayout>
    </>
  );
}

Diet.getLayout = getAccountLayout;
