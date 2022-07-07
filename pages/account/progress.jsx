/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
import { useState } from "react";
import { useUser } from "../../context/user-context";
import MyLink from "../../components/MyLink";
import { getAccountLayout } from "../../components/layouts/AccountLayout";

export default function Progress() {
  return (
    <>
      <div className="space-y-6 bg-white px-4 pb-2 pt-6 sm:px-6 sm:pt-6">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Progress
          </h3>
          <p className="mt-1 text-sm text-gray-500">view progress</p>
        </div>
        hello
      </div>
    </>
  );
}

Progress.getLayout = getAccountLayout;
