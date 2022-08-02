/* eslint-disable react/destructuring-assignment */
import { useState } from "react";
import { useUser } from "../../../context/user-context";
import Modal from "../../Modal";
import { ExclamationIcon } from "@heroicons/react/outline";

export default function DeleteAccountModal(props) {
  const { deleteAccount } = useUser();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  return (
    <Modal
      {...props}
      title="Delete Account"
      message="Are you sure you want to delete your account? All of your data will be permanently removed from our servers forever. This includes exercises, bodyweight, pictures, and coaching subscriptions. This action cannot be undone."
      color="red"
      Icon={ExclamationIcon}
      Button={
        <button
          type="button"
          onClick={async () => {
            setIsDeletingAccount(true);
            await deleteAccount();
          }}
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
        >
          {isDeletingAccount ? "Deleting Account..." : "Delete Account"}
        </button>
      }
    ></Modal>
  );
}
