/* eslint-disable react/destructuring-assignment */
import { useState, useEffect } from "react";
import { useUser } from "../../../context/user-context";
import Modal from "../../Modal";

export default function DeleteSubscriptionModal(props) {
  const {
    open,
    setOpen,
    selectedResult: selectedSubscription,
    setDeleteResultStatus: setDeleteSubscriptionStatus,
    setShowDeleteResultNotification: setShowDeleteSubscriptionNotification,
  } = props;
  const [isDeleting, setIsDeleting] = useState(false);
  const [didDelete, setDidDelete] = useState(false);
  const { fetchWithAccessToken } = useUser();

  useEffect(() => {
    if (open) {
      setIsDeleting(false);
      setDidDelete(false);
    }
  }, [open]);

  return (
    <Modal
      {...props}
      title="Delete Subscription"
      message="Are you sure you want to delete this subscription? This action cannot be undone."
      color="red"
      Button={
        <button
          role="button"
          onClick={async () => {
            setIsDeleting(true);
            const response = await fetchWithAccessToken(
              `/api/subscription/delete-subscription?subscriptionId=${selectedSubscription.id}`
            );
            setIsDeleting(false);
            setDidDelete(true);
            const { status } = await response.json();
            setDeleteSubscriptionStatus(status);
            setShowDeleteSubscriptionNotification(true);
            setOpen(false);
          }}
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
        >
          {/* eslint-disable-next-line no-nested-ternary */}
          {isDeleting
            ? "Deleting Subscription..."
            : didDelete
            ? "Deleted Subscription!"
            : "Delete Subscription"}
        </button>
      }
    ></Modal>
  );
}
