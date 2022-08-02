import { getDashboardLayout } from "../../components/layouts/DashboardLayout";
import DeleteSubscriptionModal from "../../components/dashboard/modal/DeleteSubscriptionModal";
import Table from "../../components/Table";
import { useUser } from "../../context/user-context";
import { formatDollars } from "../../utils/subscription-utils";
import MyLink from "../../components/MyLink";
import { useCoachPictures } from "../../context/coach-picture-context";
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
  const { user, stripeLinks } = useUser();
  const { coachPictures, getCoachPicture } = useCoachPictures();

  const [baseFilter, setBaseFilter] = useState();
  useEffect(() => {
    if (user) {
      setBaseFilter({ client: user.id });
    }
  }, [user]);

  const [coaches, setCoaches] = useState();
  useEffect(() => {
    if (coaches) {
      coaches.forEach(({ coach }) => getCoachPicture(coach));
    }
  }, [coaches]);

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
              Manage Subscriptions
            </button>
          </MyLink>
        }
        filterTypes={filterTypes}
        orderTypes={orderTypes}
        tableName="subscription"
        baseFilter={baseFilter}
        resultName="coach"
        resultNamePlural="coaches"
        title="My Coaches"
        DeleteResultModal={DeleteSubscriptionModal}
        resultMap={(result) => {
          const coachPicture = coachPictures[result.coach]?.url;
          return [
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
            coachPicture && {
              jsx: (
                <img
                  alt="coach picture"
                  src={coachPicture}
                  className="max-h-[150px] max-w-[150px] rounded-lg sm:col-start-1"
                />
              ),
            },
          ].filter(Boolean);
        }}
        resultsListener={(results) => {
          console.log("resultsListener", results);
          setCoaches(results);
        }}
      ></Table>
    </>
  );
}

MyCoaches.getLayout = getDashboardLayout;
