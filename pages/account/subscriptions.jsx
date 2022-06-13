import { getAccountLayout } from "../../components/layouts/AccountLayout";
import DeleteSubscriptionModal from "../../components/account/modal/DeleteSubscriptionModal";
import Table from "../../components/Table";
import { formatDollars } from "../../utils/subscription-utils";
import MyLink from "../../components/MyLink";
import { useUser } from "../../context/user-context";

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
  const { stripeLinks } = useUser();

  return (
    <>
      <Table
        HeaderButton={
          <MyLink
            href={stripeLinks.customerPortal}
            target="_blank"
            rel="noreferrer"
          >
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Customer Portal
            </button>
          </MyLink>
        }
        selectString="*, coach(*), client(*)"
        filterTypes={filterTypes}
        orderTypes={orderTypes}
        title="Subscriptions"
        tableName="subscription"
        DeleteResultModal={DeleteSubscriptionModal}
        resultMap={(result) =>
          [
            {
              title: "coach",
              value: result.coach_email,
            },
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

Subscriptions.getLayout = getAccountLayout;
