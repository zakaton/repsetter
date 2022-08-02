import { useEffect, useState } from "react";
import { getDashboardLayout } from "../../components/layouts/DashboardLayout";
import { useClient } from "../../context/client-context";
import Head from "next/head";
import ClientsSelect from "../../components/dashboard/ClientsSelect";
import Pagination from "../../components/Pagination";
import {
  supabase,
  stringToDate,
  generateUrlSuffix,
} from "../../utils/supabase";
import MyLink from "../../components/MyLink";
import Filters from "../../components/Filters";
import { pictureTypes } from "../../utils/picture-utils";

const orderTypes = [
  {
    label: "Date (Newest)",
    query: "date-newest",
    value: ["name", { ascending: false }],
    current: true,
  },
  {
    label: "Date (Oldest)",
    query: "date-oldest",
    value: ["name", { ascending: true }],
    current: false,
  },
];

const filterTypes = [
  {
    name: "Picture Type",
    query: "type",
    column: "type",
    requiresExercise: true,
    checkboxes: [
      {
        value: "front",
        label: "Front",
      },
      {
        value: "back",
        label: "Back",
      },
      {
        value: "side",
        label: "Side",
      },
    ],
  },
];

const numberOfPicturesPerPage = 10;

const capitalizeFirstLetter = (string) =>
  string[0].toUpperCase() + string.slice(1).toLowerCase();

export default function Photos() {
  const { selectedClientId, selectedClient, setSelectedDate, amITheClient } =
    useClient();

  const [filters, setFilters] = useState({});
  const [containsFilters, setContainsFilters] = useState({});
  const [order, setOrder] = useState(orderTypes[0].value);

  const [pageIndex, setPageIndex] = useState(0);

  const [picturesList, setPicturesList] = useState();
  const [isGettingPicturesList, setIsGettingPicturesList] = useState(false);
  const getPicturesList = async () => {
    if (isGettingPicturesList) {
      return;
    }
    setIsGettingPicturesList(true);

    console.log("getting pictures list");
    let { data: picturesList, error: listPicturesError } =
      await supabase.storage.from("picture").list(selectedClientId, {
        sortBy: {
          column: order[0],
          order: order[1].ascending ? "asc" : "desc",
        },
      });

    if (listPicturesError) {
      console.error(listPicturesError);
    } else {
      picturesList = picturesList.filter((item) => item.name?.endsWith(".jpg"));
      console.log("picturesList", picturesList);
      picturesList.forEach((picture) => {
        const [dateString, type] = picture.name.split(".")[0].split("_");
        Object.assign(picture, { type, dateString });
      });
      setPicturesList(picturesList);
    }

    setIsGettingPicturesList(false);
  };

  useEffect(() => {
    if (selectedClientId) {
      setPageIndex(0);
      getPicturesList();
    }
  }, [selectedClientId]);

  const [pictures, setPictures] = useState();
  const [isGettingPictures, setIsGettingPictures] = useState(false);
  const getPictures = async () => {
    if (isGettingPictures) {
      return;
    }

    const filteredPicturesList =
      containsFilters?.type?.length > 0
        ? picturesList.filter((picture) =>
            containsFilters.type.includes(picture.type)
          )
        : picturesList;

    if (filteredPicturesList?.length == 0) {
      setPictures([]);
      return;
    }
    setIsGettingPictures(true);
    const signedUrls = filteredPicturesList
      .slice(
        pageIndex * numberOfPicturesPerPage,
        (pageIndex + 1) * numberOfPicturesPerPage
      )
      .map(({ name }) => `${selectedClientId}/${name}`);
    const { data: pictures, error: getPicturesError } = await supabase.storage
      .from("picture")
      .createSignedUrls(signedUrls, 60);
    if (getPicturesError) {
      console.error(getPicturesError);
    } else {
      console.log("pictures", pictures);
      pictures.forEach((picture) => {
        const [userId, name] = picture.path.split("/");
        const [dateString, type] = name.split(".")[0].split("_");
        const date = stringToDate(dateString);
        const details = picturesList.find((details) => details.name === name);
        Object.assign(picture, {
          date,
          dateString,
          suffix: generateUrlSuffix(details),
          type,
        });
      });
      pictures.sort((a, b) => {
        if (a.date.getDateString() == b.date.getDateString()) {
          const aTypeIndex = pictureTypes.indexOf(a.type);
          const bTypeIndex = pictureTypes.indexOf(b.type);
          return aTypeIndex - bTypeIndex;
        } else {
          return a - b;
        }
      });
      setPictures(pictures);
    }
    setIsGettingPictures(false);
  };

  useEffect(() => {
    if (picturesList) {
      getPictures();
    }
  }, [picturesList, pageIndex]);

  useEffect(() => {
    if (picturesList) {
      getPicturesList();
    }
  }, [filters, containsFilters, order]);

  const [weights, setWeights] = useState();
  const [isGettingWeights, setIsGettingWeights] = useState(false);
  const getWeights = async () => {
    if (isGettingWeights) {
      return;
    }
    if (!pictures?.length > 0) {
      return;
    }
    setIsGettingWeights(true);

    console.log(
      pictures[0].date.toDateString(),
      pictures[pictures.length - 1].date.toDateString()
    );

    const { data: weights, error: getWeightsError } = await supabase
      .from("weight")
      .select("*")
      .match({ client: selectedClientId })
      .lte("date", pictures[0].date.toDateString())
      .gte("date", pictures[pictures.length - 1].date.toDateString())
      .order("time", { ascending: true });

    if (getWeightsError) {
      console.error(getWeightsError);
    } else {
      console.log("weights", weights);
      setWeights(weights);
    }

    setIsGettingWeights(false);
  };
  useEffect(() => {
    if (pictures) {
      getWeights();
    }
  }, [pictures]);

  const showPrevious = async () => {
    console.log("showPrevious");
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    }
  };
  const showNext = async () => {
    console.log("showNext");
    if ((pageIndex + 1) * numberOfPicturesPerPage < picturesList.length) {
      setPageIndex(pageIndex + 1);
    }
  };

  return (
    <>
      <Head>
        <title>Pictures - Repsetter</title>
      </Head>

      <div className="bg-white px-4 pt-4 sm:px-6">
        <div className="flex items-center pb-4">
          <div className="flex-auto lg:col-span-8 lg:col-start-1 lg:row-start-1">
            <h3 className="inline text-lg font-medium leading-6 text-gray-900">
              Pictures
            </h3>
            <ClientsSelect />
            <p className="mt-2 text-sm text-gray-500">
              {`View ${
                selectedClient?.client_email
                  ? selectedClient?.client_email + "'s"
                  : "your"
              } pictures`}
            </p>
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
        />
        {pictures?.length > 0 && (
          <ul
            role="list"
            className="grid grid-cols-1 gap-x-4 gap-y-4 border-t border-gray-200 pt-4 pb-4 xs:grid-cols-2 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:grid-cols-5 xl:gap-x-8"
          >
            {pictures?.map((picture) => {
              const weight = weights?.find(
                (weight) => weight.date === picture.dateString
              );
              return (
                <li key={picture.path} className="relative flex flex-col">
                  <p className="mt-2 block text-center text-sm font-medium text-gray-900">
                    <MyLink
                      onClick={() => {
                        setSelectedDate(picture.date);
                      }}
                      href={`/dashboard/diary?date=${picture.date.toDateString()}${
                        selectedClient
                          ? `&client=${selectedClient.client_email}`
                          : ""
                      }`}
                      className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-2 py-0.5 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {picture.date.toDateString()}
                    </MyLink>{" "}
                    ({capitalizeFirstLetter(picture.type)})
                  </p>
                  {weight && (
                    <p className="pointer-events-none block text-center text-sm font-medium text-gray-500">
                      {weight.weight}{" "}
                      {weight.is_weight_in_kilograms ? "kg" : "lbs"}
                    </p>
                  )}
                  <img
                    loading="lazy"
                    src={picture.signedURL + "&" + picture.suffix}
                    alt={`progress picture for ${picture.date.toDateString()}`}
                    className="mt-1 rounded-lg"
                  />
                </li>
              );
            })}
          </ul>
        )}
        {pictures && (
          <Pagination
            name={"picture"}
            numberOfResults={picturesList.length}
            numberOfResultsPerPage={numberOfPicturesPerPage}
            pageIndex={pageIndex}
            setPageIndex={setPageIndex}
            showPrevious={showPrevious}
            showNext={showNext}
          />
        )}
        {!isGettingPictures && pictures?.length === 0 && (
          <div className="border-t border-gray-200">
            <div className="divide-y divide-gray-200">
              <div className="py-4 text-center sm:py-5">
                <div className="text-sm font-medium text-gray-500">
                  No pictures found.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

Photos.getLayout = getDashboardLayout;
