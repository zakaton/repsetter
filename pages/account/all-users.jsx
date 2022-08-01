import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "../../context/user-context";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import DeleteUserModal from "../../components/account/modal/DeleteUserModal";
import Table from "../../components/Table";
import { useClient } from "../../context/client-context";
import { useCoachPictures } from "../../context/coach-picture-context";

const filterTypes = [
  {
    name: "Has Completed Onboarding?",
    query: "has-completed-onboarding",
    column: "has_completed_onboarding",
    radios: [
      { value: true, label: "yes", defaultChecked: false },
      { value: false, label: "no", defaultChecked: false },
      { value: null, label: "either", defaultChecked: true },
    ],
  },
  {
    name: "Can Coach?",
    query: "can-coach",
    column: "can_coach",
    radios: [
      { value: true, label: "yes", defaultChecked: false },
      { value: false, label: "no", defaultChecked: false },
      { value: null, label: "either", defaultChecked: true },
    ],
  },
];

const orderTypes = [
  {
    label: "Date Joined",
    query: "date-joined",
    value: ["created_at", { ascending: false }],
    current: false,
  },
  {
    label: "Email",
    query: "email",
    value: ["email", { ascending: true }],
    current: false,
  },
];

export default function AllUsers() {
  const router = useRouter();
  const { isAdmin, fetchWithAccessToken } = useUser();
  const { setInitialClientEmail } = useClient();

  const [baseFilter, setBaseFilter] = useState({});

  const { coachPictures, getCoachPicture } = useCoachPictures();
  const [users, setUsers] = useState();
  useEffect(() => {
    if (users) {
      users.forEach(({ id }) => getCoachPicture(id));
    }
  }, [users]);

  useEffect(() => {
    if (router.isReady && !isAdmin) {
      console.log("redirect to /account");
      router.replace("/account", undefined, {
        shallow: true,
      });
    }
  }, [router.isReady]);

  return (
    isAdmin && (
      <>
        <Table
          baseFilter={baseFilter}
          filterTypes={filterTypes}
          orderTypes={orderTypes}
          tableName="profile"
          resultName="user"
          title="All Users"
          subtitle="View all Users"
          DeleteResultModal={DeleteUserModal}
          resultsListener={setUsers}
          resultMap={(result) => [
            {
              title: "email",
              value: result.email,
            },
            {
              title: "completed onboarding?",
              value: result.has_completed_onboarding ? "yes" : "no",
            },
            {
              title: "can coach?",
              value: result.can_coach ? "yes" : "no",
            },
            {
              title: "joined",
              value: new Date(result.created_at).toLocaleString(),
            },
            {
              jsx: (
                <button
                  onClick={() => {
                    setInitialClientEmail(result.email);
                  }}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  View<span className="sr-only"> user</span>
                </button>
              ),
            },
            {
              jsx: (
                <button
                  onClick={async () => {
                    const response = await fetchWithAccessToken(
                      `/api/account/check-stripe?userId=${result.id}`
                    );
                    const json = await response.json();
                    console.log("check-stripe response", json);
                  }}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Update<span className="sr-only"> user</span>
                </button>
              ),
            },
            coachPictures?.[result.id]?.url && {
              jsx: (
                <img
                  alt="coach picture"
                  src={coachPictures[result.id].url}
                  width={100}
                  loading="lazy"
                  className="mb-1.5 rounded-lg focus:outline-none group-hover:opacity-75"
                />
              ),
            },
          ]}
        ></Table>
      </>
    )
  );
}

AllUsers.getLayout = getAccountLayout;
