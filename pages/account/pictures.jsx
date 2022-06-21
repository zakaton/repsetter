import AccountCalendarLayout from "../../components/layouts/AccountCalendarLayout";
import { getAccountLayout } from "../../components/layouts/AccountLayout";

export default function Pictures() {
  return (
    <>
      <AccountCalendarLayout tableName="picture">Hello!</AccountCalendarLayout>
    </>
  );
}

Pictures.getLayout = getAccountLayout;
