import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "../../context/user-context";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import { useClient } from "../../context/client-context";
import Head from "next/head";
import ClientsSelect from "../../components/account/ClientsSelect";
import Pagination from "../../components/Pagination";

const files = [
  {
    title: "IMG_4985.HEIC",
    size: "3.9 MB",
    source:
      "https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80",
  },
  {
    title: "IMG_4985.HEIC",
    size: "3.9 MB",
    source:
      "https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80",
  },
  {
    title: "IMG_4985.HEIC",
    size: "3.9 MB",
    source:
      "https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80",
  },
  {
    title: "IMG_4985.HEIC",
    size: "3.9 MB",
    source:
      "https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80",
  },
  {
    title: "IMG_4985.HEIC",
    size: "3.9 MB",
    source:
      "https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80",
  },
  {
    title: "IMG_4985.HEIC",
    size: "3.9 MB",
    source:
      "https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80",
  },
  {
    title: "IMG_4985.HEIC",
    size: "3.9 MB",
    source:
      "https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80",
  },
  {
    title: "IMG_4985.HEIC",
    size: "3.9 MB",
    source:
      "https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80",
  },
  // More files...
];

export default function Photos() {
  const router = useRouter();
  const { isAdmin, user } = useUser();
  const { selectedClient } = useClient();
  const [pictures, setPictures] = useState();

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
          {files.map((file, index) => (
            <li key={index} className="relative">
              <div className="group aspect-w-10 aspect-h-7 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                <img
                  src={file.source}
                  alt=""
                  className="pointer-events-none object-cover group-hover:opacity-75"
                />
                <button
                  type="button"
                  className="absolute inset-0 focus:outline-none"
                >
                  <span className="sr-only">View details for {file.title}</span>
                </button>
              </div>
              <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">
                {file.title}
              </p>
              <p className="pointer-events-none block text-sm font-medium text-gray-500">
                {file.size}
              </p>
            </li>
          ))}
        </ul>
        <Pagination
          name={"pictures"}
          numberOfResults={99}
          numberOfResultsPerPage={20}
          pageIndex={0}
          setPageIndex={() => {}}
          showPrevious={() => {}}
          showNext={() => {}}
        />
      </div>
    </>
  );
}

Photos.getLayout = getAccountLayout;
