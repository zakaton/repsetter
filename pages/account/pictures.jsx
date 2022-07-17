import { useEffect, useState } from "react";
import { useUser } from "../../context/user-context";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import { useClient } from "../../context/client-context";
import Head from "next/head";
import ClientsSelect from "../../components/account/ClientsSelect";
import Pagination from "../../components/Pagination";
import { supabase } from "../../utils/supabase";
import { stringToDate } from "../../utils/picture-utils";
import MyLink from "../../components/MyLink";

const numberOfPicturesPerPage = 20;

const files = [
  {
    title: "IMG_4985.HEIC",
    size: "3.9 MB",
    source:
      "https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80",
  },
];
while (files.length < 8) {
  files.push(files[0]);
}

export default function Photos() {
  const { user } = useUser();
  const { amITheClient, selectedClientId, selectedClient, setSelectedDate } =
    useClient();

  const [picturesList, setPicturesList] = useState();
  const getPicturesList = async () => {
    const userId = amITheClient ? user.id : selectedClientId;
    const { data: picturesList, error: listPicturesError } =
      await supabase.storage
        .from("picture")
        .list(userId, { sortBy: { column: "name", order: "desc" } });

    if (listPicturesError) {
      console.error(listPicturesError);
    } else {
      console.log("picturesList", picturesList);
      setPicturesList(picturesList);
    }
  };

  const [pictures, setPictures] = useState();
  const getPictures = async () => {
    const userId = amITheClient ? user.id : selectedClientId;
    const signedUrls = picturesList.map(({ name }) => `${userId}/${name}`);
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
  };

  useEffect(() => {
    if (picturesList) {
      getPictures();
    }
  }, [picturesList]);

  useEffect(() => {
    getPicturesList();
  }, [selectedClientId]);

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
          {pictures?.map((picture) => (
            <li key={picture.path} className="relative">
              <div className="group block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                <MyLink
                  onClick={() => {
                    setSelectedDate(picture.date);
                  }}
                  href={`/account/diary?date=${picture.date.toDateString()}`}
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
              <p className="pointer-events-none block text-sm font-medium text-gray-500">
                weight
              </p>
            </li>
          ))}
        </ul>
        {pictures && (
          <Pagination
            name={"picture"}
            numberOfResults={pictures.length}
            numberOfResultsPerPage={numberOfPicturesPerPage}
            pageIndex={0}
            setPageIndex={() => {}}
            showPrevious={() => {}}
            showNext={() => {}}
          />
        )}
      </div>
    </>
  );
}

Photos.getLayout = getAccountLayout;
