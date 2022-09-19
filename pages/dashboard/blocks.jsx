import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "../../context/user-context";
import { useClient } from "../../context/client-context";
import { getDashboardLayout } from "../../components/layouts/DashboardLayout";
import Table from "../../components/Table";
import MyLink from "../../components/MyLink";
import DeleteBlockModal from "../../components/dashboard/modal/DeleteBlockModal";
import BlockModal from "../../components/dashboard/modal/BlockModal";

const filterTypes = [];

const orderTypes = [
  {
    label: "Date Created",
    query: "date-created",
    value: ["created_at", { ascending: false }],
    current: true,
  },
  {
    label: "Name",
    query: "name",
    value: ["name", { ascending: true }],
    current: false,
  },
  {
    label: "Number of Weeks",
    query: "number-of-weeks",
    value: ["number_of_weeks", { ascending: true }],
    current: false,
  },
];

export default function Blocks() {
  const router = useRouter();

  const { isAdmin, user } = useUser();

  const {
    selectedClientId,
    selectedClient,
    setSelectedDate,
    amITheClient,
    setSelectedBlock,
  } = useClient();

  const [baseFilter, setBaseFilter] = useState();
  useEffect(() => {
    if (!selectedClientId) {
      return;
    }

    const newBaseFilter = {
      user: false && isAdmin ? selectedClientId : user.id,
    };

    setBaseFilter(newBaseFilter);
  }, [selectedClientId, user]);

  return (
    <>
      <Table
        baseFilter={baseFilter}
        filterTypes={filterTypes}
        orderTypes={orderTypes}
        includeClientSelect={false && isAdmin}
        tableName="block"
        resultName="block"
        //createTitle="Add Block"
        selectString="*"
        title="Blocks"
        subtitle={`View ${
          false && isAdmin && selectedClient
            ? `${selectedClient.client_email}'s`
            : "your"
        } blocks`}
        CreateResultModal={BlockModal}
        DeleteResultModal={DeleteBlockModal}
        EditResultModal={BlockModal}
        resultMap={(result) => [
          false &&
            !amITheClient && {
              title: "created by",
              value: result.user_email,
            },
          {
            title: "name",
            value: result.name,
          },
          result.description?.length > 0 && {
            title: "description",
            value: result.description,
          },
          {
            title: "number of weeks",
            value: result.number_of_weeks,
          },
          {
            title: "date created",
            value: new Date(result.created_at).toLocaleString(),
          },
          {
            jsx: (
              <MyLink
                onClick={() => {
                  setSelectedBlock(result);
                }}
                href={`/dashboard/diary?block=${result.id}`}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
              >
                View<span className="sr-only"> block</span>
              </MyLink>
            ),
          },
        ]}
      ></Table>
    </>
  );
}

Blocks.getLayout = getDashboardLayout;
