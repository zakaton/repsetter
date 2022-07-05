import { useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "../../context/user-context";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import DeleteUserModal from "../../components/account/modal/DeleteUserModal";
import Table from "../../components/Table";

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
  const { isAdmin } = useUser();

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
          filterTypes={filterTypes}
          orderTypes={orderTypes}
          tableName="profile"
          resultName="user"
          title="All Users"
          subtitle="View all Users"
          DeleteResultModal={DeleteUserModal}
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
          ]}
        ></Table>
      </>
    )
  );
}

AllUsers.getLayout = getAccountLayout;
