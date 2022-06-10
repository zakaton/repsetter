/* eslint-disable react/destructuring-assignment */
import { useState } from "react";
import { useUser } from "../../../context/user-context";
import Modal from "../../Modal";
import { CurrencyDollarIcon } from "@heroicons/react/outline";

export default function CreateSubscriptionModal(props) {
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);
  const { fetchWithAccessToken } = useUser();

  return (
    <Modal
      {...props}
      title="Create Subscription"
      message="lol"
      Icon={CurrencyDollarIcon}
      Button={
        <button
          type="button"
          onClick={async () => {
            // FILL
            setIsCreatingSubscription(true);
          }}
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
        >
          {isCreatingSubscription
            ? "Creating Subscription..."
            : "Create Subscription"}
        </button>
      }
    ></Modal>
  );
}
