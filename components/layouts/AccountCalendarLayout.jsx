import { getAccountLayout } from "./AccountLayout";

export default function AccountCalendarLayout({ children }) {
  return getAccountLayout(<>{children}</>);
}

export function getAccountCalendarLayout(page) {
  return <AccountCalendarLayout>{page}</AccountCalendarLayout>;
}
