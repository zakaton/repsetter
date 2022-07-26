import { Fragment, useEffect, useState } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon, AdjustmentsIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Filters({
  filters,
  queryFilters,
  setFilters,
  containsFilters,
  setContainsFilters,
  order,
  setOrder,
  showSort = true,
  orderTypes,
  filterTypes,
  children,
  clearFiltersListener,
}) {
  const router = useRouter();

  const checkQuery = () => {
    const { "sort-by": sortBy } = router.query;

    console.log("query", router.query);

    const newFilters = {};
    filterTypes
      .filter((filterType) => !filterType.checkboxes)
      .forEach((filterType) => {
        console.log("checking", filterType.query);
        if (filterType.query in router.query) {
          if (filterType.options) {
            newFilters[filterType.column] = router.query[filterType.query];
          } else if (filterType.radios) {
            newFilters[filterType.column] = router.query[filterType.query];
            if (newFilters[filterType.column] === "true") {
              newFilters[filterType.column] = true;
            } else if (newFilters[filterType.column] === "false") {
              newFilters[filterType.column] = false;
            }
          }
        }
      });
    console.log("newFilters", newFilters);
    if (Object.keys(newFilters).length > 0) {
      setFilters(newFilters);
    }

    const newContainsFilters = {};
    filterTypes
      .filter((filterType) => filterType.checkboxes)
      .forEach((filterType) => {
        console.log("checking", filterType.query);
        if (filterType.query in router.query) {
          newContainsFilters[filterType.column] =
            router.query[filterType.query].split(",");
        }
      });
    if (Object.keys(newContainsFilters).length > 0) {
      setContainsFilters(newContainsFilters);
    }

    if (sortBy) {
      const orderType = orderTypes.find(
        // eslint-disable-next-line no-shadow
        (orderType) => orderType.query === sortBy
      );
      if (orderType) {
        setOrder(orderType.value);
      }
    }
  };
  useEffect(() => {
    checkQuery();
  }, []);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

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

    if (queryFilters) {
      Object.keys(queryFilters).forEach((key) => {
        const value = queryFilters[key];
        if (value) {
          query[key] = queryFilters[key];
        } else {
          delete query[key];
        }
      });
    }

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
  }, [filters, containsFilters, order, router.isReady]);

  const [numberOfActiveFilters, setNumberOfActiveFilters] = useState(0);
  useEffect(() => {
    setNumberOfActiveFilters(
      Object.keys(filters).reduce(
        (count, key) =>
          count +
          filterTypes.find((filterType) => filterType.column === key)?.options
            ? 0
            : 1,
        0
      ) +
        Object.keys(containsFilters).reduce(
          (count, key) => count + containsFilters[key].length,
          0
        )
    );
  }, [filters, containsFilters]);

  const clearFilters = () => {
    if (Object.keys(filters).length > 0) {
      setFilters({});
    }
    if (Object.keys(containsFilters).length > 0) {
      setContainsFilters({});
    }
    clearFiltersListener?.();
  };

  return (
    <>
      {/* Filters */}
      <Disclosure
        as="section"
        aria-labelledby="filter-heading"
        className="relative z-10 grid items-center border-t border-gray-200"
      >
        <h2 id="filter-heading" className="sr-only">
          Filters
        </h2>
        <div className="relative col-start-1 row-start-1 py-4">
          <div className="mx-auto flex max-w-7xl space-x-6 divide-x divide-gray-200 px-4 text-sm sm:px-6 lg:px-8">
            <div>
              <Disclosure.Button className="group flex items-center font-medium text-gray-700">
                <AdjustmentsIcon
                  className="mr-2 h-5 w-5 flex-none text-gray-400 group-hover:text-gray-500"
                  aria-hidden="true"
                />
                {numberOfActiveFilters || ""} Filter
                {numberOfActiveFilters === 1 ? "" : "s"}
              </Disclosure.Button>
            </div>
            <div className="pl-6">
              <button
                onClick={clearFilters}
                type="button"
                className="text-gray-500 hover:text-gray-900"
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>
        <Disclosure.Panel className="border-t border-gray-200 bg-gray-50 py-10">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-4 px-4 text-sm sm:px-6 md:gap-x-6 lg:px-8">
            <div className="grid auto-rows-min grid-cols-1 gap-y-10 xs:grid-cols-2 sm:grid-cols-3  sm:gap-x-4 md:grid-cols-4 md:gap-x-6 lg:grid-cols-5">
              {filterTypes
                .filter((filterType) => !filterType.hidden)
                .map((filterType) => {
                  const fieldsetId = filterType.name;
                  return (
                    <fieldset id={fieldsetId} key={fieldsetId}>
                      <legend className="block font-medium">
                        {filterType.name}
                      </legend>
                      {(filterType.radios || filterType.checkboxes) && (
                        <div className="space-y-6 pt-6 sm:space-y-4 sm:pt-4">
                          {filterType.radios?.map((radio, radioIndex) => {
                            const id = `${filterType.column}-${radioIndex}`;
                            const checked =
                              filterType.column in filters
                                ? filters[filterType.column] === radio.value
                                : Boolean(radio.defaultChecked);
                            return (
                              <div
                                key={id}
                                className="flex items-center text-base sm:text-sm"
                              >
                                <input
                                  id={id}
                                  name={fieldsetId}
                                  type="radio"
                                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                  checked={checked}
                                  onChange={() => {
                                    const newFilters = { ...filters };
                                    if (radio.value === null) {
                                      delete newFilters[filterType.column];
                                    } else {
                                      newFilters[filterType.column] =
                                        radio.value;
                                    }
                                    setFilters(newFilters);
                                  }}
                                />
                                <label
                                  htmlFor={id}
                                  className="ml-3 min-w-0 flex-1 text-gray-600"
                                >
                                  {radio.label}
                                </label>
                              </div>
                            );
                          })}
                          {filterType.checkboxes?.map(
                            (checkbox, checkboxIndex) => {
                              const id = `${filterType.name}-${filterType.column}-${checkboxIndex}`;
                              const checked = Boolean(
                                containsFilters[filterType.column]?.includes(
                                  checkbox.value
                                )
                              );
                              return (
                                <div
                                  key={id}
                                  className="flex items-center text-base sm:text-sm"
                                >
                                  <input
                                    id={id}
                                    name={fieldsetId}
                                    type="checkbox"
                                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={checked}
                                    onChange={(e) => {
                                      const newContainsFilters = {
                                        ...containsFilters,
                                      };
                                      let newValues =
                                        containsFilters[
                                          filterType.column
                                        ]?.slice() || [];

                                      if (e.target.checked) {
                                        newValues.push(checkbox.value);
                                      } else {
                                        newValues = newValues.filter(
                                          (value) => value !== checkbox.value
                                        );
                                      }
                                      newContainsFilters[filterType.column] =
                                        newValues;
                                      setContainsFilters(newContainsFilters);
                                    }}
                                  />
                                  <label
                                    htmlFor={id}
                                    className="ml-3 min-w-0 flex-1 text-gray-600"
                                  >
                                    {checkbox.label}
                                  </label>
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                      {filterType.options && (
                        <select
                          className="mt-1 block w-fit rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                          value={
                            filters[filterType.column] ||
                            filterType.defaultValue ||
                            ""
                          }
                          onInput={(e) => {
                            const newFilters = { ...filters };
                            if (e.target.value === "null") {
                              delete newFilters[filterType.column];
                            } else {
                              newFilters[filterType.column] = e.target.value;
                            }
                            setFilters(newFilters);
                          }}
                        >
                          {filterType.options?.map((option, index) => {
                            const id = `${filterType.name}-${filterType.column}-${index}`;
                            return (
                              <option
                                key={id}
                                value={
                                  option.value === null ? "null" : option.value
                                }
                                className="flex items-center text-base sm:text-sm"
                              >
                                {option.label}
                              </option>
                            );
                          })}
                        </select>
                      )}
                    </fieldset>
                  );
                })}
              {children}
            </div>
          </div>
        </Disclosure.Panel>
        <div className="col-start-1 row-start-1 py-4">
          <div className="mx-auto flex max-w-7xl justify-end px-4 sm:px-6 lg:px-8">
            <Menu as="div" className="relative inline-block">
              {showSort && (
                <div className="flex">
                  <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                    Sort
                    <ChevronDownIcon
                      className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                  </Menu.Button>
                </div>
              )}

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-44 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    {orderTypes.map((orderType) => (
                      <Menu.Item key={orderType.label}>
                        {({ active }) => {
                          const isSelected = orderType.value === order;
                          return (
                            <button
                              onClick={() => {
                                setOrder(orderType.value);
                              }}
                              type="button"
                              className={classNames(
                                isSelected
                                  ? "font-medium text-gray-900"
                                  : "text-gray-500",
                                active ? "bg-gray-100" : "",
                                "block w-full px-4 py-2 text-left text-sm"
                              )}
                            >
                              {orderType.label}
                            </button>
                          );
                        }}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </Disclosure>
    </>
  );
}
