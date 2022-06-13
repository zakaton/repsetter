import { getAccountLayout } from "../../components/layouts/AccountLayout";
import DeleteSubscriptionModal from "../../components/account/modal/DeleteSubscriptionModal";
import Table from "../../components/Table";
import { useUser } from "../../context/user-context";
import { formatDollars } from "../../utils/subscription-utils";
import MyLink from "../../components/MyLink";

const filterTypes = [
  {
    name: "Redeemed?",
    query: "redeemed",
    column: "redeemed",
    radios: [
      { value: true, label: "yes", defaultChecked: false },
      { value: false, label: "no", defaultChecked: false },
      { value: null, label: "either", defaultChecked: true },
    ],
  },
];

const orderTypes = [
  {
    label: "Date Redeemed",
    query: "date-redeemed",
    value: ["redeemed_at", { ascending: false }],
    current: false,
  },
  {
    label: "Coach Email",
    query: "coach-email",
    value: ["coach", { ascending: true }],
    current: false,
  },
  {
    label: "Price",
    query: "price",
    value: ["price", { ascending: false }],
    current: false,
  },
];

export default function MyCoaches() {
  const { user } = useUser();
  return (
    <>
      <Table
        filterTypes={filterTypes}
        orderTypes={orderTypes}
        tableName="subscription"
        baseFilter={{ client: user.id }}
        resultName="coach"
        resultNamePlural="coaches"
        title="My Coaches"
        DeleteResultModal={DeleteSubscriptionModal}
        resultMap={(result) =>
          [
            {
              title: "coach",
              value: result.coach_email,
            },
            {
              title: "price",
              value: `${formatDollars(result.price, false)}/month`,
            },
            result.redeemed && {
              title: "redeemed at",
              value: new Date(result.redeemed_at).toLocaleString(),
            },
            result.redeemed && {
              title: "active?",
              value: result.is_active ? "yes" : "no",
            },
            result.redeemed && {
              title: "cancelled?",
              value: result.is_cancelled ? "yes" : "no",
            },
          ].filter(Boolean)
        }
      ></Table>
    </>
  );
}

MyCoaches.getLayout = getAccountLayout;
