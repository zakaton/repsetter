import { useState, useEffect } from "react";
import Head from "next/head";
import { supabase } from "../utils/supabase";
import { useUser } from "../context/user-context";
import Notification from "./Notification";
import Filters from "./Filters";
import Pagination from "./Pagination";
import { useClient } from "../context/client-context";
import ClientsSelect from "./dashboard/ClientsSelect";

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
  EditResultModal,
  editTitle,
  HeaderButton,
  baseFilter,
  resultsListener,
  filterChildren,
  includeClientSelect,
  clearFiltersListener,
  modalListener,
  className,
  refreshResults,
  setRefreshResults,
  clearNotifications,
  setClearNotifications,
  showFilters = true,
}) {
  const { isLoading, user } = useUser();
  const { selectedClient } = useClient();

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
    if (isGettingNumberOfResults) {
      return;
    }
    setIsGettingNumberOfResults(true);
    console.log("getting number of results...", {
      ...(baseFilter || {}),
      ...filters,
    });

    let query = supabase
      .from(tableName)
      .select(selectString, { count: "exact", head: true })
      .match({ ...(baseFilter || {}), ...filters });
    for (let _column in containsFilters) {
      const value = containsFilters[_column];
      if (value?.length > 0) {
        const [column, filterOperator] = _column.split("?");
        console.log("filterOperator", filterOperator, value);
        if (filterOperator) {
          query = query.filter(column, filterOperator, `(${value})`);
        } else {
          query = query.contains(column, value);
        }
      }
    }
    const { count: numberOfResults } = await query;
    console.log("number of results", numberOfResults);
    setPageIndex(0);
    setNumberOfResults(numberOfResults);
    setIsGettingNumberOfResults(false);
  };
  useEffect(() => {
    if (baseFilter && numberOfResults === null) {
      console.log("initial getNumberOfResults");
      getNumberOfResults();
    }
  }, [baseFilter]);

  useEffect(() => {
    if (numberOfResults !== null) {
      console.log("secondary getNumberOfResults");
      getNumberOfResults();
    }
  }, [filters, containsFilters, order, baseFilter]);

  const getResults = async (refresh) => {
    if (pageIndex !== previousPageIndex || refresh) {
      setIsGettingResults(true);
      console.log(`fetching ${tableName}!`, pageIndex);
      console.log("Filters", filters, baseFilter);
      let query = supabase
        .from(tableName)
        .select(selectString)
        .match({ ...(baseFilter || {}), ...filters });
      for (let _column in containsFilters) {
        const value = containsFilters[_column];
        if (value?.length > 0) {
          const [column, filterOperator] = _column.split("?");
          console.log("filterOperator", filterOperator, value);
          if (filterOperator) {
            query = query.filter(column, filterOperator, `(${value})`);
          } else {
            query = query.contains(column, value);
          }
        }
      }
      if (Array.isArray(order[0])) {
        order.forEach((_order) => {
          query = query.order(..._order);
        });
      } else {
        query = query.order(...order);
      }
      query = query
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
    if (refreshResults) {
      getNumberOfResults();
      setRefreshResults(false);
    }
  }, [refreshResults]);

  useEffect(() => {
    if (results && !isGettingResults) {
      console.log(`update ${tableName}!`);
      getResults(true);
    }
  }, [filters, containsFilters, order, baseFilter]);

  useEffect(() => {
    if (resultsListener) {
      console.log("calling results listener");
      resultsListener(results);
    }
  }, [results]);

  useEffect(() => {
    if (!isLoading && user && numberOfResults !== null) {
      getResults(true);
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

  const [selectedResult, setSelectedResult] = useState(null);

  const [showDeleteResultModal, setShowDeleteResultModal] = useState(false);
  const [deleteResultStatus, setDeleteResultStatus] = useState();
  const [showDeleteResultNotification, setShowDeleteResultNotification] =
    useState(false);

  const [showEditResultModal, setShowEditResultModal] = useState(false);
  const [editResultStatus, setEditResultStatus] = useState();
  const [showEditResultNotification, setShowEditResultNotification] =
    useState(false);

  const [showCreateResultModal, setShowCreateResultModal] = useState(false);
  const [createResultStatus, setCreateResultStatus] = useState();
  const [showCreateResultNotification, setShowCreateResultNotification] =
    useState(false);

  const removeNotifications = () => {
    setShowDeleteResultNotification(false);
    setShowEditResultNotification(false);
  };
  useEffect(() => {
    removeNotifications();
  }, []);

  useEffect(() => {
    if (showDeleteResultModal || showCreateResultModal || showEditResultModal) {
      removeNotifications();
    }
  }, [showDeleteResultModal, showCreateResultModal, showEditResultModal]);

  useEffect(() => {
    if (modalListener) {
      const areEitherModalOpen =
        showDeleteResultModal || showCreateResultModal || showEditResultModal;
      modalListener(areEitherModalOpen);
    }
  }, [showDeleteResultModal, showCreateResultModal, showEditResultModal]);

  useEffect(() => {
    if (clearNotifications) {
      setShowCreateResultNotification(false);
      setShowDeleteResultNotification(false);
      setShowEditResultNotification(false);
      setClearNotifications(false);
    }
  }, [clearNotifications]);

  useEffect(() => {
    if (deleteResultStatus?.type === "succeeded") {
      getNumberOfResults();
    }
  }, [deleteResultStatus]);
  useEffect(() => {
    if (editResultStatus?.type === "succeeded") {
      getResults(true);
    }
  }, [editResultStatus]);
  useEffect(() => {
    if (createResultStatus?.type === "succeeded") {
      getNumberOfResults();
    }
  }, [createResultStatus]);

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

      {EditResultModal && (
        <EditResultModal
          open={showEditResultModal}
          setOpen={setShowEditResultModal}
          selectedResult={selectedResult}
          setResultStatus={setEditResultStatus}
          setShowResultNotification={setShowEditResultNotification}
        />
      )}
      <Notification
        open={showEditResultNotification}
        setOpen={setShowEditResultNotification}
        status={editResultStatus}
      />

      <div className="bg-white px-4 pt-4 sm:px-6">
        <div className="flex items-center pb-4">
          <div className="flex-auto lg:col-span-8 lg:col-start-1 lg:row-start-1">
            <h3 className="inline text-lg font-medium leading-6 text-gray-900">
              {title}
            </h3>
            {includeClientSelect && (
              <ClientsSelect
                {...(typeof includeClientSelect == "object"
                  ? includeClientSelect
                  : {})}
              />
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

        {showFilters && (
          <Filters
            filters={filters}
            setFilters={setFilters}
            containsFilters={containsFilters}
            setContainsFilters={setContainsFilters}
            order={order}
            setOrder={setOrder}
            filterTypes={filterTypes}
            orderTypes={orderTypes}
            clearFiltersListener={clearFiltersListener}
          >
            {filterChildren}
          </Filters>
        )}

        {results?.length > 0 &&
          // eslint-disable-next-line no-shadow
          results.map((result, index) => {
            const resultContent = resultMap(result, index)
              .filter(Boolean)
              .map(({ title, value, jsx }, index) => (
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
              ));
            return (
              <div
                key={result.id}
                className="border-t border-gray-200 px-4 py-5 sm:px-6"
              >
                <dl
                  className={
                    className ||
                    "grid grid-cols-1 gap-x-4 gap-y-6 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                  }
                >
                  {resultContent}
                  {EditResultModal && (
                    <div className="sm:col-span-1">
                      <button
                        onClick={() => {
                          setSelectedResult(result);
                          setShowEditResultModal(true);
                        }}
                        type="button"
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        {editTitle || "Edit"}
                        <span className="sr-only"> {resultName}</span>
                      </button>
                    </div>
                  )}
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
