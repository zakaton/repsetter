import { useEffect, useState } from "react";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import { useClient } from "../../context/client-context";
import Head from "next/head";
import ClientsSelect from "../../components/account/ClientsSelect";
import Pagination from "../../components/Pagination";
import { supabase } from "../../utils/supabase";
import MyLink from "../../components/MyLink";

const numberOfPicturesPerPage = 10;

const capitalizeFirstLetter = (string) =>
  string[0].toUpperCase() + string.slice(1).toLowerCase();

export default function Photos() {
  const { selectedClientId, selectedClient, setSelectedDate } = useClient();

  const [pageIndex, setPageIndex] = useState(0);

  const [picturesList, setPicturesList] = useState();
  const [isGettingPicturesList, setIsGettingPicturesList] = useState(false);
  const getPicturesList = async () => {
    if (isGettingPicturesList) {
      return;
    }
    setIsGettingPicturesList(true);

    const { data: picturesList, error: listPicturesError } =
      await supabase.storage.from("picture").list(selectedClientId, {
        sortBy: { column: "name", order: "desc" },
      });

    if (listPicturesError) {
      console.error(listPicturesError);
    } else {
      console.log("picturesList", picturesList);
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

    setIsGettingPictures(true);
    const signedUrls = picturesList
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
        const dateString = picture.path.split("/")[1].split(".")[0];
        const date = stringToDate(dateString);
        Object.assign(picture, { date, dateString });
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

  const [weights, setWeights] = useState();
  const [isGettingWeights, setIsGettingWeights] = useState(false);
  const getWeights = async () => {
    if (isGettingWeights) {
      return;
    }
    setIsGettingWeights(true);

    console.log(pictures);

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
        <ul
          role="list"
          className="grid grid-cols-2 gap-x-4 gap-y-8 pb-4 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8"
        >
          {pictures?.map((picture) => {
            const weight = weights?.find(
              (weight) => weight.date === picture.dateString
            );
            return (
              <li key={picture.path} className="relative">
                <div className="group block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                  <MyLink
                    onClick={() => {
                      setSelectedDate(picture.date);
                    }}
                    href={`/account/diary?date=${picture.date.toDateString()}${
                      selectedClient
                        ? `&client=${selectedClient.client_email}`
                        : ""
                    }`}
                  >
                    <img
                      src={picture.signedURL}
                      alt={`progress picture for ${picture.date.toDateString()}`}
                      className="pointer-events-none focus:outline-none group-hover:opacity-75"
                    />
                  </MyLink>
                </div>
                <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">
                  {picture.date.toDateString()}
                </p>
                {weight && (
                  <p className="pointer-events-none block text-sm font-medium text-gray-500">
                    {weight.weight}{" "}
                    {weight.is_weight_in_kilograms ? "kg" : "lbs"}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
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
      </div>
    </>
  );
}

Photos.getLayout = getAccountLayout;
