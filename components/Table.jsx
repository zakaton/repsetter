import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabase";
import { useUser } from "../context/user-context";
import Notification from "./Notification";
import Filters from "./Filters";
import Pagination from "./Pagination";
import { useClient } from "../context/client-context";

const capitalizeFirstLetter = (string) =>
  string[0].toUpperCase() + string.slice(1).toLowerCase();

export default function Table({
  selectString = "*",
  filterTypes,
  orderTypes,
  numberOfResultsPerPage = 4,
  tableName,
  resultName,
  resultNamePlural,
  title,
  subtitle,
  createTitle = "Add",
  CreateResultModal,
  DeleteResultModal,
  resultMap,
  deleteTitle,
  HeaderButton,
  baseFilter = {},
  resultsListener,
  filterChildren,
  includeClientSelect,
}) {
  const router = useRouter();
  const { isLoading, user } = useUser();
  const { getClients, clients, selectedClient, setSelectedClient } =
    useClient();

  useEffect(() => {
    if (!clients) {
      getClients();
    }
  }, [clients]);

  resultName = resultName || tableName;
  resultNamePlural = resultNamePlural || resultName + "s";

  const ResultName = capitalizeFirstLetter(resultName);
  title = title || ResultName;

  const [isGettingResults, setIsGettingResults] = useState(true);
  const [results, setResults] = useState(null);
  const [filters, setFilters] = useState({});
  const [containsFilters, setContainsFilters] = useState({});
  const [order, setOrder] = useState(orderTypes[0].value);

  const [numberOfResults, setNumberOfResults] = useState(null);
  const [isGettingNumberOfResults, setIsGettingNumberOfResults] =
    useState(false);

  const [pageIndex, setPageIndex] = useState(0);
  const [previousPageIndex, setPreviousPageIndex] = useState(-1);
  const getNumberOfResults = async () => {
    setIsGettingNumberOfResults(true);
    let query = supabase
      .from(tableName)
      .select(selectString, { count: "exact", head: true })
      .match({ ...baseFilter, ...filters });
    for (let column in containsFilters) {
      query = query.contains(column, containsFilters[column]);
    }
    const { count: numberOfResults } = await query;
    setPageIndex(0);
    setNumberOfResults(numberOfResults);
    setIsGettingNumberOfResults(false);
  };
  useEffect(() => {
    if (numberOfResults !== null && !isGettingNumberOfResults) {
      console.log("update number of results");
      getNumberOfResults();
    }
  }, [filters, containsFilters, order]);
  useEffect(() => {
    if (!isLoading && user && numberOfResults === null) {
      getNumberOfResults();
    }
  }, [isLoading, user]);

  const getResults = async (refresh) => {
    if (pageIndex !== previousPageIndex || refresh) {
      setIsGettingResults(true);
      console.log(`fetching ${tableName}!`, pageIndex);
      console.log("Filters", filters, baseFilter);
      let query = supabase
        .from(tableName)
        .select(selectString)
        .match({ ...baseFilter, ...filters });
      for (let column in containsFilters) {
        query = query.contains(column, containsFilters[column]);
      }
      query = query
        .order(...order)
        .limit(numberOfResultsPerPage)
        .range(
          pageIndex * numberOfResultsPerPage,
          (pageIndex + 1) * numberOfResultsPerPage - 1
        );
      const { data: results } = await query;
      console.log(`setting ${tableName}`, results);
      setResults(results);
      setIsGettingResults(false);
      setPreviousPageIndex(pageIndex);
    }
  };

  useEffect(() => {
    if (results && !isGettingResults) {
      console.log(`update ${tableName}!`);
      getResults(true);
    }
  }, [filters, containsFilters, order]);

  useEffect(() => {
    if (resultsListener) {
      resultsListener(results);
    }
  }, [results]);

  useEffect(() => {
    if (!isLoading && user && numberOfResults !== null) {
      getResults();
    }
  }, [isLoading, numberOfResults]);

  useEffect(() => {
    if (results) {
      getResults();
    }
  }, [pageIndex]);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (results) {
      console.log(`subscribing to ${tableName} updates`);
      const subscription = supabase
        .from(`profile`)
        .on("INSERT", (payload) => {
          console.log(`new ${tableName}`, payload);
          getResults(true);
          getNumberOfResults();
        })
        .on("UPDATE", (payload) => {
          console.log(`updated ${tableName}`, payload);
          getResults(true);
        })
        .on("DELETE", (payload) => {
          console.log(`deleted ${tableName}`, payload);
          const deletedResult = payload.old;
          // eslint-disable-next-line no-shadow
          setResults(
            results.filter((result) => result?.id !== deletedResult.id)
          );
          getNumberOfResults();
        })
        .subscribe();
      return () => {
        console.log(`unsubscribing to ${tableName} updates`);
        supabase.removeSubscription(subscription);
      };
    }
  }, [results]);

  const [showDeleteResultModal, setShowDeleteResultModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [deleteResultStatus, setDeleteResultStatus] = useState();
  const [showDeleteResultNotification, setShowDeleteResultNotification] =
    useState(false);

  const [showCreateResultModal, setShowCreateResultModal] = useState(false);
  const [createResultStatus, setCreateResultStatus] = useState();
  const [showCreateResultNotification, setShowCreateResultNotification] =
    useState(false);

  const removeNotifications = () => {
    setShowDeleteResultNotification(false);
  };
  useEffect(() => {
    removeNotifications();
  }, []);

  useEffect(() => {
    if (showDeleteResultModal) {
      removeNotifications();
    }
  }, [showDeleteResultModal]);

  const showPrevious = async () => {
    console.log("showPrevious");
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    }
  };
  const showNext = async () => {
    console.log("showNext");
    if ((pageIndex + 1) * numberOfResultsPerPage < numberOfResults) {
      setPageIndex(pageIndex + 1);
    }
  };

  useEffect(() => {
    const query = {};
    filterTypes.forEach((filterType) => {
      delete router.query[filterType.query];
    });
    Object.keys(filters).forEach((column) => {
      // eslint-disable-next-line no-shadow
      const filter = filterTypes.find((filter) => filter.column === column);
      if (filter) {
        query[filter.query] = filters[column];
      }
    });

    Object.keys(containsFilters).forEach((column) => {
      const filter = filterTypes.find((filter) => filter.column === column);
      if (filter) {
        const values = containsFilters[column] || [];
        if (values.length) {
          query[filter.query] = values.join(",");
        }
      }
    });

    const sortOption = orderTypes.find(
      // eslint-disable-next-line no-shadow
      (sortOption) => sortOption.value === order
    );
    if (sortOption) {
      query["sort-by"] = sortOption.query;
    }

    console.log("final query", query);
    router.replace({ query: { ...router.query, ...query } }, undefined, {
      shallow: true,
    });
  }, [filters, containsFilters, order]);

  const clearFilters = () => {
    if (Object.keys(filters).length > 0) {
      setFilters({});
    }
    if (Object.keys(containsFilters).length > 0) {
      setContainsFilters({});
    }
  };

  return (
    <>
      <Head>
        <title>{title} - Repsetter</title>
      </Head>
      {CreateResultModal && (
        <CreateResultModal
          open={showCreateResultModal}
          setOpen={setShowCreateResultModal}
          setCreateResultStatus={setCreateResultStatus}
          setShowCreateResultNotification={setShowCreateResultNotification}
        />
      )}
      <Notification
        open={showCreateResultNotification}
        setOpen={setShowCreateResultNotification}
        status={createResultStatus}
      />
      {DeleteResultModal && (
        <DeleteResultModal
          open={showDeleteResultModal}
          setOpen={setShowDeleteResultModal}
          selectedResult={selectedResult}
          setDeleteResultStatus={setDeleteResultStatus}
          setShowDeleteResultNotification={setShowDeleteResultNotification}
        />
      )}
      <Notification
        open={showDeleteResultNotification}
        setOpen={setShowDeleteResultNotification}
        status={deleteResultStatus}
      />
      <div className="bg-white px-4 pt-6 sm:px-6 sm:pt-6">
        <div className="flex items-center pb-4">
          <div className="lg:col-span-8 lg:col-start-1 lg:row-start-1">
            <h3 className="inline text-lg font-medium leading-6 text-gray-900">
              {title}
            </h3>
            {clients?.length > 0 && (
              <div className="w-50 ml-3 inline-block">
                <select
                  id="clientEmail"
                  className="mt-1 w-full rounded-md border-gray-300 py-1 pl-2 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  value={selectedClient?.client_email || user.email}
                  onInput={(e) => {
                    const option = e.target.selectedOptions[0];
                    setSelectedClient(
                      e.target.value === user.email
                        ? null
                        : clients.find(
                            (client) => client.client_email === e.target.value
                          )
                    );
                  }}
                >
                  <option value={user.email}>Me</option>
                  {clients?.map((client) => (
                    <option
                      key={client.client_email}
                      value={client.client_email}
                    >
                      {client.client_email}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <p className="mt-2 text-sm text-gray-500">
              {subtitle ||
                `View and edit ${
                  selectedClient?.client_email
                    ? selectedClient?.client_email + "'s"
                    : "your"
                } ${resultNamePlural}`}
            </p>
          </div>
          <div className="mt-0 flex-none">
            {CreateResultModal && (
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                onClick={() => {
                  setShowCreateResultModal(true);
                }}
              >
                {createTitle}
              </button>
            )}
            {HeaderButton}
          </div>
        </div>

        <Filters
          filters={filters}
          setFilters={setFilters}
          containsFilters={containsFilters}
          setContainsFilters={setContainsFilters}
          order={order}
          setOrder={setOrder}
          filterTypes={filterTypes}
          orderTypes={orderTypes}
          clearFilters={clearFilters}
        >
          {filterChildren}
        </Filters>

        {results?.length > 0 &&
          // eslint-disable-next-line no-shadow
          results.map((result) => {
            const resultContent = resultMap(result).map(
              ({ title, value, jsx }, index) => (
                <div key={index} className="sm:col-span-1">
                  {jsx || (
                    <>
                      <dt className="text-sm font-medium text-gray-500">
                        {title}
                      </dt>
                      <dd className="mt-1 break-words text-sm text-gray-900">
                        {value}
                      </dd>
                    </>
                  )}
                </div>
              )
            );
            return (
              <div
                key={result.id}
                className="border-t border-gray-200 px-4 py-5 sm:px-6"
              >
                <dl
                  className={
                    "grid grid-cols-1 gap-x-4 gap-y-6 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                  }
                >
                  {resultContent}
                  {DeleteResultModal && (
                    <div className="sm:col-span-1">
                      <button
                        onClick={() => {
                          setSelectedResult(result);
                          setShowDeleteResultModal(true);
                        }}
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-1.5 px-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        {deleteTitle || "Delete"}
                        <span className="sr-only"> {resultName}</span>
                      </button>
                    </div>
                  )}
                </dl>
              </div>
            );
          })}

        {isGettingResults && (
          <div className="border-t border-gray-200">
            <div className="divide-y divide-gray-200">
              <div className="py-4 text-center sm:py-5">
                <div className="text-sm font-medium text-gray-500">
                  Loading {resultNamePlural}...
                </div>
              </div>
            </div>
          </div>
        )}

        {results?.length === 0 && !isGettingResults && (
          <div className="border-t border-gray-200">
            <div className="divide-y divide-gray-200">
              <div className="py-4 text-center sm:py-5">
                <div className="text-sm font-medium text-gray-500">
                  No {resultNamePlural} found.
                </div>
              </div>
            </div>
          </div>
        )}
        {results && results.length > 0 && (
          <Pagination
            name={resultName}
            numberOfResults={numberOfResults}
            numberOfResultsPerPage={numberOfResultsPerPage}
            pageIndex={pageIndex}
            setPageIndex={setPageIndex}
            showPrevious={showPrevious}
            showNext={showNext}
          />
        )}
      </div>
    </>
  );
}
