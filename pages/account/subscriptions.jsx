import { getAccountLayout } from "../../components/layouts/AccountLayout";
import DeleteSubscriptionModal from "../../components/account/modal/DeleteSubscriptionModal";
import Table from "../../components/Table";

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
    label: "Date Created",
    query: "date-created",
    value: ["created_at", { ascending: false }],
    current: false,
  },
  {
    label: "Date Redeemed",
    query: "date-redeemed",
    value: ["redeemed_at", { ascending: false }],
    current: false,
  },
  {
    label: "Price",
    query: "price",
    value: ["price", { ascending: false }],
    current: false,
  },
];

export default function Subscriptions() {
  return (
    <>
      <Table
        filterTypes={filterTypes}
        orderTypes={orderTypes}
        tableName="subscription"
        DeleteResultModal={DeleteSubscriptionModal}
        resultMap={(result) => [
          {
            title: "coach",
            value: result.coach,
          },
          {
            title: "client",
            value: result.client,
          },
          {
            title: "price",
            value: result.price,
          },
          {
            title: "created at",
            value: new Date(result.created_at).toLocaleString(),
          },
        ]}
      ></Table>
    </>
  );
}

Subscriptions.getLayout = getAccountLayout;
