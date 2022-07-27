import { getAccountLayout } from "../../components/layouts/AccountLayout";
import DeleteSubscriptionModal from "../../components/account/modal/DeleteSubscriptionModal";
import Table from "../../components/Table";
import CreateSubscriptionModal from "../../components/account/modal/CreateSubscriptionModal";
import { useUser } from "../../context/user-context";
import { formatDollars } from "../../utils/subscription-utils";
import MyLink from "../../components/MyLink";
import { useEffect, useState } from "react";

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
    label: "Client Email",
    query: "client-email",
    value: ["client_email", { ascending: true }],
    current: false,
  },
  {
    label: "Price",
    query: "price",
    value: ["price", { ascending: false }],
    current: false,
  },
];

export default function MyClients() {
  const { user } = useUser();

  const [baseFilter, setBaseFilter] = useState({});
  useEffect(() => {
    if (user) {
      setBaseFilter({ client: user.id });
    }
  }, [user]);

  return (
    <>
      <Table
        filterTypes={filterTypes}
        orderTypes={orderTypes}
        tableName="subscription"
        baseFilter={baseFilter}
        resultName="client"
        title="My Clients"
        createTitle="Add Client"
        CreateResultModal={CreateSubscriptionModal}
        DeleteResultModal={DeleteSubscriptionModal}
        resultMap={(result) =>
          [
            {
              title: "created at",
              value: new Date(result.created_at).toLocaleString(),
            },
            {
              title: "price",
              value: `${formatDollars(result.price, false)}/month`,
            },
            {
              title: "redeemed?",
              value: result.redeemed ? "yes" : "no",
            },
            result.client && {
              title: "client",
              value: result.client_email,
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
            !result.redeemed && {
              jsx: (
                <MyLink
                  href={`/subscription/${result.id}`}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  View<span className="sr-only"> subscription</span>
                </MyLink>
              ),
            },
          ].filter(Boolean)
        }
      ></Table>
    </>
  );
}

MyClients.getLayout = getAccountLayout;
